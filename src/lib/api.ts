/**
 * Frontend API client.
 *
 * In dev, requests go to /api/* and Vite proxies to the Node server on :4000.
 * In production, set VITE_API_URL to the deployed API base. The JWT lives in
 * localStorage and is attached to every request.
 */

const TOKEN_KEY = 'kf.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode etc. */
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  details?: unknown
  reason?: string
  constructor(status: number, message: string, opts?: { details?: unknown; reason?: string }) {
    super(message)
    this.status = status
    this.details = opts?.details
    this.reason = opts?.reason
  }
}

interface RequestOpts extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown
  headers?: Record<string, string>
}

export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(opts.headers ?? {}),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? (body ? 'POST' : 'GET'),
    headers,
    body,
    credentials: 'omit',
  })

  // Auth expired — auto-clear so the next route guard kicks in.
  if (res.status === 401) {
    setToken(null)
  }

  const text = await res.text()
  const data: unknown = text ? safeJsonParse(text) : null

  if (!res.ok) {
    const message = isErrorBody(data) ? data.error : `Request failed (${res.status})`
    const reason = isErrorBody(data) && typeof data.details === 'object' && data.details !== null && 'reason' in data.details
      ? String((data.details as { reason: unknown }).reason)
      : undefined
    throw new ApiError(res.status, message, { details: isErrorBody(data) ? data.details : undefined, reason })
  }

  return data as T
}

function safeJsonParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}
function isErrorBody(d: unknown): d is { error: string; details?: unknown } {
  return !!d && typeof d === 'object' && 'error' in d && typeof (d as { error: unknown }).error === 'string'
}
