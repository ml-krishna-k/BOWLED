/**
 * Auth client. Has two backends:
 *
 *   Widget mode  (VITE_MSG91_WIDGET_ID + VITE_MSG91_TOKEN_AUTH set) —
 *     MSG91's browser widget sends + verifies the OTP; server only validates
 *     the returned access-token.
 *
 *   Legacy mode  (no widget env) — server sends OTP via MSG91 API (prod)
 *     or returns a deterministic mock OTP (dev fallback).
 *
 * Public API stays the same — `sendOtp(phone)` then `verifyOtp(phone, otp, name?)`.
 */
import { api } from './api'
import type { User } from '@/types'
import {
  isWidgetConfigured,
  widgetSendOtp,
  widgetVerifyOtp,
} from './msg91Widget'

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone)
}

// Phones that bypass the MSG91 widget — QA / demo logins.
// Built-ins mirror BUILTIN_TEST_PHONES on the server. VITE_TEST_PHONES adds
// extras. The OTP itself is enforced server-side; the frontend just needs
// to know which numbers to skip the widget for.
const BUILTIN_TEST_PHONES = ['9360113501', '6380825525'] as const

const TEST_PHONES = new Set<string>([
  ...BUILTIN_TEST_PHONES,
  ...(import.meta.env.VITE_TEST_PHONES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[6-9]\d{9}$/.test(s)),
])

function isTestPhone(phone: string): boolean {
  return TEST_PHONES.has(phone)
}

export async function sendOtp(phone: string): Promise<{ ok: true; demoOtp?: string }> {
  // Test phones skip the widget — go straight to the server's mock path.
  if (isTestPhone(phone)) {
    return api<{ ok: true; demoOtp?: string }>('/api/auth/otp/send', { body: { phone } })
  }
  if (isWidgetConfigured()) {
    await widgetSendOtp(phone)
    return { ok: true }
  }
  // Legacy path: server sends the OTP (real MSG91 API or mock fallback).
  return api<{ ok: true; demoOtp?: string }>('/api/auth/otp/send', { body: { phone } })
}

export interface VerifyResult {
  token: string
  user: User
  isNewUser: boolean
}

/**
 * @param phone   10-digit phone (kept for the legacy path; widget already knows it)
 * @param otp     OTP entered by the user
 * @param name    provide on signup so the server can create the user
 */
export async function verifyOtp(phone: string, otp: string, name?: string): Promise<VerifyResult> {
  // Test phones use the legacy verify path so the hard-coded OTP matches.
  if (isTestPhone(phone)) {
    return api<VerifyResult>('/api/auth/otp/verify', {
      body: { phone, otp, ...(name ? { name } : {}) },
    })
  }
  if (isWidgetConfigured()) {
    const accessToken = await widgetVerifyOtp(otp)
    return api<VerifyResult>('/api/auth/widget/verify', {
      body: { accessToken, ...(name ? { name } : {}) },
    })
  }
  return api<VerifyResult>('/api/auth/otp/verify', {
    body: { phone, otp, ...(name ? { name } : {}) },
  })
}
