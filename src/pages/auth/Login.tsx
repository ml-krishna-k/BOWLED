import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/Button'
import { isValidIndianPhone, sendOtp } from '@/lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidIndianPhone(phone)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError(undefined)
    setSending(true)
    const res = await sendOtp(phone)
    setSending(false)
    navigate('/auth/otp', { state: { phone, mode: 'login', demoOtp: res.demoOtp } })
  }

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
          <p className="text-eyebrow">Welcome back</p>
          <span aria-hidden className="h-px flex-1 max-w-[5rem] bg-cream-300" />
          <span className="text-chapter text-sm text-saffron-500 tabular-nums">Sign in</span>
        </div>
        <h1 className="mt-3 text-display text-4xl sm:text-5xl tracking-[-0.025em] leading-[1.04] text-ink-900">
          Log in to <span className="italic font-light text-saffron-600">Bowled.</span>
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">
          We&apos;ll send a 6-digit code to your registered mobile.
        </p>
      </div>

      <form onSubmit={submit} className="mt-9 space-y-5 animate-fade-up delay-100">
        <PhoneInput value={phone} onChange={setPhone} error={error} autoFocus />

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={sending}
          trailing={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          }
        >
          {sending ? 'Sending OTP…' : 'Send OTP'}
        </Button>
      </form>

      <div className="mt-8 hairline" />

      <p className="mt-6 caption text-ink-500">
        New here?{' '}
        <Link to="/auth/signup" className="not-italic font-medium text-saffron-700 underline underline-offset-4 decoration-saffron-300 hover:text-saffron-600">
          Start your subscription →
        </Link>
      </p>
    </AuthShell>
  )
}
