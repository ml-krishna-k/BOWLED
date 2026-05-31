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
          <Link to="/auth/login" className="not-italic font-medium text-saffron-700 underline underline-offset-4 decoration-saffron-300 hover:text-saffron-600">
            Log in
          </Link>
        </>
      }
    >
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <p className="text-eyebrow">Step 01 of 02</p>
          <span aria-hidden className="h-px flex-1 max-w-[5rem] bg-cream-300" />
          <span className="text-chapter text-sm text-saffron-500 tabular-nums">Begin</span>
        </div>
        <h1 className="mt-3 text-display text-4xl sm:text-5xl tracking-[-0.025em] leading-[1.04] text-ink-900">
          Tell us <span className="italic font-light text-saffron-600">about you.</span>
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">
          Just two things to start — your name and number. We&apos;ll send a one-time code to
          verify, then walk you through plans inside the app.
        </p>
      </div>

      <form onSubmit={submit} className="mt-9 space-y-5 animate-fade-up delay-100">
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
          variant="secondary"
          size="lg"
          className="w-full mt-2"
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

      <p className="mt-6 caption text-ink-500 leading-relaxed">
        By continuing you agree to our <a className="not-italic underline underline-offset-4 decoration-saffron-300 hover:text-saffron-700" href="#">Terms</a> and{' '}
        <a className="not-italic underline underline-offset-4 decoration-saffron-300 hover:text-saffron-700" href="#">Privacy</a>. We&apos;ll only use your number to deliver meals and send order updates.
      </p>
    </AuthShell>
  )
}
