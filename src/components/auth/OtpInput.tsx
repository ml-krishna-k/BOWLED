import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (v: string) => void
  onComplete?: (v: string) => void
  error?: boolean
  autoFocus?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  autoFocus,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  function setAt(i: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = (value + ' '.repeat(length))
      .slice(0, length)
      .split('')
      .map((c, idx) => (idx === i ? digit || ' ' : c))
      .join('')
      .trimEnd()
    onChange(next)

    if (digit && i < length - 1) refs.current[i + 1]?.focus()
    if (next.length === length && !next.includes(' ')) onComplete?.(next)
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              refs.current[i - 1]?.focus()
            }
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onPaste={(e) => {
            e.preventDefault()
            const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (!txt) return
            onChange(txt)
            const at = Math.min(txt.length, length - 1)
            refs.current[at]?.focus()
            if (txt.length === length) onComplete?.(txt)
          }}
          className={cn(
            'h-14 w-12 sm:w-14 rounded-2xl border bg-paper text-center font-display text-2xl text-ink-900',
            'transition-colors focus:outline-none',
            error
              ? 'border-spice-500 ring-2 ring-spice-500/20'
              : 'border-cream-300 focus:border-saffron-400 focus:ring-2 focus:ring-saffron-200',
          )}
        />
      ))}
    </div>
  )
}
