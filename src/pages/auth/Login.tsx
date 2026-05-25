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
          <a className="underline" href="#">Terms</a> and{' '}
          <a className="underline" href="#">Privacy</a>.
        </>
      }
    >
      <p className="text-eyebrow">Welcome back</p>
      <h1 className="mt-3 text-display text-4xl text-ink-900">Log in to Bowled</h1>
      <p className="mt-3 text-ink-500">
        We'll send a 6-digit code to your registered mobile.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <PhoneInput value={phone} onChange={setPhone} error={error} autoFocus />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={sending}
        >
          {sending ? 'Sending OTP…' : 'Send OTP'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-500">
        New here?{' '}
        <Link to="/auth/signup" className="font-medium text-saffron-700 hover:underline">
          Start your subscription →
        </Link>
      </p>
    </AuthShell>
  )
}
