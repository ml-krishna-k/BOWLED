import type { Request } from 'express'
import type { ZodTypeAny, z } from 'zod'
import { HttpError } from '../middleware/error.js'

/**
 * Parse and validate `req.body` against a zod schema. On failure throws
 * a 400 `HttpError` with a flat `details.fieldErrors` map that the client
 * can render next to inputs.
 */
export function parseBody<S extends ZodTypeAny>(schema: S, req: Request): z.infer<S> {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const fieldErrors = flattenIssues(result.error.issues)
    throw new HttpError(400, firstMessage(result.error.issues), { fieldErrors })
  }
  return result.data
}

function flattenIssues(
  issues: { path: (string | number)[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path.join('.') || '_root'
    if (!out[key]) out[key] = issue.message
  }
  return out
}

function firstMessage(issues: { path: (string | number)[]; message: string }[]): string {
  if (!issues.length) return 'Validation failed'
  const i = issues[0]
  const path = i.path.join('.')
  return path ? `${path}: ${i.message}` : i.message
}
