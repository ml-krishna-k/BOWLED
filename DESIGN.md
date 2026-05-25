# Krish'sBowl — Design & Product Vision

> A Sree Krishna Catering venture · launched May 5, 2025 · 500+ daily Chennai students.
> Tiffit's subscription workflow wrapped in Cookr's premium ambiance.

---

## 1. Product vision

Krish'sBowl is a **daily meal subscription** for students living away from home — in PGs, hostels, and rented rooms across Chennai. It is *not* a food delivery app.

The brand is the newest venture of **Sree Krishna Catering**, who have been cooking for Chennai families, weddings and offices since 2006 (20+ years of kitchen craft). Krish'sBowl launched on **May 5, 2025** and currently serves **500+ students** daily.

What it sells is **consistency, comfort, and one less thing to worry about** during the messiest years of someone's life. The emotional product is *"home, but in a different city."*

### Three north-star feelings the product must trigger

1. **Comfort** — "This tastes like food my mom would have made."
2. **Trust** — "I know what I'm eating tomorrow. My parents do too."
3. **Calm** — "I never have to think about lunch again."

### What it explicitly is *not*

- Not a discount-driven marketplace
- Not a hostel-canteen aggregator
- Not aggressive food-delivery UI (no scrolling carousels of deals, no countdown timers)

---

## 2. Information architecture

```
Landing (this build)
├── Hero
├── Trust marquee
├── How it works (4 steps)
├── Weekly menu (interactive day × meal × filter)
├── Subscription plans (3 tiers)
├── Why students love it (6 reasons)
├── Food showcase (sourcing & quality)
├── Parent peace-of-mind
├── Testimonials
├── Kitchen trust
├── App preview (3 phone mockups)
├── FAQ
└── Final CTA

Student app (future routes)
├── /home          → today's meals, wallet, next delivery
├── /menu          → weekly rotating menu, filters, ratings
├── /subscription  → plan, pause/skip, billing
├── /wallet        → balance, recharge, history
├── /meal/:id      → meal detail, swap, rate
├── /qr-pass       → delivery QR
└── /profile       → preferences, allergens, parent report
```

---

## 3. Visual identity

### Palette (warm, healthy, premium)

| Token | Hex | Use |
|---|---|---|
| `cream-50` | `#fffaf2` | Primary background |
| `cream-100` | `#fdf3e2` | Soft surface, cards |
| `cream-200` | `#f7e6cb` | Hairline borders |
| `saffron-500` | `#f56a1b` | Brand primary, CTAs |
| `saffron-600` | `#d8540f` | Saffron hover |
| `spice-500` | `#b9421a` | Deep accent |
| `leaf-500` | `#5a8a4a` | Veg / health cues |
| `ink-900` | `#1f1a12` | Headings, primary text |
| `ink-500` | `#6e6354` | Body text |
| `paper` | `#ffffff` | Elevated surface |

Tokens are defined in [`src/index.css`](./src/index.css) inside Tailwind v4's `@theme {}` block. All color utilities (`bg-saffron-500`, `text-ink-900`, etc.) generate automatically.

### Typography

- **Display** — `Fraunces` (variable, optical sizing). Used for all headings, plate names, plan titles. Warm, slightly literary serif — evokes a recipe book.
- **Sans** — `Plus Jakarta Sans`. Used for body, UI, navigation. Spacious, modern, highly readable.
- Loaded via Google Fonts in [`index.html`](./index.html) with preconnect.

### Custom utilities

| Utility | Effect |
|---|---|
| `text-display` | Fraunces with optical sizing + tight letter-spacing |
| `text-eyebrow` | Uppercase, tracked, saffron — section labels |
| `bg-grain` | Subtle dual-dot noise overlay — adds warmth to flat surfaces |
| `card-glass` | Translucent surface with backdrop-blur |
| `animate-marquee` | 40s linear scroll for trust ribbon |
| `animate-float` | 6s gentle vertical float for hero plates |
| `text-shimmer` | Animated gradient on emphasised words |

### Shape & shadow

- **Radius** scales from 6 → 36 px. Default card radius is `2xl` (36 px) — softer than standard SaaS to feel hand-shaped, not engineered.
- **Shadows** are warm-tinted (rust undertone, `rgba(176, 92, 31, ...)`), not pure black — gives the calm ambient lift you see on Cookr.

---

## 4. Section breakdowns

### Hero

