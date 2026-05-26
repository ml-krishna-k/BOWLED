/**
 * MSG91 OTP Widget — client-side wrapper.
 *
 * Flow:
 *   1. `initWidget()` lazy-loads MSG91's script tag and calls `initSendOTP`
 *   2. `widgetSendOtp(phone)` → MSG91 sends the SMS, returns when accepted
 *   3. User enters OTP in our existing OtpInput UI
 *   4. `widgetVerifyOtp(otp)` → MSG91 returns a signed access-token (JWT)
 *   5. Client POSTs the access-token to /api/auth/widget/verify, server validates
 *
 * Widget config is exposed as VITE_MSG91_WIDGET_ID + VITE_MSG91_TOKEN_AUTH.
 * Both are safe to ship in the bundle — MSG91 designed `tokenAuth` for client
 * exposure (your real Auth Key stays server-side).
 */

const WIDGET_SRC = 'https://verify.msg91.com/otp-provider.js'

interface InitConfig {
  widgetId: string
  tokenAuth: string
  exposeMethods?: boolean
}

interface CallbackData {
  type?: string
  message?: string
  request_id?: string
}

type SuccessCb = (data: CallbackData | string) => void
type ErrorCb = (error: CallbackData | string) => void

declare global {
  interface Window {
    initSendOTP?: (config: InitConfig) => void
    sendOtp?: (identifier: string, success: SuccessCb, error: ErrorCb) => void
    verifyOtp?: (otp: string, success: SuccessCb, error: ErrorCb) => void
    retryOtp?: (channel: string, success: SuccessCb, error: ErrorCb) => void
  }
}

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID ?? ''
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH ?? ''

/** True when both VITE_MSG91_* env vars are populated. */
export function isWidgetConfigured(): boolean {
  return Boolean(WIDGET_ID && TOKEN_AUTH)
}

let loadPromise: Promise<void> | null = null
let initialized = false

function loadScript(): Promise<void> {
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    if (window.initSendOTP) return resolve()
    const s = document.createElement('script')
    s.src = WIDGET_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load MSG91 widget script'))
    }
    document.head.appendChild(s)
  })
  return loadPromise
}

/** Idempotent — safe to call from multiple places, only initialises once. */
export async function initWidget(): Promise<void> {
  if (!isWidgetConfigured()) {
    throw new Error('MSG91 widget not configured (VITE_MSG91_WIDGET_ID, VITE_MSG91_TOKEN_AUTH)')
  }
  await loadScript()
  if (!initialized && window.initSendOTP) {
    window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true,
    })
    initialized = true
  }
}

function extractMessage(payload: CallbackData | string): string {
  if (typeof payload === 'string') return payload
  return payload?.message ?? 'MSG91 widget error'
}

/** Trigger SMS OTP via MSG91. `phone` is a 10-digit Indian number. */
export async function widgetSendOtp(phone: string): Promise<void> {
  await initWidget()
  return new Promise((resolve, reject) => {
    if (!window.sendOtp) return reject(new Error('Widget sendOtp not available'))
    window.sendOtp(
      `91${phone}`,
      () => resolve(),
      (err) => reject(new Error(extractMessage(err))),
    )
  })
}

/**
 * Verify the OTP via MSG91 and return the signed access-token that the
 * server can then exchange for our own JWT.
 */
export async function widgetVerifyOtp(otp: string): Promise<string> {
  await initWidget()
  return new Promise((resolve, reject) => {
    if (!window.verifyOtp) return reject(new Error('Widget verifyOtp not available'))
    window.verifyOtp(
      otp,
      (data) => {
        // MSG91 returns the access-token in `data.message` on success.
        const token = typeof data === 'string' ? data : data?.message
        if (!token) return reject(new Error('Widget returned no access-token'))
        resolve(token)
      },
      (err) => reject(new Error(extractMessage(err))),
    )
  })
}
