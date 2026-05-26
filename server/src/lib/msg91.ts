/**
 * Thin client over MSG91's OTP API.
 *
 * Send  → POST https://control.msg91.com/api/v5/otp
 *         (MSG91 generates the OTP from the template and SMS-es the user)
 * Verify → POST https://control.msg91.com/api/v5/otp/verify
 *
 * Reference: https://docs.msg91.com/p/tf9GTextN/e/lpHnE6BAJV/MSG91
 */
import { config } from '../config.js'

const BASE = 'https://control.msg91.com/api/v5/otp'

interface Msg91Response {
  type?: 'success' | 'error'
  message?: string
  request_id?: string
}

async function call(path: string, params: Record<string, string>): Promise<Msg91Response> {
  const url = `${BASE}${path}?${new URLSearchParams(params).toString()}`
  // Redact authkey in logs.
  const logSafeUrl = url.replace(config.msg91.apiKey, '<authkey>')
  if (config.nodeEnv !== 'production') {
    console.log(`[msg91] → POST ${logSafeUrl}`)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'authkey': config.msg91.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })
  const text = await res.text()
  let body: Msg91Response = {}
  try { body = text ? JSON.parse(text) : {} } catch { /* keep empty */ }

  if (config.nodeEnv !== 'production') {
    console.log(`[msg91] ← ${res.status} ${text}`)
  }

  if (!res.ok || body.type === 'error') {
    throw new Error(`MSG91 ${path} failed (${res.status}): ${body.message ?? text}`)
  }
  return body
}

function generateOtp(length = 4): string {
  let s = ''
  for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10).toString()
  return s
}

/**
 * Generate an OTP, hand it to MSG91 to SMS, and return it to the caller.
 *
 * We generate the OTP ourselves (rather than letting MSG91 auto-generate)
 * so we can log it on the server during development — useful when SMS
 * delivery has carrier-side issues. MSG91 still records the value
 * server-side; verification via `/api/v5/otp/verify` works the same way.
 */
export async function sendOtp(phone: string): Promise<{ requestId?: string; otp: string }> {
  const otp = generateOtp(4)
  const params: Record<string, string> = {
    template_id: config.msg91.templateId,
    mobile: `${config.msg91.countryCode}${phone}`,
    otp,
  }
  // We intentionally do NOT pass `sender` here. The DLT-approved sender is
  // bound to the template inside MSG91/DLT; passing a mismatched sender from
  // our side can route the SMS off the DLT path and get it dropped by
  // Indian carriers (even though MSG91's gateway will still report DLVRD).
  const body = await call('', params)
  if (config.nodeEnv !== 'production') {
    console.log(`[msg91] OTP for ${phone} = ${otp}  (request_id: ${body.request_id})`)
  }
  return { requestId: body.request_id, otp }
}

/**
 * Verify an MSG91 OTP-Widget access-token. The widget runs in the browser,
 * handles the SMS round-trip itself, and on success hands the client a signed
 * JWT (the "access-token"). The client POSTs it to our /api/auth/widget/verify
 * which calls this function.
 *
 * Returns the mobile number MSG91 verified.
 * Reference: https://docs.msg91.com/p/tf9GTextN/e/tHpoTOpcRq/MSG91
 */
export async function verifyWidgetAccessToken(accessToken: string): Promise<string> {
  const url = 'https://api.msg91.com/api/v5/widget/verifyAccessToken'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authkey: config.msg91.apiKey,
      'access-token': accessToken,
    }),
  })
  const text = await res.text()
  let body: Msg91Response & { mobile?: string } = {}
  try { body = text ? JSON.parse(text) : {} } catch { /* keep empty */ }

  if (config.nodeEnv !== 'production') {
    console.log(`[msg91:widget] ← ${res.status} ${text}`)
  }

  if (!res.ok || body.type === 'error') {
    throw new Error(`MSG91 widget verify failed (${res.status}): ${body.message ?? text}`)
  }
  // Successful responses include the verified mobile either as `message`
  // (legacy widget responses) or `mobile` (newer ones). Try both.
  const mobile = body.mobile ?? body.message
  if (!mobile) throw new Error('MSG91 widget verify returned no mobile number')
  return mobile
}

/**
 * Verify an OTP against MSG91's record. Throws on error.
 * Returns true if the OTP matched.
 */
export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  try {
    const body = await call('/verify', {
      mobile: `${config.msg91.countryCode}${phone}`,
      otp,
    })
    return body.type === 'success'
  } catch (err) {
    // MSG91 returns HTTP 400 with type:"error" and message:"OTP not match"
    // when the code is wrong. Surface that as a normal "false" rather than throw.
    const msg = err instanceof Error ? err.message : String(err)
    if (/not match|not verified|invalid/i.test(msg)) return false
    throw err
  }
}
