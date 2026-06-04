/**
 * Google Identity Services (GIS) loader + Sign-In button helper.
 *
 * Approach: ID-token flow (the modern one).
 *  - We render Google's official button widget into a target element.
 *  - On click, Google authenticates the user in a popup and returns a
 *    signed JWT (the "credential") to our callback.
 *  - We POST that JWT to /api/auth/google for server-side verification.
 *
 * The GIS script is loaded from accounts.google.com — no npm package, no
 * bundle weight. We lazily inject the <script> tag on first need so the
 * landing page doesn't pay the cost.
 *
 * Docs: https://developers.google.com/identity/gsi/web/guides/overview
 */

export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? ''

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

/* ---------- Minimal type surface — we only use a handful of GIS APIs. */

interface GoogleCredentialResponse {
  credential: string
  select_by?: string
}

interface GoogleAccountsIdConfig {
  client_id: string
  callback: (resp: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  use_fedcm_for_prompt?: boolean
  ux_mode?: 'popup' | 'redirect'
  context?: 'signin' | 'signup' | 'use'
}

interface GoogleButtonConfig {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
  locale?: string
}

interface GoogleAccountsId {
  initialize(config: GoogleAccountsIdConfig): void
  renderButton(parent: HTMLElement, opts: GoogleButtonConfig): void
  prompt(): void
  cancel(): void
  disableAutoSelect(): void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

/** Returns true once the GIS script is ready on `window.google.accounts.id`. */
export function isGsiReady(): boolean {
  return typeof window !== 'undefined' && !!window.google?.accounts?.id
}

let scriptPromise: Promise<void> | null = null

/**
 * Lazily insert the GIS script into <head>. Resolves when `window.google`
 * is populated. Idempotent — concurrent callers share the same promise.
 */
export function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (isGsiReady()) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`)
    const handleLoad = () => {
      // The script sets window.google synchronously when it parses, but
      // there is a one-tick delay before accounts.id is fully callable.
      const waitForReady = (tries = 0) => {
        if (isGsiReady()) {
          resolve()
        } else if (tries < 20) {
          setTimeout(() => waitForReady(tries + 1), 50)
        } else {
          reject(new Error('Google Identity Services failed to initialise'))
        }
      }
      waitForReady()
    }

    if (existing) {
      if (isGsiReady()) {
        resolve()
      } else {
        existing.addEventListener('load', handleLoad, { once: true })
        existing.addEventListener('error', () => reject(new Error('GSI script failed to load')), { once: true })
      }
      return
    }

    const s = document.createElement('script')
    s.src = GSI_SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = handleLoad
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Could not load Google Sign-In — check your connection'))
    }
    document.head.appendChild(s)
  })

  return scriptPromise
}

export interface RenderButtonOptions {
  /** Container <div> the official Google button will be injected into. */
  target: HTMLElement
  /** Called with the Google ID-token credential when the user signs in. */
  onCredential: (credential: string) => void
  /** Optional button width override. */
  width?: number
  /** Button text variant. Default: 'continue_with' (best for first-time + return users). */
  text?: GoogleButtonConfig['text']
}

/**
 * Loads GIS if needed, initialises with our client id, and renders the
 * official Google button into the target element. Throws if the client id
 * isn't configured.
 */
export async function renderGoogleButton(opts: RenderButtonOptions): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google sign-in is not configured (VITE_GOOGLE_CLIENT_ID is missing).')
  }
  await loadGsiScript()
  const id = window.google!.accounts.id
  id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (resp) => {
      if (resp?.credential) opts.onCredential(resp.credential)
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    ux_mode: 'popup',
    context: 'signin',
  })
  id.renderButton(opts.target, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: opts.text ?? 'continue_with',
    shape: 'pill',
    logo_alignment: 'left',
    width: opts.width ?? 320,
  })
}
