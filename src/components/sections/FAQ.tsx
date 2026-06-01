import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FAQS } from '@/data/faq'
import { cn } from '@/lib/cn'

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <Section id="faq" className="bg-mist relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />

      <Container size="md" className="relative">
        <SectionHeading
          eyebrow="Questions"
          title={<>Things students <span className="italic font-light text-saffron-600">ask us first.</span></>}
          description="Couldn't find an answer? Drop us a message — we reply within 4 hours, even on weekends."
        />

        <div className="mt-10 sm:mt-14 space-y-2.5 sm:space-y-3">
          {FAQS.map((faq, i) => {
            const open = openIdx === i
            return (
              <div
                key={faq.q}
                className={cn(
                  'rounded-2xl border bg-paper transition-all duration-400 ease-out ring-inset-warm',
                  open
                    ? 'border-saffron-300 shadow-card ring-1 ring-saffron-200/50'
                    : 'border-cream-200 hover:border-cream-300 hover:shadow-soft',
                )}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 text-left active:bg-cream-50/40 transition-colors"
                  aria-expanded={open}
                >
                  <span className="font-display text-base sm:text-lg lg:text-xl text-ink-900 tracking-tight leading-snug">{faq.q}</span>
                  <span
                    className={cn(
                      'grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full transition-all duration-300 shrink-0',
                      open
                        ? 'bg-saffron-500 text-cream-50 shadow-soft scale-105'
                        : 'bg-cream-100 text-ink-700',
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-45')}
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
                    'grid transition-all duration-400 ease-out',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 sm:px-5 lg:px-6 pb-5 sm:pb-6 text-[14px] sm:text-base text-ink-500 leading-relaxed">{faq.a}</p>
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
