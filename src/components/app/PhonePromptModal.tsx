import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'

/**
 * Mobile-number prompt shown to Google-authed users who don't have a phone
 * on file yet. Google OAuth only returns name + email — phone is collected
 * here, after the first sign-in, so the admin gets the full triple
 * (name, email, mobile) for every customer.
 *
 * Behaviour:
 *   - Validates a 10-digit Indian mobile number (matches server schema).
 *   - On submit, PATCHes /api/me with `phone`. Server logs a
 *     `profile_completed` activity that surfaces in the admin feed.
 *   - "Skip for now" exists because we don't want to *block* a user from
 *     seeing the app — but we re-prompt every fresh session until they add
 *     a phone (the modal mounts whenever `user.phone` is empty).
 */
export interface PhonePromptModalProps {
  open: boolean
  defaultName: string
  defaultEmail: string
  onSubmit: (phone: string) => Promise<void>
  onSkip: () => void
}

export function PhonePromptModal({
  open,
  defaultName,
  defaultEmail,
  onSubmit,
  onSkip,
}: PhonePromptModalProps) {
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state whenever the modal opens — guards against leftover values
  // after a re-prompt on a later session.
  useEffect(() => {
    if (!open) return
    setPhone('')
    setError(null)
    setSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '').slice(-10)
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Enter a valid 10-digit Indian mobile number')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(cleaned)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Could not save your number — please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-prompt-title"
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/70 backdrop-blur-sm p-4 animate-fade-up"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-cream-50 p-6 sm:p-8 shadow-card">
        <p className="text-eyebrow text-saffron-600">One quick step</p>
        <h2
          id="phone-prompt-title"
          className="mt-2 text-display text-2xl sm:text-3xl tracking-tight text-ink-900"
        >
          Add your <span className="italic font-light text-saffron-600">mobile number</span>
        </h2>
        <p className="mt-3 text-[14px] text-ink-500 leading-relaxed">
          We need it so the delivery person can reach you on the day of the
          first meal. We never share it with anyone else.
        </p>

        <div className="mt-5 rounded-2xl border border-cream-200 bg-paper px-4 py-3 text-sm">
          <p className="text-ink-900 font-medium truncate">{defaultName}</p>
          <p className="text-ink-500 text-xs truncate">{defaultEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            maxLength={14}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (error) setError(null)
            }}
            hint="10-digit Indian mobile (starts with 6, 7, 8 or 9)"
            leading={
              <span className="font-semibold text-ink-500">+91</span>
            }
            autoFocus
          />

          {error && (
            <div className="rounded-xl border border-spice-500/30 bg-spice-50 px-3 py-2.5 text-xs text-spice-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onSkip}
              disabled={submitting}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting || phone.length === 0}
            >
              {submitting ? 'Saving…' : 'Save & continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
