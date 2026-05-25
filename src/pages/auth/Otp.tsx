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

      // No auto-subscribe — plan/group selection happens inside the app.
      // AppShell redirects any logged-in user without a subscription to
      // /app/subscription, so the user lands there naturally.
      navigate('/app/home', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setErrorMsg('That OTP doesn\'t match. Please try again.')
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

  return (
    <AuthShell
      step={state.mode === 'signup' ? { current: 2, total: 2, label: 'Verify' } : undefined}
    >
      <p className="text-eyebrow">Verify</p>
      <h1 className="mt-3 text-display text-4xl text-ink-900">Enter your OTP</h1>
      <p className="mt-3 text-ink-500">
        We sent a 6-digit code to <span className="font-medium text-ink-900">{maskPhone(state.phone)}</span>{' '}
        — <Link to="/auth/login" className="text-saffron-700 underline">change number</Link>
      </p>

      <div className="mt-8 space-y-4">
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
          <p className="text-sm text-spice-500">{errorMsg}</p>
        )}

        {demoOtp && (
          <div className="rounded-2xl border border-dashed border-saffron-300 bg-saffron-50 px-4 py-3 text-sm text-saffron-700">
            <p className="font-semibold">Demo OTP · {demoOtp}</p>
            <p className="text-xs text-saffron-700/80">
              No SMS goes out — the server returns a deterministic OTP for development.
            </p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => complete(otp)}
          disabled={otp.length !== 6 || verifying}
        >
          {verifying ? 'Verifying…' : 'Verify & continue'}
        </Button>

        <p className="text-center text-sm text-ink-500">
          Didn't get it?{' '}
          <button
            onClick={resend}
            disabled={resendIn > 0}
            className="font-medium text-saffron-700 disabled:text-ink-400 hover:underline disabled:no-underline"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </AuthShell>
  )
}
