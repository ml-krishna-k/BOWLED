import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FAQS } from '@/data/faq'
import { cn } from '@/lib/cn'

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <Section id="faq" className="bg-mist">
      <Container size="md">
        <SectionHeading
          eyebrow="Questions"
          title={<>Things students <span className="text-saffron-600">ask us first.</span></>}
          description="Couldn't find an answer? Drop us a message — we reply within 4 hours, even on weekends."
        />

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const open = openIdx === i
            return (
              <div
                key={faq.q}
                className={cn(
                  'rounded-2xl border bg-paper transition-all',
                  open ? 'border-saffron-300 shadow-soft' : 'border-cream-200',
                )}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left"
                  aria-expanded={open}
                >
                  <span className="font-display text-lg sm:text-xl text-ink-900">{faq.q}</span>
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-full transition-colors shrink-0',
                      open ? 'bg-saffron-500 text-cream-50' : 'bg-cream-100 text-ink-700',
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={cn('h-4 w-4 transition-transform', open && 'rotate-45')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-6 text-ink-500 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
