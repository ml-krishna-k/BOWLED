import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Card } from '@/components/ui/Card'

export function ParentTrust() {
  return (
    <Section id="parents" className="bg-cream-50">
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Eyebrow>For parents</Eyebrow>
            <h2 className="text-display text-3xl sm:text-4xl lg:text-5xl">
              Peace of mind, <span className="text-saffron-600">delivered weekly.</span>
            </h2>
            <p className="text-ink-500 text-lg leading-relaxed">
              We know how it feels to send your child to a new city. The Parent Peace-of-Mind report is a gentle weekly WhatsApp summary: meals served, nutrition snapshot, and any feedback they left — without invading their independence.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                'Weekly WhatsApp summary, in your language',
                'Nutrition trend — protein, calories, balance',
                'No GPS tracking, no surveillance — just food',
                'One-time monthly payment — no recharges, no surprise charges',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink-700">
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-saffron-500 text-cream-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp-style preview */}
          <div className="lg:col-span-6">
            <Card className="p-6 max-w-md mx-auto bg-gradient-to-br from-cream-50 to-paper">
              <div className="flex items-center gap-3 border-b border-cream-200 pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-white font-semibold">
                  B
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Bowled</p>
                  <p className="text-xs text-leaf-700">online · official</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Bubble>
                  Namaste Lakshmi ji 🙏 Here's Sneha's meal week:
                </Bubble>
                <Bubble>
                  <span className="block font-semibold text-ink-900">Week of Mon 18 – Sun 24</span>
                  <span className="mt-2 block text-sm">
                    ✓ 19 of 21 meals served{'\n'}
                    ✓ Protein avg: 28g / meal{'\n'}
                    ✓ 2 skips (exam Tuesday){'\n'}
                    ★ Favourite: Paneer Butter Masala
                  </span>
                </Bubble>
                <Bubble>
                  Her note this week: <em className="not-italic text-ink-700">"finally a kadhi that tastes like ammi's"</em> 🥲
                </Bubble>
                <div className="text-right">
                  <span className="inline-block max-w-[85%] rounded-2xl rounded-tr-md bg-saffron-500 text-cream-50 px-4 py-2.5 text-sm">
                    Thank you 🙏 Please make sure she eats breakfast
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-paper border border-cream-200 px-4 py-2.5 text-sm text-ink-700 whitespace-pre-line">
      {children}
    </div>
  )
}
