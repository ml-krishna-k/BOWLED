import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { signInWithGoogle } from '@/lib/auth'
import { renderGoogleButton, GOOGLE_CLIENT_ID } from '@/lib/google-auth'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'

/**
 * Single auth surface — both signup and signin go through here.
 * Google OAuth handles "is this a returning user vs. a new one"; on our
 * server, an unrecognised `sub` upserts a new user, otherwise we look up
 * the existing one. Either way you end up logged in.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gsiReady, setGsiReady] = useState(false)

  // Render the Google button once the container is mounted.
  useEffect(() => {
    if (!buttonRef.current) return
    let cancelled = false

    renderGoogleButton({
      target: buttonRef.current,
      width: 320,
      text: 'continue_with',
      onCredential: async (credential) => {
        if (cancelled) return
        setLoading(true)
        setError(null)
        try {
          const { token, user } = await signInWithGoogle(credential)
          loginWithToken(token, user)
          // Admins go to the admin console; everyone else lands in /app/home.
          // AppShell pushes new subscribers to /app/subscription if they
          // don't have an active plan yet.
          navigate(user.isAdmin ? '/admin/overview' : '/app/home', { replace: true })
        } catch (err) {
          if (err instanceof ApiError) {
            setError(err.message)
          } else {
            setError('Something went wrong signing you in. Please try again.')
          }
          setLoading(false)
        }
      },
    })
      .then(() => {
        if (!cancelled) setGsiReady(true)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load Google sign-in')
      })

    return () => {
      cancelled = true
    }
  }, [loginWithToken, navigate])

  return (
    <AuthShell
      footer={
        <>
          By continuing you agree to our{' '}
          <a className="not-italic underline underline-offset-4 decoration-saffron-300 hover:text-saffron-700" href="#">Terms</a> and{' '}
          <a className="not-italic underline underline-offset-4 decoration-saffron-300 hover:text-saffron-700" href="#">Privacy</a>.
        </>
      }
    >
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <p className="text-eyebrow">Welcome</p>
          <span aria-hidden className="h-px flex-1 max-w-[5rem] bg-cream-300" />
          <span className="text-chapter text-sm text-saffron-500 tabular-nums">Sign in</span>
        </div>
        <h1 className="mt-3 text-display text-4xl sm:text-5xl tracking-[-0.025em] leading-[1.04] text-ink-900">
          Continue to <span className="italic font-light text-saffron-600">Bowled.</span>
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">
          Sign in with your Google account. New here? We&apos;ll set you up automatically — no extra forms.
        </p>
      </div>

      <div className="mt-9 space-y-5 animate-fade-up delay-100">
        {!GOOGLE_CLIENT_ID && (
          <div className="rounded-2xl border border-spice-500/30 bg-spice-50 px-4 py-3 text-sm text-spice-700">
            <p className="font-semibold">Google sign-in not configured</p>
            <p className="mt-1 caption text-xs">
              Set <span className="font-mono not-italic">VITE_GOOGLE_CLIENT_ID</span> in your <span className="font-mono not-italic">.env</span> and reload.
            </p>
          </div>
        )}

        {/* Container — the official Google button is rendered into this div */}
        <div className="flex justify-center">
          <div
            ref={buttonRef}
            aria-label="Sign in with Google"
            className={loading ? 'opacity-50 pointer-events-none' : ''}
          />
        </div>

        {!gsiReady && GOOGLE_CLIENT_ID && !error && (
          <p className="text-center caption text-xs text-ink-500">
            Loading Google sign-in…
          </p>
        )}

        {loading && (
          <p className="text-center caption text-sm text-ink-700 inline-flex items-center justify-center gap-2 w-full">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse-dot" />
            Signing you in…
          </p>
        )}

        {error && (
          <div className="rounded-2xl border border-spice-500/30 bg-spice-50 px-4 py-3 text-sm text-spice-700">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 hairline" />

      <p className="mt-6 caption text-ink-500">
        We never see your Google password. Bowled receives your email, name and profile picture only.
      </p>
    </AuthShell>
  )
}
