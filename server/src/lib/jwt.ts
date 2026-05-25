import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface JwtPayload {
  uid: string
  phone: string
  isAdmin: boolean
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload
}
