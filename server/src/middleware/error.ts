import type { Request, Response, NextFunction } from 'express'

export class HttpError extends Error {
  status: number
  details?: unknown
  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` })
}

const CORS_ERR_PATTERN = /Origin .* not allowed by CORS/

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Known, structured errors — surface as-is.
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) })
    return
  }

  // CORS rejections from our cors() origin callback used to fall into the
  // generic 500 path with the misleading message "Internal server error".
  // Recognise them and return a clean 403 with the actual reason instead.
  if (err instanceof Error && CORS_ERR_PATTERN.test(err.message)) {
    console.warn(`[cors] rejected ${req.method} ${req.path} — origin "${req.headers.origin ?? ''}" not in allow-list`)
    res.status(403).json({ error: err.message })
    return
  }

  // Everything else — log method + path + stack so production debugging works,
  // then return a generic 500. The body stays generic so we don't leak details.
  const tag = `${req.method} ${req.path}`
  if (err instanceof Error) {
    console.error(`✗ Unhandled error on ${tag}:`, err.stack ?? err.message)
  } else {
    console.error(`✗ Unhandled non-Error thrown on ${tag}:`, err)
  }
  res.status(500).json({ error: 'Internal server error' })
}
