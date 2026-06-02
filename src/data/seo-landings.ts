/**
 * SEO landing-page content registry.
 *
 * Each entry is a self-contained microsite for a search intent — title,
 * meta, hero, long-form sections, audience-specific FAQs, internal links.
 * Rendered by `<LocalSeoLanding>` in src/pages/seo/LocalSeoLanding.tsx.
 *
 * Content targets:
 *  - 800–1500 words per page (combined hero + sections)
 *  - one H1 (the hero title)
 *  - 4–6 H2 sections with H3 sub-points
 *  - 5–7 FAQ items aimed at the page's primary audience
 *  - natural keyword density (no stuffing) + semantic variations
 *  - Chennai locality references (Adyar, OMR, Velachery, T. Nagar, etc.)
 */

export interface SeoSection {
  /** H2 heading. */
  heading: string
  /** Optional kicker shown above the H2 (eyebrow). */
  eyebrow?: string
  /** Body paragraphs — each becomes a <p>. Use plain text or *italic* markers (kept simple). */
  paragraphs: string[]
  /** Optional H3 sub-points: { title, body }. */
  points?: Array<{ title: string; body: string }>
}

export interface SeoFaq {
  q: string
  a: string
}

export interface SeoInternalLink {
  /** URL path (e.g. "/hostel-food-chennai"). */
  path: string
  /** Anchor text — should contain the target page's primary keyword. */
  label: string
  /** Short description shown beside the link. */
  blurb: string
}

export interface SeoLanding {
  /** Path segment, e.g. "hostel-food-chennai". The route is "/" + slug. */
  slug: string

  /** SERP title (≤ 60 chars). */
  title: string
  /** SERP description (140–160 chars). */
  metaDescription: string
  /** Keywords meta + a hidden-on-page semantic anchor list. */
  keywords: string

  /** Eyebrow shown above the H1. */
  eyebrow: string
  /** Single H1 — contains primary keyword. */
  h1: string
  /** 1–2 paragraph intro shown directly under the H1. */
  intro: string[]

  /** Long-form body — rendered as alternating H2 sections. */
  sections: SeoSection[]

  /** FAQ block — fuels FAQPage schema + on-page "People also ask"-style. */
  faqs: SeoFaq[]

  /** Internal links to other SEO pages. Adds rank-flow + helps coverage. */
  internalLinks: SeoInternalLink[]

  /** Primary CTA copy. */
  cta: { headline: string; sub: string; buttonLabel: string }
}

/* ────────────────────────────────────────────────────────────────────────── */

