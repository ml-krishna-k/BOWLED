import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/Button'
import { sendOtp, verifyOtp } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { maskPhone } from '@/lib/format'

interface OtpState {
  phone: string
  mode: 'login' | 'signup'
  demoOtp?: string
  name?: string
}

export function OtpPage() {
  const navigate = useNavigate()
  const loc = useLocation()
  const state = (loc.state ?? {}) as Partial<OtpState>
  const { loginWithToken } = useAuth()

  const [otp, setOtp] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(30)
  const [demoOtp, setDemoOtp] = useState(state.demoOtp ?? '')

  useEffect(() => {
    if (!state.phone || !state.mode) {
      navigate('/auth/login', { replace: true })
    }
  }, [state, navigate])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  async function complete(code: string) {
    if (!state.phone) return
    setVerifying(true)
    setErrorMsg(null)
    try {
      const result = await verifyOtp(
        state.phone,
        code,
        state.mode === 'signup' ? state.name : undefined,
      )
      loginWithToken(result.token, result.user)

      if (result.user.isAdmin) {
        navigate('/admin/overview', { replace: true })
        return
      }

      navigate('/app/home', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setErrorMsg("That OTP doesn't match. Please try again.")
        else if (err.status === 404) setErrorMsg('No account found for this number. Sign up first.')
        else setErrorMsg(err.message)
      } else {
        setErrorMsg('Something went wrong. Please try again.')
      }
      setOtp('')
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    if (!state.phone || resendIn > 0) return
    try {
      const res = await sendOtp(state.phone)
      setDemoOtp(res.demoOtp ?? '')
      setResendIn(30)
    } catch {
      /* swallow */
    }
  }

  if (!state.phone) return null

  const isSignup = state.mode === 'signup'

  return (
    <AuthShell
      step={isSignup ? { current: 2, total: 2, label: 'Verify' } : undefined}
    >
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <p className="text-eyebrow">Verify</p>
          <span aria-hidden className="h-px flex-1 max-w-[5rem] bg-cream-300" />
          <span className="text-chapter text-sm text-saffron-500 tabular-nums">
            {isSignup ? '02 / 02' : 'OTP'}
          </span>
        </div>
        <h1 className="mt-3 text-display text-4xl sm:text-5xl tracking-[-0.025em] leading-[1.04] text-ink-900">
          Enter your <span className="italic font-light text-saffron-600">code.</span>
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-ink-900">{maskPhone(state.phone)}</span>
          {' '}—{' '}
          <Link
            to="/auth/login"
            className="text-saffron-700 underline underline-offset-4 decoration-saffron-300 hover:text-saffron-600"
          >
            change number
          </Link>
        </p>
      </div>

      <div className="mt-9 space-y-5 animate-fade-up delay-100">
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v)
            if (errorMsg) setErrorMsg(null)
          }}
          onComplete={complete}
          error={!!errorMsg}
          autoFocus
        />

        {errorMsg && (
          <p className="text-sm text-spice-700 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-spice-500" />
            {errorMsg}
          </p>
        )}

        {demoOtp && (
          <div className="relative rounded-2xl border border-dashed border-saffron-300 bg-saffron-50/70 px-5 py-4 ring-inset-warm">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-eyebrow text-saffron-700">Demo OTP</p>
              <p className="text-editorial text-2xl text-saffron-700 tabular-nums tracking-wider">
                {demoOtp}
              </p>
            </div>
            <p className="mt-1.5 caption text-xs text-saffron-700/80">
              No SMS goes out — the server returns a deterministic OTP for development.
            </p>
          </div>
        )}

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => complete(otp)}
          disabled={otp.length !== 6 || verifying}
          trailing={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          }
        >
          {verifying ? 'Verifying…' : 'Verify & continue'}
        </Button>

        <div className="hairline" />

        <p className="text-center caption text-ink-500">
          Didn&apos;t get it?{' '}
          <button
            onClick={resend}
            disabled={resendIn > 0}
            className="not-italic font-medium text-saffron-700 disabled:text-ink-400 underline underline-offset-4 decoration-saffron-300 disabled:no-underline transition-colors"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </AuthShell>
  )
}