- Warm radial glow (saffron) blooming from top-center
- Headline uses display serif with an animated shimmer on the emotional phrase
- Right side: a *composed* layout — featured plate card + active plan card + QR pass — that previews three distinct app surfaces at once. This is doing the work three product screenshots usually do, but as one visual.

### How it works

- Four numbered cards. Each card has a giant outlined numeral in the corner that turns saffron on hover.
- Hairline connectors between cards on desktop to imply flow.

### Weekly menu

- Day pill row (Mon–Sun) → meal slot list (Breakfast / Lunch / Dinner) → featured meal detail. Full state in React.
- Veg / non-veg / all filter chip row.
- Featured card uses a stylised "plate" gradient (not photos) so the project is shippable without imagery.

### Plans

- 3 cards. Recommended plan gets a saffron ring + "Recommended" badge.
- Big display-serif price, fine-print monthly total below.
- Soft variant for outer two, default (white, shadow) for recommended — visual hierarchy nudges the eye.

### Why students love it

- 6 reason cards in a 3-col grid. Each has a saffron icon tile.
- Cards lift from `soft` (cream tint) to `paper` (white) on hover — a very subtle warmth shift.

### Food showcase

- 4 horizontal-split cards: gradient panel left, copy right.
- Different gradient per card (`leaf → cream`, `saffron → cream`, etc.) creates a varied "tasting menu" feel down the page.

### Parent peace-of-mind

- Two-column. Left: emotional copy + checklist. Right: WhatsApp-style message thread mockup with realistic content.
- This is a *trust* section but disguised as a product-feature section — a key emotional beat for the parent persona.

### Testimonials

- 5 cards in 3-col grid; the 2nd card spans 2 rows and inverts to dark ink — a magazine-pull-quote moment.

### Kitchen trust

- Dark section (`ink-900`). Breaks the cream rhythm — this is the "credibility" beat.
- 4 stat tiles + 4 chef profiles. Numbers + names build "we know our cooks."

### App preview

- 3 phone frames with hand-drawn UI inside (no asset dependency). Middle phone is elevated + scaled.

### FAQ

- Accordion. Open card gets saffron ring + soft shadow. The `+` icon rotates 45° into an `×`.

### CTA

- Saffron gradient block with grain overlay + corner glow blurs. Strongest visual moment on the page — earns its volume by being the final beat.

---

## 5. Interaction & motion principles

- **Default state is calm.** Motion is reserved for moments of meaning.
- Hero plate card: gentle 6s float — feels alive but not jittery.
- Trust marquee: 40s, masked with fade gradients — never scroll-baiting.
- Card hover: `-translate-y-1` (4px) + softer warm shadow. Subtle.
- All transitions are `200–300ms` with `ease-out`. No bouncy springs.

---

## 6. Component philosophy

- **Primitives are dumb and composable.** `Container`, `Section`, `Button`, `Card`, `Badge`, `Eyebrow`, `SectionHeading` — none have business logic.
- **Sections own their own state** (e.g., the menu picker). They consume `data/*` mocks. Easy to swap for an API later.
- **No icon library.** Icons are inline SVGs — keeps the bundle small and the rendering crisp.

---

## 7. Mobile UX strategy

- Navbar collapses into a glass pill at scroll, then opens to a sheet on tap.
- Hero stack reflows: composed plate layout collapses but each card retains its own breathing room (not stacked tight).
- Menu day-picker becomes horizontally scrollable.
- Plan cards stack with the recommended one in the middle still — preserves the visual hierarchy of "best value lives in the center."
- Phone-frame previews already mirror what the actual app will look like (bottom nav, calm spacing, no carousels).

---

## 8. Conversion-focused choices

- **Two CTAs only** site-wide: *Start trial* (₹99/meal, low risk) and *Subscribe* (recommended plan).
- Trial price is shown in the hero CTA itself — no clicks required to learn cost.
- The recommended plan is centered, visually heavier, and labelled — directs the eye without being pushy.
- The Parent section is the conversion lever for students who need parental sign-off (a big real-world unlock for this market).

---

## 9. What's next (post-this-scaffold)

| Phase | Work |
|---|---|
| Auth | Phone OTP, allergen onboarding |
| Subscription | Stripe / Razorpay wallet, plan management, pause/skip API |
| Menu engine | Admin tool for weekly menu rotation, A/B meal swaps |
| Delivery | Rider app, QR pass scanning, slot management |
| Parent | WhatsApp Business API for weekly summaries |
| Native | React Native shell wrapping the same Tailwind tokens |

---

*The product should look startup-grade, investor-ready, and operationally realistic — but always feel like a warm meal at the end of a long day.*
