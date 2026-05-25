import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '@/components/auth/AuthShell'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { isValidIndianPhone, sendOtp } from '@/lib/auth'

/**
 * Signup is identity-only — name + phone + OTP. Plan & group selection
 * happen *inside* the app after login, on the SubscriptionPage. AppShell
 * auto-redirects any logged-in user without a subscription to that page.
 */
export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = 'Please enter your name'
    if (!isValidIndianPhone(phone)) next.phone = 'Enter a valid 10-digit mobile number'
    setErrors(next)
    if (Object.keys(next).length) return

    setSending(true)
    try {
      const res = await sendOtp(phone)
      navigate('/auth/otp', {
        state: { phone, mode: 'signup', name, demoOtp: res.demoOtp },
      })
    } catch {
      setErrors({ phone: 'Could not send OTP — try again' })
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthShell
      step={{ current: 1, total: 2, label: 'Your details' }}
      footer={
        <>
          Already subscribing?{' '}
          <Link to="/auth/login" className="font-medium text-saffron-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <p className="text-eyebrow">Step 1 of 2</p>
      <h1 className="mt-3 text-display text-4xl text-ink-900">Tell us about you</h1>
      <p className="mt-3 text-ink-500">
        Just two things to start — your name and number. We'll send a one-time code to verify, then walk you through plans inside the app.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input
          label="Your name"
          placeholder="e.g. Aarav Mehta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />
        <PhoneInput value={phone} onChange={setPhone} error={errors.phone} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={sending}
        >
          {sending ? 'Sending OTP…' : 'Send OTP'}
        </Button>
      </form>

      <p className="mt-6 text-xs text-ink-500 leading-relaxed">
        By continuing you agree to our <a className="underline" href="#">Terms</a> and{' '}
        <a className="underline" href="#">Privacy</a>. We'll only use your number to deliver meals and send order updates.
      </p>
    </AuthShell>
  )
}
