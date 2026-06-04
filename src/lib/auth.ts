/**
 * Auth client — Google OAuth ID-token flow.
 *
 * Flow:
 *   1. `renderGoogleButton()` in google-auth.ts loads GIS + paints the button.
 *   2. User clicks the button → Google popup → returns an ID token to the
 *      callback as `credential`.
 *   3. We POST that credential to /api/auth/google. Server verifies it,
 *      upserts the user, and returns { token, user, isNewUser }.
 *   4. AuthContext stores token + user (loginWithToken).
 */
import { api } from './api'
import type { User } from '@/types'

export interface GoogleSignInResult {
  token: string
  user: User
  isNewUser: boolean
}

export function signInWithGoogle(credential: string): Promise<GoogleSignInResult> {
  return api<GoogleSignInResult>('/api/auth/google', {
    body: { credential },
  })
}
