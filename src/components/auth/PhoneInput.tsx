import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/Input'

interface PhoneInputProps {
  value: string
  onChange: (v: string) => void
  error?: string
  autoFocus?: boolean
}

export function PhoneInput({ value, onChange, error, autoFocus }: PhoneInputProps) {
  function handle(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange(digits)
  }

  return (
    <Input
      type="tel"
      inputMode="numeric"
      label="Mobile number"
      placeholder="98765 43210"
      value={value}
      onChange={handle}
      error={error}
      autoFocus={autoFocus}
      autoComplete="tel"
      leading={
        <span className="flex items-center gap-1.5 pr-2 border-r border-cream-300 mr-1">
          <span aria-hidden>🇮🇳</span>
          <span className="text-sm font-medium text-ink-700">+91</span>
        </span>
      }
    />
  )
}
