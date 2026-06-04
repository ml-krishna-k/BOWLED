import jwt from 'jsonwebtoken'
import { config } from '../config.js'

/**
 * Session-token payload. `email` is the primary identifier post-Google-OAuth.
 * `phone` is retained for backwards compat with the qr-pass scan path that
 * may still log it; if your route doesn't need it, just omit at sign time.
 */
export interface JwtPayload {
  uid: string
  email: string
  isAdmin: boolean
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload
}
