/**
 * Thin wrapper over the API endpoints in /api/auth/*.
 *
 * The server still uses a mock OTP (deterministic from the phone number) so
 * the demo flow remains testable end-to-end without an SMS provider.
 */
import { api } from './api'
import type { User } from '@/types'

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone)
}

export async function sendOtp(phone: string): Promise<{ ok: true; demoOtp?: string }> {
  // `demoOtp` is only returned in dev mode (when no SMS provider is configured).
  // In production with MSG91 wired up, the field is absent and the UI relies on
  // the real SMS instead.
  const data = await api<{ ok: true; demoOtp?: string }>('/api/auth/otp/send', { body: { phone } })
  return data
}

export interface VerifyResult {
  token: string
  user: User
  isNewUser: boolean
}

/**
 * @param phone   10-digit phone
 * @param otp     6-digit OTP entered by the user
 * @param name    optional — provide on signup so the server can create the user
 */
export async function verifyOtp(phone: string, otp: string, name?: string): Promise<VerifyResult> {
  return api<VerifyResult>('/api/auth/otp/verify', {
    body: { phone, otp, ...(name ? { name } : {}) },
  })
}