export const LANDINGS: SeoLanding[] = [
  /* ─── 1 · /hostel-food-chennai ─────────────────────────────────────────── */
  {
    slug: 'hostel-food-chennai',
    title: 'Hostel Food in Chennai — 3 Home-Style Meals a Day | Bowled',
    metaDescription:
      'Tired of hostel mess food in Chennai? Bowled delivers three home-cooked Tamil meals daily to PGs and hostels across Chennai. From ₹89/meal. Skip anytime.',
    keywords:
      'hostel food chennai, hostel mess alternative chennai, hostel meal delivery chennai, hostel tiffin chennai, hostel food service chennai, food for hostel students chennai',
    eyebrow: 'Hostel food in Chennai',
    h1: 'Hostel food in Chennai that actually tastes like home',
    intro: [
      'Most hostel mess food in Chennai falls into the same trap — cold sambar at 7 AM, oily curry at lunch, the same chapati and dal at dinner, week after week. Bowled is the antidote. We deliver three freshly-cooked Tamil meals a day to your hostel doorstep, with a chef-rotated weekly menu and zero compromises on home-style flavour.',
      'Run by Sree Krishna Catering — the team that has been cooking for Chennai families, weddings and offices since 2006 — Bowled is built around what 200 hostel students told us they actually wanted: hot, fresh food, on time, with the ability to skip days when exams or trips home come up.',
    ],
    sections: [
      {
        eyebrow: 'Why hostel students choose Bowled',
        heading: 'A real alternative to hostel mess food',
        paragraphs: [
          'Hostel food in Chennai has long been the running joke of student life. Bland sambar, suspect curd, the same paneer dish every Thursday — it grinds you down. Worse, the timings are rigid and the quality drops the further the kitchen is from your block. Bowled flips this. Each of our four partner kitchens cooks small batches under fifty plates so quality stays consistent meal to meal, and we deliver hot to your hostel between mess timings or just after, so you never have to choose between food and a late class.',
        ],
        points: [
          {
            title: 'Hot delivery to your hostel block',
            body: 'Three timed deliveries per day — 7:30 AM breakfast, 1:00 PM lunch, 8:00 PM dinner — straight to the gate of hostels in Adyar, Velachery, OMR, T. Nagar, Anna Nagar and Tambaram. No going down to the mess. No standing in queue.',
          },
          {
            title: 'A weekly rotating chef menu',
            body: 'Mondays open with idli, sambar and coconut chutney. Wednesdays bring chicken fried rice. Sundays are special — chicken biryani, brinjal curry and onion raita. The full week rotates through Tamil home cooking, never repeated within the same week.',
          },
          {
            title: 'Skip exam weeks, trips home, festivals',
            body: 'Going home for Diwali? Crunching for semester finals? Pause your plan in one tap. Meals you skip extend your plan end-date — you never lose what you paid for.',
          },
        ],
      },
      {
        eyebrow: 'The Bowled hostel meal plan',
        heading: 'How the subscription works',
        paragraphs: [
          'Pick a plan that fits your routine. Solo for individuals, Squad for five roommates sharing a code, and Floor for ten hostel-block subscribers — each tier drops the per-meal price by ₹20–₹26. Pay once for the cycle; we cook and deliver every day until it ends. There is no auto-renewal, no surprise charges, and no commitment beyond the cycle you paid for.',
          'When the delivery person arrives at your hostel, show them the QR meal pass in your Bowled app. They scan once — one meal comes off your plan automatically. No signing, no marking attendance, no paper register at the hostel mess counter.',
        ],
      },
      {
        eyebrow: 'Hostel coverage in Chennai',
        heading: 'Hostels we currently serve',
        paragraphs: [
          'Bowled delivers to hostels and PGs across the major student belts of Chennai — IIT Madras, Anna University, SRM Vadapalani, Loyola, MOP Vaishnav, Stella Maris, Madras Christian College, Saveetha and the engineering corridor along OMR. If your hostel is within the Velachery–Adyar–OMR–T. Nagar–Anna Nagar–Tambaram polygon, you are inside our delivery zone.',
        ],
        points: [
          {
            title: 'Adyar / Besant Nagar',
            body: 'Cooked at our Adyar kitchen by Saraswathi Akka — Tamil home cooking at its most authentic.',
          },
          {
            title: 'Velachery / Tambaram',
            body: 'Velachery kitchen handles the south side, including SRM hostels and Tambaram engineering colleges.',
          },
          {
            title: 'OMR (Thoraipakkam to Sholinganallur)',
            body: 'The OMR kitchen is dedicated to the IT-corridor student hostels and PGs lining Rajiv Gandhi Salai.',
          },
          {
            title: 'T. Nagar / Anna Nagar',
            body: 'Chettinad and coastal specials from our T. Nagar kitchen, covering the central belt and old Chennai hostels.',
          },
        ],
      },
      {
        eyebrow: 'What you pay',
        heading: 'Hostel meal pricing that respects student budgets',
        paragraphs: [
          'Most hostel residents in Chennai pay between ₹3,500 and ₹6,000 per month for mess food — and the food, frankly, does not always justify it. Bowled starts at ₹89 per meal on Solo, drops to ₹69 on Squad (five-friend group) and ₹63 on Floor (ten-person hostel-block group). For a typical monthly plan with Sunday off, that is ₹6,942 Solo, dropping to ₹5,382 in a Squad — but the food on your plate is fresh, home-style, and never reheated.',
          'Group plans are how most hostels actually subscribe. Get five roommates on the same code and save ₹1,800 per person per month. Get ten of your floor on one Floor plan and save ₹2,340 each.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you deliver to hostels in Chennai?',
        a: 'Yes — we deliver to hostels, hostel blocks and PGs across Adyar, Velachery, T. Nagar, OMR (Thoraipakkam to Sholinganallur), Anna Nagar and Tambaram. If your hostel is in any of these zones, we are at your gate three times a day.',
      },
      {
        q: "How does Bowled compare to my hostel's mess food?",
        a: "Our meals are cooked in small batches under fifty plates by chefs who have been cooking Tamil home food for two decades, delivered hot within two hours of being cooked. Hostel mess food is cooked at scale earlier in the day. The texture, freshness and consistency are noticeably different.",
      },
      {
        q: 'What if I have to go home for a week during semester break?',
        a: 'Pause your plan in one tap from the Bowled app. Skipped meals extend your plan end-date by the same number of days, so you never lose what you paid for. Monthly subscribers get a fixed number of meal-skips and full-day skips per cycle.',
      },
      {
        q: 'Can my hostel friends and I share a plan?',
        a: 'Yes — that is exactly how the Squad and Floor plans work. The originator pays for the group upfront and shares a group code with friends. Each friend joins using that code and gets the discounted per-meal rate automatically.',
      },
      {
        q: 'Is the food vegetarian or non-veg?',
        a: 'Both. Roughly 70% of the rotating weekly menu is vegetarian (idli, dosa, full meals, kara kuzhambu, aviyal), with non-veg options on Tuesday, Wednesday, Thursday, Saturday and Sunday — chicken curry, chicken fried rice, parotta with egg curry, parotta with chicken salna, and the Sunday chicken biryani special.',
      },
      {
        q: 'How do I prove my plan when food arrives at the hostel?',
        a: 'Open the Bowled app and show your QR meal pass to the delivery person. They scan it once, one meal comes off your plan automatically. No paper signatures, no manual attendance.',
      },
      {
        q: 'Is there a free trial for hostel students?',
        a: 'You can subscribe to a one-week Solo plan from ₹89 per meal — the shortest, lowest-commitment way to try us. If the food doesn\'t taste like home, write to us within the first week and we will refund the full amount.',
      },
    ],
    internalLinks: [
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription in Chennai',
        blurb: 'How the Solo / Squad / Floor plans work, with pricing.',
      },
      {
        path: '/pg-food-chennai',
        label: 'PG food in Chennai',
        blurb: 'For students in PGs — same plans, same delivery model.',
      },
      {
        path: '/home-cooked-food-chennai',
        label: 'Home-cooked food in Chennai',
        blurb: 'Our Tamil home cooking philosophy and weekly menu.',
      },
      {
        path: '/student-meals-chennai',
        label: 'Student meals in Chennai',
        blurb: 'Plans, pricing and skip allowance tailored for students.',
      },
    ],
    cta: {
      headline: 'Skip the hostel mess. Start your plan today.',
      sub: 'Three home-cooked meals delivered to your hostel from ₹89/meal. Pause anytime.',
      buttonLabel: 'Subscribe from ₹89 / meal',
    },
  },

  /* ─── 2 · /pg-food-chennai ─────────────────────────────────────────────── */
  {
    slug: 'pg-food-chennai',
    title: 'PG Food in Chennai — Home-Style Meals Delivered Daily | Bowled',
    metaDescription:
      'Living in a PG in Chennai? Get three home-cooked meals a day delivered to your door. Tamil menu, weekly rotation, from ₹89/meal. Skip anytime, no commitment.',
    keywords:
      'pg food chennai, pg food delivery chennai, food for pg students chennai, pg meal subscription chennai, pg tiffin chennai, food for paying guest chennai',
    eyebrow: 'PG food delivery in Chennai',
    h1: 'PG food in Chennai — three fresh meals delivered every day',
    intro: [
      'PG life in Chennai usually comes with one of two food problems. Either your PG owner provides food that swings between bland and erratic, or there is no kitchen, no fridge, and you are stuck cycling through Swiggy, the corner mess and 8 PM dosa stalls. Neither lasts.',
      'Bowled is the third option — a monthly subscription that drops three freshly-cooked Tamil meals at your PG door, every single day. No menu fatigue, no decision-making, no oily takeaway. Built for PG residents in Chennai who want food the way home would have done it.',
    ],
    sections: [
      {
        eyebrow: 'Built for PG residents',
        heading: 'Why PGs in Chennai are switching to Bowled',
        paragraphs: [
          'Most PG residents in Chennai are renting a room with no proper kitchen access — at most a kettle, sometimes a microwave. Cooking is not really an option, even if you wanted to. That leaves you ordering food daily, which gets expensive fast and rarely tastes like the home you left behind.',
          'Bowled solves both problems at once. The pricing — ₹63 to ₹89 per meal depending on group size — is lower than most regular Swiggy orders. And the food is real Tamil home cooking, made by chefs from Sree Krishna Catering who have been feeding Chennai families since 2006.',
        ],
        points: [
          {
            title: 'No kitchen needed',
            body: 'Every meal arrives ready to eat in compartmentalised eco-friendly containers — rice on one side, dal and sabzi separated, curd and sweet in their own compartments. Your PG room is fine as it is.',
          },
          {
            title: 'Cheaper than daily delivery apps',
            body: 'A typical Swiggy thali in Chennai is ₹180–₹250. Bowled is ₹89 on Solo, ₹69 in a group of five, ₹63 in a group of ten — and the food is home-style, not restaurant-style.',
          },
          {
            title: 'Same time, every day',
            body: 'Breakfast 7:30 AM, lunch 1:00 PM, dinner 8:00 PM — give or take a few minutes. You can plan your day around it instead of around food.',
          },
        ],
      },
      {
        eyebrow: 'What\'s on the menu',
        heading: 'A weekly rotating Tamil home menu',
        paragraphs: [
          'Our chefs rotate the menu every week to keep things interesting. Monday opens with idli, sambar and coconut chutney; Tuesday breakfast is pongal-vada; Wednesday is dosa; Thursday is poori with potato masala; Friday is upma. Lunch ranges from full Tamil meals on Monday to kara kuzhambu meals on Tuesday, chicken fried rice on Wednesday, aviyal meals on Thursday, and the Friday full-meals special. Dinner rotates between dosa-kurma, chapati with chicken curry, parotta with egg curry, and parotta with chicken salna.',
          'Sundays are the special day — biryani for lunch, idli-pongal-vada combo for breakfast, dosa for dinner. Festive but not over the top.',
        ],
      },
      {
        eyebrow: 'PG coverage in Chennai',
        heading: 'Areas we deliver to',
        paragraphs: [
          'PG culture in Chennai is concentrated in a few belts — the IT corridor on OMR, the educational hubs around Adyar and Velachery, T. Nagar for working professionals, and the older central belts of Anna Nagar and Tambaram. Bowled delivers to PGs across all of them.',
        ],
        points: [
          {
            title: 'OMR (Rajiv Gandhi Salai)',
            body: 'Thoraipakkam, Karapakkam, Sholinganallur, Navalur — the IT corridor PGs get our OMR kitchen\'s rotation, including North-South fusion specials.',
          },
          {
            title: 'Adyar / Besant Nagar / Indira Nagar',
            body: 'Cooked at the Adyar kitchen with deep Tamil home-cooking influence. Cleaner sambar, lighter rasam.',
          },
          {
            title: 'Velachery / Madipakkam / Pallikaranai',
            body: 'Velachery PGs near SRM, Madipakkam working women PGs and Pallikaranai engineering hostels.',
          },
          {
            title: 'T. Nagar / Anna Nagar',
            body: 'Working-professional PGs in the central belt. T. Nagar kitchen specialises in Chettinad and coastal Tamil flavours.',
          },
        ],
      },
      {
        eyebrow: 'Parent peace-of-mind',
        heading: 'A weekly report to your parents — if you want',
        paragraphs: [
          'For students living away from home, parents are often the deciding voice on whether a subscription is worth it. Bowled has an optional weekly WhatsApp summary to your parents — meals served, nutrition trends, and your week\'s favourite. No GPS tracking, no surveillance — just food. You opt in (or out) yourself from the app.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you deliver to PGs across all of Chennai?',
        a: 'We deliver across the major PG belts of Chennai — OMR, Adyar, Velachery, T. Nagar, Anna Nagar, Tambaram, Madipakkam, Pallikaranai, Besant Nagar and Indira Nagar. If your PG is within those zones, we are at your door three times a day.',
      },
      {
        q: 'Do I need to leave my PG to collect the food?',
        a: 'No. Our delivery person comes to your PG gate. Show your QR meal pass from the Bowled app, they scan once, your meal counter drops by one. The food is handed over at the gate; some PGs allow doorstep delivery.',
      },
      {
        q: 'What if my PG already provides food?',
        a: 'Many of our PG subscribers use Bowled as a quality upgrade — they skip the PG mess meals and use Bowled instead. Others use Bowled only for dinner (when most PG kitchens close early) or only on weekends.',
      },
      {
        q: 'How much does a monthly plan cost for a PG resident?',
        a: 'A Solo monthly plan (26 cooking days, three meals per day) is ₹6,942. Bring four PG mates on the same code and it drops to ₹5,382 per person on Squad. Bring nine and it drops to ₹4,914 on Floor.',
      },
      {
        q: 'Can I pay weekly instead of monthly?',
        a: 'Yes. We offer four billing cycles — Weekly (7 days), Weekly minus Sunday (6 days), Monthly minus Sunday (26 days), and Monthly weekdays-only (22 days). Pick the one that fits your travel pattern.',
      },
      {
        q: 'Is the food packed in plastic or eco-friendly containers?',
        a: 'Compartmentalised containers that are oxo-biodegradable. No styrofoam. The compartments keep your dal from soaking the roti — a small thing that makes a big difference.',
      },
      {
        q: 'Can my parents pay for my subscription?',
        a: 'Yes — we accept UPI payments from any account. Your parent can transfer the amount and submit the UTR on your behalf, or you can submit it yourself. The plan activates once an admin verifies the payment, usually within a few hours.',
      },
    ],
    internalLinks: [
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription in Chennai',
        blurb: 'Plan tiers, pricing breakdown, and billing cycle options.',
      },
      {
        path: '/hostel-food-chennai',
        label: 'Hostel food in Chennai',
        blurb: 'If you are in a hostel rather than a PG.',
      },
      {
        path: '/student-meals-chennai',
        label: 'Student meals in Chennai',
        blurb: 'Plans, skip allowance and group pricing for students.',
      },
      {
        path: '/healthy-meals-chennai',
        label: 'Healthy meals in Chennai',
        blurb: 'Our take on calories, oil, and home-style nutrition.',
      },
    ],
    cta: {
      headline: 'Three home-cooked meals delivered to your PG every day.',
      sub: 'From ₹89/meal Solo, dropping to ₹63 in a group of ten. Skip anytime.',
      buttonLabel: 'Start your subscription',
    },
  },

  /* ─── 3 · /home-cooked-food-chennai ────────────────────────────────────── */
  {
    slug: 'home-cooked-food-chennai',
    title: 'Home-Cooked Food in Chennai, Delivered Daily | Bowled',
    metaDescription:
      'Real home-cooked Tamil food in Chennai, delivered three times a day. Less oil, slow-cooked, freshly ground spices. From ₹89/meal. By Sree Krishna Catering.',
    keywords:
      'home cooked food chennai, home style food chennai, home food delivery chennai, mom-style food chennai, tamil home cooking chennai, freshly cooked meals chennai',
    eyebrow: 'Home-cooked food in Chennai',
    h1: 'Home-cooked food in Chennai that tastes like your mom made it',
    intro: [
      'There is a specific kind of food that gets harder to find the longer you live away from home — the kind where the sambar is sour but not aggressive, the rasam has actual flavour and not just chilli, the kootu is properly thick, and someone has not poured a kilo of oil over the entire plate. Restaurant food rarely gets this right. Hostel mess food gets it wrong on purpose. Bowled is built around this exact gap.',
      'We are Sree Krishna Catering, a Chennai catering business that has been cooking for families, weddings and offices since 2006. Bowled is our daily home-style meal subscription — three Tamil meals a day, delivered to your door, made the way your grandmother would have approved.',
    ],
    sections: [
      {
        eyebrow: 'The home-cooking philosophy',
        heading: 'Less oil, more flavour — like home',
        paragraphs: [
          'Restaurants and cloud kitchens optimise for two things — bold flavour and visual appeal. Both lead to more oil, more salt, more ghee, and more food colour than any home would ever use. Home cooking optimises for something else entirely — daily eatability. You want to be able to eat the food every day without feeling heavy, sleepy, or thirsty by 4 PM.',
          'Bowled cooks with that constraint front of mind. We use cold-pressed groundnut and sesame oils. We grind our own masalas weekly so the spices are aromatic, not stale. We slow-cook gravies the way home kitchens do, not the way commercial kitchens do. The result is food that holds up to being eaten three times a day, seven days a week.',
        ],
      },
      {
        eyebrow: 'The kitchens behind the food',
        heading: 'Four neighbourhood kitchens, one cook per kitchen',
        paragraphs: [
          'Bowled runs out of four kitchens across Chennai — one each in Adyar, Velachery, T. Nagar and OMR (Thoraipakkam). Each kitchen has a head cook with a name and a face. Saraswathi Akka in Adyar specialises in Tamil home cooking — her sambar is the standard the rest of us are measured against. Padma Aunty in Velachery handles South Indian classics. Chef Anil at OMR does North-South fusion. Meera Akka in T. Nagar brings Chettinad and coastal specials. All four kitchens are FSSAI Grade A audited quarterly.',
          'We deliberately keep batch sizes under fifty meals per cook. Mass-canteen kitchens cook for hundreds at a time, which is where quality starts to drop — you cannot taste-correct a 200-litre pot of sambar mid-cook. Small batches, multiple kitchens, one cook per batch.',
        ],
      },
      {
        eyebrow: 'What\'s on the home-style menu',
        heading: 'A week of Tamil home cooking',
        paragraphs: [
          'The weekly menu is built around what a Tamil home kitchen would actually serve — not what looks good on a menu card. Mondays open quietly with idli, sambar and coconut chutney for breakfast, and a balanced full-meals lunch (rice, sambar, beans poriyal, kootu, rasam, mor). Tuesdays bring pongal-vada for breakfast and kara kuzhambu for lunch. Wednesdays vary with dosa breakfast and chicken or veg fried rice for lunch.',
          'Thursdays are aviyal-meals day, the Kerala–Tamil borderlands classic, with poori-potato-masala in the morning. Fridays are full-meals day — the full Tamil thali. Saturdays bring variety rice (tamarind, lemon, pudhina) for lunch and parotta-chicken-salna for dinner. Sundays are the festive day — idli-pongal-vada combo, biryani lunch, light dosa dinner.',
        ],
      },
      {
        eyebrow: 'Real ingredients',
        heading: 'Sourced from small farms, ground fresh',
        paragraphs: [
          'Most of our vegetables come from small farmer-producer organisations within an 80-kilometre radius of Chennai — Chengalpattu, Tiruvallur, Kanchipuram. Rice is from a Karnataka co-operative we have worked with since 2008. Spices are bought whole and ground at our central spice room every Monday morning, so by the time they reach a wok on Wednesday they are still aromatic.',
          'We do not work with food colour. We do not use cream where curd would do. We do not buy pre-mixed masalas. These sound like small choices but they are the difference between food that tastes like home and food that tastes like a restaurant pretending to be home.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What makes Bowled different from other home-food delivery services in Chennai?',
        a: 'Three things — the same chef cooks every batch (we cap at fifty plates), we grind our own spices weekly, and our menu rotates rather than repeating. Most "home food" services in Chennai are cloud kitchens that cook for hundreds with stock masalas. We are closer to actual home cooking.',
      },
      {
        q: 'Is the food too spicy or oily?',
        a: 'Neither — and that is the point. We dial both down to a home setting. If you grew up in a Tamil home, the spice level will feel familiar. If you are new to Tamil food, it should still be very approachable.',
      },
      {
        q: 'Can I customise the menu for dietary restrictions?',
        a: 'You can flag allergens (peanuts, dairy, eggs, gluten, soy, shellfish) on your profile and we auto-swap meals on conflicting days. Beyond that, the weekly menu is fixed — we cannot do individual meal-by-meal customisation at scale without losing the home-cooking quality we are trying to keep.',
      },
      {
        q: 'How fresh is "freshly cooked"?',
        a: 'Cooking for any given meal slot starts about two hours before the delivery window. Breakfast cooking starts at 5 AM, lunch at 11 AM, dinner at 6 PM. You are eating food that came off the stove within the last two to three hours.',
      },
      {
        q: 'Do you use any preservatives or pre-prepared ingredients?',
        a: 'No preservatives, no frozen pre-prepared ingredients. The only things we make in advance are the spice powders (ground weekly) and the chutneys for breakfast (made the same morning).',
      },
      {
        q: 'Is the food vegetarian-friendly?',
        a: 'Roughly 70% of the week is vegetarian — Monday, Wednesday dinner, Friday and Sunday dinner are fully veg, and most breakfasts are veg. You can also filter to veg-only across the week and we will auto-swap the non-veg days.',
      },
    ],
    internalLinks: [
      {
        path: '/healthy-meals-chennai',
        label: 'Healthy meals in Chennai',
        blurb: 'The nutrition side of home-style cooking.',
      },
      {
        path: '/best-meals-chennai',
        label: 'Best meals in Chennai',
        blurb: 'Why our Tamil home menu is the best meal subscription in the city.',
      },
      {
        path: '/tiffin-service-chennai',
        label: 'Tiffin service in Chennai',
        blurb: 'How we are the modern, app-driven version of a Chennai tiffin service.',
      },
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan tiers and how the subscription works.',
      },
    ],
    cta: {
      headline: 'Home-style Tamil food, every day, no kitchen needed.',
      sub: 'From ₹89/meal. Three meals daily, weekly rotating menu, pause anytime.',
      buttonLabel: 'Subscribe from ₹89 / meal',
    },
  },

  /* ─── 4 · /healthy-meals-chennai ───────────────────────────────────────── */
  {
    slug: 'healthy-meals-chennai',
    title: 'Healthy Meals in Chennai — Balanced Daily Tiffin | Bowled',
    metaDescription:
      'Healthy home-cooked meals in Chennai with balanced nutrition, cold-pressed oils and small-batch cooking. 700–800 kcal portions. From ₹89/meal.',
    keywords:
      'healthy meals chennai, healthy food delivery chennai, balanced meals chennai, nutritious food chennai, healthy lunch chennai, healthy tiffin chennai',
    eyebrow: 'Healthy meals in Chennai',
    h1: 'Healthy meals in Chennai that you can actually eat every day',
    intro: [
      '"Healthy food" in Chennai usually means one of two things — a quinoa-and-broccoli bowl that costs ₹400 and that you give up on by week three, or a salad that leaves you hungry by 4 PM. Both miss the point. The healthiest food is food you can eat every day for thirty days without dreading it. That is what Bowled is built around.',
      'Our three daily meals come in at 380–820 kcal each, with measured carbohydrates, protein and fibre. We cook in cold-pressed oils, slow-stew gravies rather than deep-fry, and ground masalas instead of stock spice mixes. The result is real Tamil home cooking — but tuned to be lighter than what most restaurants and cloud kitchens serve.',
    ],
    sections: [
      {
        eyebrow: 'What "healthy" actually means in Tamil cooking',
        heading: 'Health by tradition, not by trend',
        paragraphs: [
          'Tamil home cooking is, structurally, one of the healthier daily diets in the country. A typical lunch is roughly 55% carbohydrates (rice), 20% protein (sambar / kootu), 20% vegetables (poriyal, kootu, rasam), and 5% fermented dairy (mor / curd). The fibre comes from the lentils, the gut bacteria from the curd, the micronutrients from the rotating vegetables, and the digestion-aid from the rasam at the end.',
          'It is when you take this same template and pour restaurant-grade oil and ghee over it that it stops being healthy. Bowled cooks the template properly — we use ~40% less oil than a typical Chennai cloud kitchen — and the structure does the rest of the work.',
        ],
      },
      {
        eyebrow: 'The nutrition math',
        heading: 'What\'s actually on your plate',
        paragraphs: [
          'Every meal on the Bowled menu has its calorie count, protein content and tags visible in the app. Breakfasts range from 390 kcal (upma with coconut chutney) to 560 kcal (Sunday tiffin combo). Lunches sit between 680 and 850 kcal depending on whether it is a full-meals day, a variety-rice day or a biryani day. Dinners are typically lighter — 580 to 750 kcal.',
          'Over a week, an average Bowled subscriber eats about 16,200 kcal across 21 meals — roughly 2,300 kcal a day, which lines up with the recommended daily intake for an active adult. Protein averages 28g per meal across the week, with the chicken curry, parotta with egg curry, and biryani days pushing higher.',
        ],
        points: [
          {
            title: 'Less oil, more flavour',
            body: 'We cook with cold-pressed groundnut and sesame oils — the same kind your grandmother used. About 40% less oil per dish than a comparable cloud-kitchen meal.',
          },
          {
            title: 'No food colour, no preservatives',
            body: 'The orange in our sambar is from turmeric and tomato. The green in our chutney is from real coriander. Nothing else.',
          },
          {
            title: 'Whole ingredients, ground fresh',
            body: 'Whole spices ground weekly, vegetables sourced from small farms within 80 km of Chennai, rice from a Karnataka co-op since 2008.',
          },
          {
            title: 'Fermented dairy daily',
            body: 'Mor (Tamil buttermilk) and curd are part of nearly every lunch — the gut-bacteria layer most "healthy meal" services skip.',
          },
        ],
      },
      {
        eyebrow: 'Allergens and dietary needs',
        heading: 'Honest about what\'s in the food',
        paragraphs: [
          'Bowled supports six common allergen flags — peanuts, dairy, eggs, gluten, soy and shellfish. Mark them once in your profile and the app surfaces them on every meal card. On days when your flagged allergen is in the main dish, we offer the alternate menu for that slot. We are not a "fully gluten-free" or "fully dairy-free" service — most home Tamil cooking uses curd and atta — but the substitution model handles the day-to-day cases.',
        ],
      },
      {
        eyebrow: 'For working professionals',
        heading: 'Healthy lunch delivery in Chennai',
        paragraphs: [
          'Working professionals in Chennai who eat out daily tend to lose about 30–60 minutes a day to lunch decisions — what to order, where to walk to, how long until it arrives. Bowled removes that decision-loop entirely. Your meal arrives at 1 PM. You eat. You go back to work. The plan is yours for the month.',
          'On the nutrition side, Bowled lunches average 720 kcal and 28g protein — meaningfully lighter than a Swiggy biryani, a Saravana office meals plate, or a typical Indian Coffee House thali, all of which clock in around 900–1,100 kcal. You will be less sleepy at your 2 PM call.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Bowled food calorie-controlled?',
        a: 'Yes — every meal has a kcal count and a protein figure visible in the app. Across a week the average is ~2,300 kcal/day with 28g protein per meal, which matches recommended daily intake for an active adult.',
      },
      {
        q: 'Do you offer keto, gluten-free or vegan plans?',
        a: 'We do not offer a fully keto or vegan plan because Tamil home cooking does not naturally fit those frames. We do support gluten-free, dairy-free, peanut-free and other allergen flags on a per-day basis with menu substitution.',
      },
      {
        q: 'How much oil do you use per dish?',
        a: 'About 40% less than a typical Chennai cloud kitchen. We cook with cold-pressed groundnut and sesame oils, slow-stew gravies, and avoid deep-frying outside of a few items (vada, dosa, poori).',
      },
      {
        q: 'Is the food good for someone with diabetes or high blood pressure?',
        a: 'The structure of the meals — controlled portions of rice, plenty of vegetables, lentil-based protein, low oil, fermented dairy — fits most general dietary advice for diabetes and hypertension. We are not a medical-grade therapeutic kitchen though; if you have specific advice from a doctor, treat Bowled as a general healthy-eating service.',
      },
      {
        q: 'Is the food spicy?',
        a: 'Home-spicy, not restaurant-spicy. If you grew up in a Tamil home you will be very comfortable. If you are from a less spice-tolerant background, the rasam and sambar might feel mild-to-medium, the chicken curry medium-to-high.',
      },
      {
        q: 'Do you offer a millet menu?',
        a: 'Currently no — our menu is rice-based with traditional Tamil grains (urad dal, moong dal). A separate millet rotation is something we are evaluating for 2026.',
      },
    ],
    internalLinks: [
      {
        path: '/home-cooked-food-chennai',
        label: 'Home-cooked food in Chennai',
        blurb: 'The cooking philosophy behind our menu.',
      },
      {
        path: '/office-lunch-chennai',
        label: 'Office lunch in Chennai',
        blurb: 'How working professionals use Bowled for daily lunch.',
      },
      {
        path: '/best-meals-chennai',
        label: 'Best meals in Chennai',
        blurb: 'Why our balanced menu ranks among the city\'s best.',
      },
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan and pricing structure.',
      },
    ],
    cta: {
      headline: 'Eat well, eat home, eat every day.',
      sub: 'Balanced Tamil home cooking, three meals a day, from ₹89/meal.',
      buttonLabel: 'Start your healthy plan',
    },
  },

  /* ─── 5 · /meal-subscription-chennai ───────────────────────────────────── */
  {
    slug: 'meal-subscription-chennai',
    title: 'Meal Subscription in Chennai — Daily Tiffin Plans | Bowled',
    metaDescription:
      'Daily meal subscription in Chennai with weekly rotating Tamil menu. Plans from ₹89/meal. Solo, Squad and Floor pricing. Skip anytime, no commitment.',
    keywords:
      'meal subscription chennai, daily meal plan chennai, monthly meal subscription chennai, food subscription chennai, breakfast lunch dinner subscription chennai',
    eyebrow: 'Meal subscription in Chennai',
    h1: 'Meal subscription in Chennai — three home-cooked meals, every day',
    intro: [
      'A meal subscription is a different relationship with food than ordering or eating out. You pay once, the food arrives every day on a fixed schedule, and you stop thinking about it. Bowled is built for exactly that mode — three home-cooked Tamil meals a day, delivered to your door across Chennai, with one payment per cycle and no autorenewal.',
      'We offer three plan tiers (Solo, Squad, Floor) and four billing cycles, so subscribers from individual PG residents to ten-person hostel blocks pay a rate that fits their group. No hidden charges, no recharges, no surprise auto-debits.',
    ],
    sections: [
      {
        eyebrow: 'How the subscription works',
        heading: 'Pay once, eat for thirty days',
        paragraphs: [
          'Unlike pay-as-you-go delivery apps or pre-paid wallets, Bowled is a flat monthly subscription. Pick a plan, pay for the cycle, and three meals arrive every day until the cycle ends. There is no daily ordering, no per-meal payment, no "minimum order value", and no autorenewal at the end — you decide whether to renew when the cycle is ending, not the other way around.',
          'On the operations side, we cook fresh each morning, deliver hot to your door, and use a QR meal pass to mark each meal as served. You show the QR, the delivery person scans, your meal counter drops by one. No paperwork, no signing.',
        ],
      },
      {
        eyebrow: 'Plan tiers',
        heading: 'Solo, Squad and Floor — which one fits',
        paragraphs: [
          'Solo is the individual plan at ₹89 per meal. Squad drops to ₹69 per meal when you bring four friends onto the same code (five people on one Squad plan). Floor is ₹63 per meal when you have ten people on the same code, typically the residents of a single hostel floor.',
          'The per-meal price difference adds up. On a monthly plan with 26 cooking days, Solo costs ₹6,942 per person. Squad drops to ₹5,382 per person — savings of ₹1,560 per month each. Floor drops to ₹4,914 — savings of ₹2,028 per month each. The originator pays for the group upfront and shares the code; everyone else just joins.',
        ],
        points: [
          {
            title: 'Solo — ₹89/meal',
            body: 'For individual subscribers. ₹6,942 for the standard monthly cycle (26 cooking days, three meals/day).',
          },
          {
            title: 'Squad — ₹69/meal',
            body: 'For groups of five. Originator pays ₹26,910 upfront and shares the code with four friends, each of whom subscribes at ₹5,382 effectively.',
          },
          {
            title: 'Floor — ₹63/meal',
            body: 'For groups of ten. Originator pays ₹49,140 upfront and shares the code with nine friends, each at ₹4,914 effectively. Best for hostel floors.',
          },
        ],
      },
      {
        eyebrow: 'Billing cycles',
        heading: 'Weekly, monthly, weekdays-only — pick your rhythm',
        paragraphs: [
          'Different subscribers want different cooking-day patterns. We offer four cycles:',
        ],
        points: [
          {
            title: 'Weekly (all 7 days)',
            body: 'Seven cooking days. Three meals a day. Lightest commitment — good for first-time subscribers trying us out.',
          },
          {
            title: 'Weekly minus Sundays',
            body: 'Six cooking days. Sundays are off — useful if you go home or eat out on Sundays.',
          },
          {
            title: 'Monthly minus Sundays',
            body: 'Twenty-six cooking days over a month. Sundays off. Our most popular cycle — what most subscribers choose.',
          },
          {
            title: 'Monthly weekdays-only',
            body: 'Twenty-two cooking days. Saturday and Sunday off. Built around college and office weeks.',
          },
        ],
      },
      {
        eyebrow: 'Skip allowance',
        heading: 'Pause, skip, extend — life doesn\'t pause for meal plans',
        paragraphs: [
          'Real life has exam weeks, weddings, sick days, trips home. Bowled bakes this in. Monthly subscribers get a fixed allowance of meal-skips and full-day skips per cycle. Skipped meals extend your plan end-date by the same number of days, so you never lose what you paid for.',
          'Need a longer break — visiting family for ten days, going on a college trip? Use the pause feature instead of individual skips. Pause from-date to-date, and the plan extends by exactly that many days when you come back.',
        ],
      },
      {
        eyebrow: 'Payments',
        heading: 'UPI-only, no payment-gateway fees',
        paragraphs: [
          'We accept UPI payments directly — no payment-gateway, no per-transaction fees, no third-party middleman. You see the QR and our UPI ID on the subscription screen, pay using any UPI app, upload the screenshot and UTR, and an admin verifies the payment usually within a few hours. Plan activates immediately on verification. No autorenewal — you decide to renew at the end of each cycle.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How does the Bowled meal subscription work?',
        a: 'You pick a plan (Solo, Squad or Floor) and a billing cycle (weekly or monthly), pay for the cycle via UPI, and three home-cooked meals arrive at your door every cooking day until the cycle ends. No autorenewal — you decide at the end of each cycle whether to renew.',
      },
      {
        q: 'What is the minimum subscription period?',
        a: 'Our shortest cycle is weekly (seven cooking days). It is the lowest-commitment way to try us — pay once, eat for a week, and decide whether to continue.',
      },
      {
        q: 'Is there autorenewal?',
        a: 'No. Subscriptions do not auto-renew. When your current cycle ends, you choose whether to start a fresh one — no surprise charges, no auto-debit on your card or UPI.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'UPI only — Google Pay, PhonePe, Paytm or any other UPI app. You pay to our business UPI ID, upload the payment screenshot and the UTR, and admin verifies it within a few hours.',
      },
      {
        q: 'Can I get a refund?',
        a: 'If the food in your first week does not taste like home, write to us within seven days of starting your first plan and we will refund the full amount. After that, refunds are case-by-case — though you can always pause or skip to use up your remaining meals.',
      },
      {
        q: 'How does group billing work in Squad and Floor plans?',
        a: 'The originator pays for the full group upfront and shares the group code. Each friend who joins enters that code during signup and starts their subscription at the discounted rate without paying again — the group payment covers them.',
      },
      {
        q: 'Can I change my billing cycle mid-subscription?',
        a: 'Not in the middle of a cycle. You can change your cycle preference, and it takes effect on your next billing cycle.',
      },
    ],
    internalLinks: [
      {
        path: '/tiffin-service-chennai',
        label: 'Tiffin service Chennai',
        blurb: 'How Bowled compares to traditional Chennai tiffin services.',
      },
      {
        path: '/hostel-food-chennai',
        label: 'Hostel food Chennai',
        blurb: 'Hostel-specific subscription details.',
      },
      {
        path: '/pg-food-chennai',
        label: 'PG food Chennai',
        blurb: 'For PG residents — same plans, same delivery.',
      },
      {
        path: '/student-meals-chennai',
        label: 'Student meals Chennai',
        blurb: 'Student-focused pricing and skip allowance.',
      },
    ],
    cta: {
      headline: 'Subscribe once. Eat home-style for thirty days.',
      sub: 'No autorenewal. No hidden charges. Pause anytime.',
      buttonLabel: 'See plans from ₹89 / meal',
    },
  },

  /* ─── 6 · /tiffin-service-chennai ──────────────────────────────────────── */
  {
    slug: 'tiffin-service-chennai',
    title: 'Tiffin Service in Chennai — Daily Home Meals | Bowled',
    metaDescription:
      'Modern tiffin service in Chennai by Sree Krishna Catering. Three home-cooked Tamil meals delivered daily. Weekly menu rotation. From ₹89/meal.',
    keywords:
      'tiffin service chennai, tiffin delivery chennai, daily tiffin chennai, monthly tiffin chennai, best tiffin service in chennai, vegetarian tiffin chennai, non veg tiffin chennai',
    eyebrow: 'Tiffin service in Chennai',
    h1: 'Tiffin service in Chennai — the modern, app-driven version',
    intro: [
      'Tiffin services have been part of Chennai\'s food culture for decades — small home kitchens that deliver lunch dabbas to working bachelors, hostel residents and PG dwellers. The model is good. The execution is usually rough — phone-call ordering, cash-only payment, no menu rotation, no way to skip if you are travelling.',
      'Bowled is the same idea, modernised. The same kind of home-style Tamil cooking, the same kind of small-batch kitchens — but with an app, a fixed monthly plan, a rotating weekly menu, a QR meal pass and the ability to pause or skip without phone calls. Same food culture, twenty years forward.',
    ],
    sections: [
      {
        eyebrow: 'Tiffin, reimagined',
        heading: 'What a 2025 tiffin service looks like',
        paragraphs: [
          'A traditional Chennai tiffin service typically means one menu, one delivery slot, cash payment, manual ledgers, and a phone call every time you need to skip. It works, but it locks you into a fixed routine and leaves no room for the way younger Chennai actually lives — irregular schedules, travel, group living, app-based everything.',
          'Bowled keeps the parts of the traditional tiffin service that made it work — small kitchens, named cooks, daily fresh cooking, recognisable Tamil flavours — and rebuilds the rest around modern habits. Subscribe on an app, pay via UPI, get all three meals (not just lunch), follow a weekly rotating menu, scan a QR at delivery, skip from your phone.',
        ],
      },
      {
        eyebrow: 'How we compare to a traditional Chennai tiffin',
        heading: 'Old tiffin vs. Bowled',
        paragraphs: [],
        points: [
          {
            title: 'Menu — fixed vs. rotating',
            body: 'Most Chennai tiffin services have a fixed menu — sambar rice and curd rice, three times a week. We rotate the menu weekly across seven days, so you do not see the same combination twice in a week.',
          },
          {
            title: 'Meals — one vs. three',
            body: 'Traditional tiffin services usually cover only lunch. Bowled covers breakfast, lunch and dinner — the full day.',
          },
          {
            title: 'Payment — cash vs. UPI',
            body: 'Cash-and-ledger payments work for trust-based regulars but make it awkward to start subscribing or to share group plans. Bowled accepts UPI with a clear receipt and admin verification.',
          },
          {
            title: 'Skip — phone call vs. one tap',
            body: 'Skip a meal from the app in one tap. No phone calls, no remembering to inform akka the night before.',
          },
          {
            title: 'Coverage — neighbourhood vs. city',
            body: 'Traditional tiffin services are usually limited to a few streets around the kitchen. Bowled covers Adyar, Velachery, T. Nagar, OMR (Thoraipakkam to Sholinganallur), Anna Nagar and Tambaram.',
          },
        ],
      },
      {
        eyebrow: 'The food itself',
        heading: 'A weekly tiffin menu, properly varied',
        paragraphs: [
          'A good tiffin service is judged on the variety inside its week. Bowled\'s seven-day cycle starts gentle (idli, sambar, coconut chutney on Monday breakfast) and builds — pongal-vada Tuesday, dosa Wednesday, poori Thursday, upma Friday, kal-dosa Saturday, and the Sunday breakfast tiffin combo (idli, pongal, vada, sambar, chutney — the works).',
          'Lunches alternate between full Tamil meals (Monday, Friday), kara kuzhambu (Tuesday), chicken or veg fried rice (Wednesday), aviyal meals (Thursday), variety rice (Saturday) and biryani (Sunday). Dinners rotate dosa-kurma, chapati with chicken curry, chapati with veg salna, parotta with egg curry, dosa-kurma again, parotta with chicken salna, and a light Sunday dinner of dosa-kurma-rasam.',
        ],
      },
      {
        eyebrow: 'For working bachelors and small families',
        heading: 'Who Chennai tiffin subscribes',
        paragraphs: [
          'About half our subscribers are college students in hostels and PGs. The other half are working professionals — software engineers along OMR, doctors and consultants in the central belt, working bachelors in T. Nagar and Velachery. Some small families and elderly couples subscribe too — when home cooking has become harder to keep up with three times a day.',
          'The Squad and Floor plans are increasingly used by hostel blocks, IT-company team lunches, and groups of friends in the same neighbourhood pooling their plans. The discount kicks in at five, which is a manageable group size for most situations.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How is Bowled different from a regular Chennai tiffin service?',
        a: 'Same food philosophy, modernised operations — three meals a day (not just lunch), weekly rotating menu, UPI payment, app-based skip and pause, group plans, QR meal pass. The food is similar in spirit; the model is built for 2025.',
      },
      {
        q: 'Is Bowled vegetarian only, or do you serve non-veg?',
        a: 'Both. Roughly 70% of the weekly menu is vegetarian. Non-veg shows up on Tuesday dinner (chicken curry with chapati), Wednesday lunch (chicken fried rice option), Thursday dinner (parotta with egg curry), Saturday dinner (parotta with chicken salna) and Sunday lunch (chicken biryani).',
      },
      {
        q: 'Where does the food come from?',
        a: 'Cooked in four FSSAI Grade A kitchens across Chennai — Adyar (Saraswathi Akka), Velachery (Padma Aunty), OMR Thoraipakkam (Chef Anil), and T. Nagar (Meera Akka). Each kitchen cooks under fifty plates per batch.',
      },
      {
        q: 'How is the food delivered?',
        a: 'Compartmentalised eco-friendly containers. One container per meal, delivered to your door within the slot (breakfast 7:30 AM, lunch 1:00 PM, dinner 8:00 PM, give or take a few minutes).',
      },
      {
        q: 'Can I get only lunch — like a traditional tiffin?',
        a: 'Currently we sell three meals a day as a combined subscription. Subscribers who only want lunch typically buy the weekly minus Sundays plan and skip the breakfasts and dinners they do not want using the skip allowance. We are evaluating a lunch-only plan for late 2026.',
      },
      {
        q: 'Is the tiffin service available in all parts of Chennai?',
        a: 'Currently — Adyar, Besant Nagar, Indira Nagar, Velachery, Madipakkam, Pallikaranai, T. Nagar, Anna Nagar, Thoraipakkam, Karapakkam, Sholinganallur, Navalur, Tambaram. Expansion to Pallavaram, Mylapore and Tiruvanmiyur is planned for Q2 2026.',
      },
    ],
    internalLinks: [
      {
        path: '/home-cooked-food-chennai',
        label: 'Home-cooked food Chennai',
        blurb: 'Our cooking philosophy and weekly menu.',
      },
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan tiers and how billing works.',
      },
      {
        path: '/office-lunch-chennai',
        label: 'Office lunch Chennai',
        blurb: 'For working professionals subscribing for daily lunch.',
      },
      {
        path: '/best-meals-chennai',
        label: 'Best meals Chennai',
        blurb: 'Why our tiffin service ranks among the best in the city.',
      },
    ],
    cta: {
      headline: 'Tiffin service, modernised. Tamil food, made properly.',
      sub: 'Three meals daily, app-driven, group pricing from ₹63/meal.',
      buttonLabel: 'Subscribe to Bowled',
    },
  },

  /* ─── 7 · /best-meals-chennai ──────────────────────────────────────────── */
  {
    slug: 'best-meals-chennai',
    title: 'Best Meals in Chennai for Daily Eating | Bowled',
    metaDescription:
      "Looking for the best daily meals in Chennai? Bowled delivers fresh home-cooked Tamil food three times a day. Rated 4.8/5 by 300+ Chennai subscribers.",
    keywords:
      'best meals chennai, best food delivery chennai, best meal subscription chennai, best tiffin chennai, top rated meal service chennai',
    eyebrow: 'Best meals in Chennai',
    h1: 'Best meals in Chennai for everyday eating',
    intro: [
      '"Best" is a word that gets thrown around in food. Best biryani, best filter coffee, best dosa. The truth is, the best food in Chennai is not the one-off cheat-meal you order on a Saturday night — it is the food you can eat three times a day for thirty days without losing interest, without feeling heavy, and without wondering what the kitchen is hiding.',
      'Bowled is built for that definition of best. We are rated 4.8 out of 5 by over three hundred daily subscribers across Chennai — students, working professionals, small families. The food is real Tamil home cooking by Sree Krishna Catering, who have been at this since 2006.',
    ],
    sections: [
      {
        eyebrow: 'What makes a meal service "best"',
        heading: 'Three things subscribers care about',
        paragraphs: [
          'When we asked our first two hundred subscribers what made them stay past the trial week, three answers kept showing up — consistency, quality, and the ability to skip days. Restaurants and cloud kitchens nail one of those, sometimes two, rarely three. The "best meal service in Chennai" is the one that nails all three across a thirty-day cycle.',
        ],
        points: [
          {
            title: 'Consistency — same flavour, every day',
            body: 'Cooked by the same named chef in the same neighbourhood kitchen, in batches of under fifty plates. Saraswathi Akka has been making sambar the same way for nineteen years; you taste that consistency.',
          },
          {
            title: 'Quality — real ingredients, no shortcuts',
            body: 'Cold-pressed oils, weekly-ground spices, vegetables from farms within 80 km of Chennai, no preservatives, no food colour. Quality starts at the supply chain.',
          },
          {
            title: 'Flexibility — pause, skip, extend',
            body: 'Going home? Exam week? Wedding to attend? Pause your plan. Skip a meal. Your plan extends by the same number of days. You never lose what you paid for.',
          },
        ],
      },
      {
        eyebrow: 'What 300 subscribers say',
        heading: 'Rated 4.8 by daily eaters',
        paragraphs: [
          'Bowled subscribers rate every meal in the app — the chef gets the data, the menu rotates based on it, and the worst-rated dish of any week gets replaced or refined. Across our 300+ daily eaters, the rolling 30-day average sits at 4.8 out of 5. Ninety-three percent of first-month subscribers re-subscribe for a second cycle.',
          'The standouts that consistently rate above 4.85 — Saraswathi Akka\'s Friday full-meals, the Wednesday chicken fried rice, the Sunday biryani, and the Tuesday-dinner chapati with chicken curry. The breakfasts that get the most love — Monday idli-sambar and Sunday\'s tiffin combo.',
        ],
      },
      {
        eyebrow: 'Why subscribers stay',
        heading: 'It\'s not just the food',
        paragraphs: [
          'A meal subscription is partly food and partly logistics. The best meal service is the one where the logistics fade into the background — no daily ordering decisions, no payment friction, no calling akka to skip tomorrow\'s lunch. Bowled has built around removing these.',
          'Pay once for the cycle. The food arrives on schedule. Skip in one tap. Show your QR pass at delivery. Get a parent-facing weekly summary if you want one. Reset everything when your plan ends and renew if you want — no autorenewal.',
        ],
      },
      {
        eyebrow: 'Coverage',
        heading: 'The Chennai areas we currently serve',
        paragraphs: [
          'Bowled delivers across Adyar, Besant Nagar, Indira Nagar, Velachery, Madipakkam, Pallikaranai, T. Nagar, Anna Nagar, Thoraipakkam, Karapakkam, Sholinganallur, Navalur and Tambaram. If you are inside this polygon, we are at your door three times a day. Expansion to Mylapore, Pallavaram and Tiruvanmiyur is planned for Q2 2026.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the best meal subscription service in Chennai?',
        a: 'Bowled is rated 4.8/5 by 300+ daily subscribers across Chennai — students, working professionals and families. We are the home-style meal subscription venture from Sree Krishna Catering, a Chennai catering business since 2006.',
      },
      {
        q: 'How is Bowled different from food delivery apps?',
        a: 'Bowled is a subscription, not pay-per-order. You pay once for a monthly or weekly cycle and get three meals every day until the cycle ends — no daily ordering, no per-meal payment, no "minimum order value", no autorenewal. The food is also home-cooked Tamil rather than restaurant-style.',
      },
      {
        q: 'Why do you rotate the menu weekly?',
        a: 'Most meal services in Chennai run on a fixed cycle and get stale within a week. We rotate across seven days so you do not see the same combination twice in a week — and the menu changes properly once a quarter when our chefs introduce new dishes.',
      },
      {
        q: 'Can I see what is on the menu before I subscribe?',
        a: 'Yes — the full weekly menu is on the website and you can browse it day by day. Each meal shows ingredients, calories, and a vegetarian / non-vegetarian flag.',
      },
      {
        q: 'How quickly will the food arrive after I sign up?',
        a: 'Your first meal starts the next cooking day after your payment is verified — typically next breakfast or next lunch, depending on what time you complete signup. Verification usually happens within a few hours during business hours.',
      },
      {
        q: 'Is there a refund if I do not like the food?',
        a: 'Yes — if the food in your first week does not meet expectations, write to us within seven days and we will refund the full amount.',
      },
    ],
    internalLinks: [
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan tiers and how the subscription works.',
      },
      {
        path: '/home-cooked-food-chennai',
        label: 'Home-cooked food Chennai',
        blurb: 'The cooking philosophy that earns the 4.8 rating.',
      },
      {
        path: '/healthy-meals-chennai',
        label: 'Healthy meals Chennai',
        blurb: 'The nutrition side of why subscribers stay.',
      },
      {
        path: '/tiffin-service-chennai',
        label: 'Tiffin service Chennai',
        blurb: 'How we modernise the Chennai tiffin model.',
      },
    ],
    cta: {
      headline: 'Try the highest-rated meal subscription in Chennai.',
      sub: '4.8/5 by 300+ subscribers. From ₹89/meal. Skip anytime.',
      buttonLabel: 'Start your subscription',
    },
  },

  /* ─── 8 · /student-meals-chennai ───────────────────────────────────────── */
  {
    slug: 'student-meals-chennai',
    title: 'Student Meals in Chennai — Affordable Daily Plans | Bowled',
    metaDescription:
      'Affordable daily meals for students in Chennai. From ₹63/meal in a group of ten. Skip exam weeks, pause for trips home. Three home-cooked meals a day.',
    keywords:
      'student meals chennai, food for students chennai, college student food chennai, affordable meals chennai, cheap food delivery chennai students, student meal plan chennai',
    eyebrow: 'Student meals in Chennai',
    h1: 'Student meals in Chennai — affordable, home-style, every day',
    intro: [
      'Student food in Chennai is one of two stories. Either you are eating mess food that ranges from passable to grim, or you are spending half your month\'s pocket money on Swiggy. Neither is sustainable across a four-year degree. Bowled is built for the middle path — affordable, home-style, on a fixed monthly plan.',
      'Designed for students living in hostels, PGs and rented rooms across Chennai, Bowled delivers three Tamil home-cooked meals every day with a weekly rotating menu — at a price that drops sharply when you bring your friends in.',
    ],
    sections: [
      {
        eyebrow: 'Built around student life',
        heading: 'A meal plan that bends with your schedule',
        paragraphs: [
          'Student life is messy. Exams come in waves, trips home are unpredictable, college trips and tournaments happen with two days\' notice. Bowled bakes this in. Monthly subscribers get a fixed allowance of meal-skips and full-day skips per cycle. Skipped meals extend your plan end-date by the same number of days, so you never lose what you paid for.',
          'Need a longer break — going home for ten days, visiting grandparents? Pause your plan from the app. From-date to-date. The plan extends by exactly that many days when you come back. No phone calls, no remembering to inform the kitchen.',
        ],
      },
      {
        eyebrow: 'Pricing for students',
        heading: 'Why we charge what we charge — and why groups save',
        paragraphs: [
          'Solo plans are ₹89 per meal — a sensible standalone rate. The real student pricing kicks in when groups subscribe. Five roommates on a Squad plan drop to ₹69 per meal each, saving ₹1,560 per month. Ten people on a single Floor plan drop to ₹63 per meal each, saving ₹2,028 per month.',
          'That is genuine student-friendly pricing. A typical college student in Chennai who eats out daily spends ₹3,500–₹5,500 per month on lunch alone. A Floor-plan subscriber pays ₹4,914 per month for all three meals every cooking day.',
        ],
        points: [
          {
            title: 'Solo — ₹89/meal',
            body: 'Standalone plan. ₹6,942 for a monthly cycle (26 cooking days, three meals each day). Total monthly meal count: 78.',
          },
          {
            title: 'Squad — ₹69/meal',
            body: 'Five-friend plan. ₹5,382/month per person. Best for tight roommate groups in PGs and hostels.',
          },
          {
            title: 'Floor — ₹63/meal',
            body: 'Ten-person plan. ₹4,914/month per person. Most-used by hostel floors and shared houses.',
          },
        ],
      },
      {
        eyebrow: 'For Chennai students specifically',
        heading: 'Colleges we deliver near',
        paragraphs: [
          'We deliver to hostels and PGs around the major student belts in Chennai — IIT Madras, Anna University, SRM Vadapalani, Loyola, Madras Christian College, Stella Maris, MOP Vaishnav, Saveetha, and the engineering corridor along OMR including Sathyabama and Hindustan. The four kitchens (Adyar, Velachery, T. Nagar, OMR) cover most student-dense neighbourhoods.',
        ],
      },
      {
        eyebrow: 'For parents',
        heading: 'A weekly summary — if you want',
        paragraphs: [
          'For students whose parents are deciding voice on subscriptions, Bowled has an optional weekly WhatsApp summary directly to parents. Meals served, protein average, week\'s favourite dish, your notes if any. Most parents say it gives them peace of mind without feeling like surveillance. You decide whether to opt in.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does student food cost in Chennai with Bowled?',
        a: 'From ₹89 per meal Solo, dropping to ₹69 in a group of five (Squad) and ₹63 in a group of ten (Floor). Monthly all-in cost ranges from ₹4,914 to ₹6,942 depending on group size.',
      },
      {
        q: 'Do you have a student discount?',
        a: 'The Squad (₹69/meal) and Floor (₹63/meal) plans are effectively our group student pricing. The more friends you bring on the same code, the lower the per-person rate.',
      },
      {
        q: 'What happens to my plan during semester breaks?',
        a: 'Use the pause feature. Pause from-date to-date and the plan extends by that many days when you resume. Or use the skip allowance for shorter breaks (a few days at a time).',
      },
      {
        q: 'Can I share a plan with my hostel roommates?',
        a: 'Yes — that is exactly what Squad and Floor plans are for. The originator pays for the group upfront and shares the code. Each roommate joins with that code and starts subscribing at the discounted rate without paying again.',
      },
      {
        q: 'Is the food good for late-night study sessions?',
        a: 'Dinner is delivered around 8 PM — comfortably ahead of late-night study. We do not currently deliver supper / midnight food. Dinners tend to be lighter (580–750 kcal), which actually helps if you are studying after.',
      },
      {
        q: 'Can my parents pay for my Bowled subscription?',
        a: 'Yes — UPI payments work from any account. Your parent can transfer the amount to our business UPI ID, you submit the UTR + screenshot in the app, and the plan activates once admin verifies.',
      },
      {
        q: 'Do you deliver near my college?',
        a: 'If your college is in or near Adyar, Velachery, T. Nagar, OMR, Anna Nagar or Tambaram, yes. Specific campuses we currently serve include IIT Madras, Anna University, Loyola, SRM Vadapalani, MCC, Stella Maris, MOP Vaishnav, Sathyabama, Hindustan and Saveetha hostels and adjacent PGs.',
      },
    ],
    internalLinks: [
      {
        path: '/hostel-food-chennai',
        label: 'Hostel food Chennai',
        blurb: 'Hostel-specific delivery and subscription details.',
      },
      {
        path: '/pg-food-chennai',
        label: 'PG food Chennai',
        blurb: 'If you are in a PG rather than a hostel.',
      },
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan structure, billing cycles, group pricing.',
      },
      {
        path: '/best-meals-chennai',
        label: 'Best meals Chennai',
        blurb: 'Why 300+ Chennai students stay subscribed.',
      },
    ],
    cta: {
      headline: 'Affordable home-style meals for Chennai students.',
      sub: 'From ₹63/meal in a group of ten. Skip exam weeks, pause for trips home.',
      buttonLabel: 'See student plans',
    },
  },

  /* ─── 9 · /office-lunch-chennai ────────────────────────────────────────── */
  {
    slug: 'office-lunch-chennai',
    title: 'Office Lunch Delivery in Chennai — Daily Tiffin | Bowled',
    metaDescription:
      'Daily office lunch delivery in Chennai. Home-cooked Tamil meals to your office desk by 1 PM. From ₹89/meal. Pause when you work from home.',
    keywords:
      'office lunch chennai, office tiffin chennai, office food delivery chennai, working professional meals chennai, daily lunch chennai, lunch delivery omr chennai',
    eyebrow: 'Office lunch in Chennai',
    h1: 'Office lunch delivery in Chennai for working professionals',
    intro: [
      'Working professionals in Chennai eat lunch in roughly three ways — the office cafeteria (consistent but rarely exciting), local restaurants and Saravana-style mess (good but cumbersome to walk to daily), or daily Swiggy (expensive and heavy). None of them are designed for someone who eats lunch at the same desk five days a week, for fifty weeks a year.',
      'Bowled is the fourth option. A monthly subscription that delivers home-cooked Tamil lunch to your office desk by 1 PM every weekday — and to your home on weekends if you stay subscribed for all seven days. Built around working schedules, hybrid weeks and the reality of Chennai traffic.',
    ],
    sections: [
      {
        eyebrow: 'For Chennai\'s working belt',
        heading: 'Built around the IT corridor and central offices',
        paragraphs: [
          'Bowled\'s OMR kitchen handles the Rajiv Gandhi Salai corridor — from Tidel Park down to Sholinganallur and Navalur. Our T. Nagar kitchen covers the central belt — Nungambakkam, Anna Salai, T. Nagar offices. Adyar and Velachery kitchens reach the south side. Wherever your office is, one of our kitchens is within delivery range.',
          'Delivery to office addresses works the same as residential — a delivery person arrives in the 12:45 PM to 1:15 PM slot, you show your QR meal pass, meal counter drops by one. Several offices in OMR have started doing pooled Floor plans (₹63/meal) for ten-person teams, which works well in shared cafeteria contexts.',
        ],
      },
      {
        eyebrow: 'Why office lunch goes wrong',
        heading: 'And how a subscription fixes it',
        paragraphs: [
          'Working professionals lose roughly thirty to sixty minutes a day to lunch decisions — checking Swiggy, walking to a restaurant, queuing at the office cafeteria. Multiply that across five days and you lose three hours a week to lunch logistics alone. A daily subscription removes the decision entirely. The food shows up. You eat. You go back to work.',
          'On the cost side, the math is straightforward. A daily Swiggy lunch in Chennai costs ₹200–₹350 with delivery fees. Bowled lunches are ₹89 per meal Solo, ₹69 in a Squad, ₹63 in a Floor. Even on the most expensive plan, you save 50–60% vs. daily app delivery.',
        ],
        points: [
          {
            title: 'No lunch decision fatigue',
            body: 'The food arrives. You eat. No "what should I get today" loop at 12:30.',
          },
          {
            title: 'Home-style, not restaurant-heavy',
            body: 'Lunches average 720 kcal and 28g protein — meaningfully lighter than a typical Chennai restaurant biryani or office cafeteria thali. You will be less sleepy at your 2 PM call.',
          },
          {
            title: 'Hybrid-week friendly',
            body: 'Working from home Tuesday and Thursday? Skip those days, the plan extends. Or just have lunch delivered to your home address those days — we deliver to both office and home addresses for the same subscriber.',
          },
        ],
      },
      {
        eyebrow: 'For team lunches',
        heading: 'Office Floor plans for ten-person teams',
        paragraphs: [
          'Several Chennai offices use Bowled as a structured daily team-lunch programme. A team lead originates a Floor plan and shares the group code with nine teammates. Each teammate joins at ₹63/meal and the team gets ten meals delivered together every weekday at 1 PM. Works particularly well for small startups and ten-person teams in OMR / T. Nagar.',
          'Some companies subsidise part of the Bowled subscription as a perk. We are happy to invoice a company directly for the originator side of a Floor plan if that helps — write to us from the Contact section.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you deliver office lunch in OMR?',
        a: 'Yes — the OMR kitchen covers the full Rajiv Gandhi Salai corridor from Tidel Park to Navalur. Most major tech parks (Tidel Park, RMZ Millenia, DLF, Tata Consultancy, Cognizant, Infosys campuses) are inside the delivery zone.',
      },
      {
        q: 'Can I have lunch delivered to my office and dinner to my home?',
        a: 'Yes — you can set different addresses per delivery slot in your profile. Lunch goes to office, breakfast and dinner go to home.',
      },
      {
        q: 'What if I work from home some days?',
        a: 'Two options. (1) Skip those days using your skip allowance — the plan extends by the same days. (2) Have lunch delivered to your home address those days; we will route accordingly.',
      },
      {
        q: 'Do you do corporate billing?',
        a: 'Yes — for Floor-tier office plans, we can invoice a company directly for the originator payment. Write to us from the Contact page; we will set it up.',
      },
      {
        q: 'How does the team Floor plan work?',
        a: 'A team lead originates the Floor plan and pays ₹49,140 upfront for ten people on a monthly cycle. The group code is shared with nine teammates. Each teammate joins via the app, signs up with their phone, enters the group code, and their subscription starts at ₹63/meal without separate payment.',
      },
      {
        q: 'When does the office lunch arrive?',
        a: 'Lunch deliveries land between 12:45 PM and 1:15 PM. Light traffic days closer to 12:45; heavier days closer to 1:15. We always start cooking by 11 AM so the food is fresh on arrival.',
      },
    ],
    internalLinks: [
      {
        path: '/meal-subscription-chennai',
        label: 'Meal subscription Chennai',
        blurb: 'Plan tiers and billing cycles.',
      },
      {
        path: '/healthy-meals-chennai',
        label: 'Healthy meals Chennai',
        blurb: 'Calorie and nutrition data on every meal.',
      },
      {
        path: '/home-cooked-food-chennai',
        label: 'Home-cooked food Chennai',
        blurb: 'Our cooking philosophy and ingredient sourcing.',
      },
      {
        path: '/best-meals-chennai',
        label: 'Best meals Chennai',
        blurb: 'Why working professionals choose Bowled.',
      },
    ],
    cta: {
      headline: 'Office lunch, sorted for the year.',
      sub: 'Home-cooked Tamil lunch at your desk by 1 PM. From ₹89/meal Solo, ₹63 in a team of ten.',
      buttonLabel: 'Start an office plan',
    },
  },
]

/* ────────────────────────────────────────────────────────────────────────── */

/** Quick lookup helper for the router. */
export function findLanding(slug: string): SeoLanding | undefined {
  return LANDINGS.find((l) => l.slug === slug)
}
