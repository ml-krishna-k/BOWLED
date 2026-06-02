import type { DayMenu } from '@/types'

/**
 * Bowled — weekly rotating menu (Tamil home cooking by Sree Krishna Catering).
 *
 * This is the BASELINE. Admin can override any individual meal via the
 * /admin/menu editor, which writes MenuOverride records to Mongo and merges
 * on top of this in `applyMenuOverrides`.
 */
export const WEEKLY_MENU: DayMenu[] = [
  {
    day: 'Monday', short: 'Mon',
    meals: {
      breakfast: {
        id: 'm-b', name: 'Idli, Sambar & Coconut Chutney',
        description: 'Soft steamed idlis with hot sambar and freshly-ground coconut chutney.',
        calories: 410, isVeg: true, rating: 4.7,
        tags: ['light', 'south-indian', 'classic'],
      },
      lunch: {
        id: 'm-l', name: 'South Indian Meals',
        description: 'Rice, sambar, beans poriyal, kootu, rasam and mor — a balanced home-style plate.',
        calories: 720, isVeg: true, rating: 4.8,
        tags: ['full meals', 'home-style', 'comfort'], loved: true,
      },
      dinner: {
        id: 'm-d', name: 'Dosa, Veg Kurma & Tomato Chutney',
        description: 'Crisp dosa with rich vegetable kurma and tangy tomato chutney.',
        calories: 620, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'light dinner'],
      },
    },
  },
  {
    day: 'Tuesday', short: 'Tue',
    meals: {
      breakfast: {
        id: 't-b', name: 'Pongal & Vada',
        description: 'Ven pongal with crispy medu vada, coconut chutney and sambar.',
        calories: 480, isVeg: true, rating: 4.7,
        tags: ['filling', 'south-indian'],
      },
      lunch: {
        id: 't-l', name: 'Kara Kuzhambu Meals',
        description: 'Rice with tangy kara kuzhambu, cabbage poriyal, rasam and mor.',
        calories: 700, isVeg: true, rating: 4.6,
        tags: ['tamil', 'home-style'],
      },
      dinner: {
        id: 't-d', name: 'Chapati with Chicken Curry',
        description: 'Soft chapatis with home-style chicken curry and onion salad.',
        calories: 720, isVeg: false, rating: 4.8,
        tags: ['non-veg', 'protein-rich'], loved: true,
      },
    },
  },
  {
    day: 'Wednesday', short: 'Wed',
    meals: {
      breakfast: {
        id: 'w-b', name: 'Dosa with Tomato Chutney',
        description: 'Crispy dosa served with tomato chutney and warm sambar.',
        calories: 440, isVeg: true, rating: 4.7,
        tags: ['south-indian', 'crowd favourite'],
      },
      lunch: {
        id: 'w-l', name: 'Chicken Fried Rice',
        description: 'Wok-tossed chicken fried rice with onion raita and a side of gobi or paneer fry.',
        calories: 780, isVeg: false, rating: 4.8,
        tags: ['non-veg', 'mid-week treat'], loved: true,
      },
      dinner: {
        id: 'w-d', name: 'Chapati & Veg Salna',
        description: 'Soft chapatis with spicy Tamil-style vegetable salna gravy.',
        calories: 580, isVeg: true, rating: 4.5,
        tags: ['tamil', 'comfort'],
      },
    },
  },
  {
    day: 'Thursday', short: 'Thu',
    meals: {
      breakfast: {
        id: 'th-b', name: 'Poori with Potato Masala',
        description: 'Fluffy pooris with classic potato masala and coconut chutney.',
        calories: 520, isVeg: true, rating: 4.7,
        tags: ['filling', 'south-indian'],
      },
      lunch: {
        id: 'th-l', name: 'Aviyal Meals',
        description: 'Rice with sambar, traditional aviyal, rasam and mor — Kerala-Tamil borderlands classic.',
        calories: 700, isVeg: true, rating: 4.7,
        tags: ['regional', 'home-style'],
      },
      dinner: {
        id: 'th-d', name: 'Parotta with Egg Curry',
        description: 'Layered Malabar parotta with rich egg curry and onion raita.',
        calories: 750, isVeg: false, rating: 4.8,
        tags: ['non-veg', 'street-style'], loved: true,
      },
    },
  },
  {
    day: 'Friday', short: 'Fri',
    meals: {
      breakfast: {
        id: 'f-b', name: 'Upma with Coconut Chutney',
        description: 'Soft semolina upma with coconut chutney and warm sambar.',
        calories: 390, isVeg: true, rating: 4.5,
        tags: ['light', 'south-indian'],
      },
      lunch: {
        id: 'f-l', name: 'Full Meals (Friday Special)',
        description: 'Rice, sambar, rasam, poriyal, kootu and mor — the complete Tamil thali.',
        calories: 720, isVeg: true, rating: 4.9,
        tags: ['full meals', 'tamil', 'special'], loved: true,
      },
      dinner: {
        id: 'f-d', name: 'Dosa with Veg Kurma',
        description: 'Crispy dosa with vegetable kurma and tomato chutney.',
        calories: 620, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'light dinner'],
      },
    },
  },
  {
    day: 'Saturday', short: 'Sat',
    meals: {
      breakfast: {
        id: 's-b', name: 'Kal Dosa with Tomato Chutney',
        description: 'Thick, soft kal dosa with tomato chutney and sambar.',
        calories: 470, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'filling'],
      },
      lunch: {
        id: 's-l', name: 'Tamarind & Lemon Rice Combo',
        description: 'Tamarind rice with lemon or pudhina rice, potato poriyal, chips/appalam and mor.',
        calories: 680, isVeg: true, rating: 4.7,
        tags: ['variety rice', 'tamil'],
      },
      dinner: {
        id: 's-d', name: 'Parotta with Chicken Salna',
        description: 'Layered parotta with fiery chicken salna and a side omelette.',
        calories: 830, isVeg: false, rating: 4.9,
        tags: ['non-veg', 'weekend special'], loved: true,
      },
    },
  },
  {
    day: 'Sunday', short: 'Sun',
    meals: {
      breakfast: {
        id: 'su-b', name: 'Sunday Tiffin Combo',
        description: 'Idli, pongal and vada with coconut chutney and sambar — the works.',
        calories: 560, isVeg: true, rating: 4.9,
        tags: ['festive', 'south-indian'], loved: true,
      },
      lunch: {
        id: 'su-l', name: 'Chicken Briyani Special',
        description: 'Aromatic chicken or veg biryani with onion raita, boiled egg and brinjal curry.',
        calories: 850, isVeg: false, rating: 4.9,
        tags: ['biryani', 'weekend special', 'festive'], loved: true,
      },
      dinner: {
        id: 'su-d', name: 'Dosa with Veg Kurma',
        description: 'Light dosa with vegetable kurma and rasam to wind down the week.',
        calories: 580, isVeg: true, rating: 4.5,
        tags: ['south-indian', 'light'],
      },
    },
  },
]
