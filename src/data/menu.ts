import type { DayMenu } from '@/types'

/**
 * Bowled — official weekly rotating menu (Tamil home cooking by Sree Krishna Catering).
 *
 * This is the BASELINE. Admin can override any individual meal via the
 * /admin/menu editor, which writes MenuOverride records to Mongo and merges
 * on top of this in `applyMenuOverrides`.
 *
 * Slots: breakfast / lunch / dinner. Evening snacks intentionally not part
 * of the subscription product — that's a separate scope.
 */
export const WEEKLY_MENU: DayMenu[] = [
  {
    day: 'Monday', short: 'Mon',
    meals: {
      breakfast: {
        id: 'm-b', name: 'Onion Uttapam with Sambar',
        description: 'Soft onion uttapam with hot sambar, coconut chutney, filter coffee and milk.',
        calories: 460, isVeg: true, rating: 4.7,
        tags: ['south-indian', 'classic'],
      },
      lunch: {
        id: 'm-l', name: 'Radish Sambar Meals',
        description: 'Rice with radish sambar, cabbage-carrot-beans poriyal, rasam, butter milk, appalam (2) and pickle.',
        calories: 720, isVeg: true, rating: 4.8,
        tags: ['full meals', 'home-style', 'tamil'], loved: true,
      },
      dinner: {
        id: 'm-d', name: 'Variety Rice Combo',
        description: 'Sambar saatam variety rice with curd rice, potato chips, seasonal fruits, milk and coffee.',
        calories: 640, isVeg: true, rating: 4.6,
        tags: ['variety rice', 'comfort'],
      },
    },
  },
  {
    day: 'Tuesday', short: 'Tue',
    meals: {
      breakfast: {
        id: 't-b', name: 'Idiyappam with Veg Kurma',
        description: 'Four soft idiyappam strings with vegetable kurma, kichadi, sweetened coconut milk, coffee and milk.',
        calories: 540, isVeg: true, rating: 4.7,
        tags: ['south-indian', 'kerala-tamil'],
      },
      lunch: {
        id: 't-l', name: 'Vathakulambu Meals',
        description: 'Rice with tangy vathakulambu, keerai kootu, rasam, butter milk, appalam (2) and pickle.',
        calories: 700, isVeg: true, rating: 4.7,
        tags: ['tamil', 'home-style'],
      },
      dinner: {
        id: 't-d', name: 'Rava Dosai & Idly Combo',
        description: 'Two rava dosai with idly, coconut chutney, sambar, idly podi with gingelly oil, rice, rasam, pickle, milk and coffee.',
        calories: 720, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'tiffin'],
      },
    },
  },
  {
    day: 'Wednesday', short: 'Wed',
    meals: {
      breakfast: {
        id: 'w-b', name: 'Dosa with Sambar',
        description: 'Crisp dosa with sambar, tomato chutney, idly podi with gingelly oil, filter coffee and milk.',
        calories: 480, isVeg: true, rating: 4.7,
        tags: ['south-indian', 'crowd favourite'],
      },
      lunch: {
        id: 'w-l', name: 'Chicken Gravy Meals',
        description: 'Rice with chicken gravy (100g chicken) or fish kozhambu with fish fry, butter milk, rasam, appalam (2), pickle and a sweet.',
        calories: 820, isVeg: false, rating: 4.9,
        tags: ['non-veg', 'mid-week special'], loved: true,
      },
      dinner: {
        id: 'w-d', name: 'Chapathi with White Kuruma',
        description: 'Soft chapathi with creamy white vegetable kuruma, curd rice and fresh lemon juice.',
        calories: 600, isVeg: true, rating: 4.6,
        tags: ['north-south', 'comfort'],
      },
    },
  },
  {
    day: 'Thursday', short: 'Thu',
    meals: {
      breakfast: {
        id: 'th-b', name: 'Pongal Combo with Vadai',
        description: 'Ven pongal and sweet pongal with crispy medu vadai (1), coconut chutney, sambar, coffee and milk.',
        calories: 560, isVeg: true, rating: 4.8,
        tags: ['south-indian', 'filling'], loved: true,
      },
      lunch: {
        id: 'th-l', name: 'Urundai Kuzhambu Meals',
        description: 'Rice with urundai kuzhambu (or mor kuzhambu), ladiesfinger or raw banana poriyal, rasam, butter milk, curd, appalam (2) and pickle.',
        calories: 720, isVeg: true, rating: 4.7,
        tags: ['tamil', 'regional'],
      },
      dinner: {
        id: 'th-d', name: 'Poori with Channa Gravy',
        description: 'Fluffy poori with rich channa gravy, curd rice, pickle and lemon juice.',
        calories: 720, isVeg: true, rating: 4.7,
        tags: ['north-indian', 'filling'],
      },
    },
  },
  {
    day: 'Friday', short: 'Fri',
    meals: {
      breakfast: {
        id: 'f-b', name: 'Idly with Groundnut Chutney',
        description: 'Soft steamed idly with sambar, groundnut chutney, idly podi with gingelly oil, filter coffee and milk.',
        calories: 440, isVeg: true, rating: 4.7,
        tags: ['south-indian', 'light'],
      },
      lunch: {
        id: 'f-l', name: 'Variety Rice Friday',
        description: 'Pudina rice or turmeric rice or sambar sadam or tomato rice or lemon rice with potato fry, keerai kootu, rasam, butter milk, appalam (2) and pickle.',
        calories: 740, isVeg: true, rating: 4.8,
        tags: ['variety rice', 'tamil', 'special'], loved: true,
      },
      dinner: {
        id: 'f-d', name: 'Kal Dosai with Idly Podi',
        description: 'Kal dosai with idly podi and gingelly oil, tomato chutney, sambar, rice, rasam, pickle, milk and coffee.',
        calories: 660, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'home-style'],
      },
    },
  },
  {
    day: 'Saturday', short: 'Sat',
    meals: {
      breakfast: {
        id: 's-b', name: 'Poori with Potato Masala',
        description: 'Fluffy poori with classic potato masala, filter coffee and milk.',
        calories: 540, isVeg: true, rating: 4.7,
        tags: ['filling', 'classic'],
      },
      lunch: {
        id: 's-l', name: 'Brinjal Drumstick Sambar Meals',
        description: 'Rice with brinjal-drumstick-raw-mango sambar, poriyal, rasam, ghee, paruppu podi, curd, payasam, appalam (2) and pickle.',
        calories: 800, isVeg: true, rating: 4.9,
        tags: ['tamil', 'home-style', 'special'], loved: true,
      },
      dinner: {
        id: 's-d', name: 'Ghee Rice with Veg Kuruma',
        description: 'Fragrant ghee rice with vegetable kuruma, curd rice, potato chips, pickle, milk and coffee.',
        calories: 760, isVeg: true, rating: 4.7,
        tags: ['weekend', 'comfort'],
      },
    },
  },
  {
    day: 'Sunday', short: 'Sun',
    meals: {
      breakfast: {
        id: 'su-b', name: 'Bread, Butter Jam & Upma',
        description: 'Four slices of bread with butter and jam, semiya or rava upma, chutney, filter coffee and milk.',
        calories: 520, isVeg: true, rating: 4.6,
        tags: ['weekend', 'continental-indian'],
      },
      lunch: {
        id: 'su-l', name: 'Chicken Briyani Special',
        description: 'Aromatic chicken briyani (100g chicken) with onion raitha, brinjal chutney, curd rice and ice cream.',
        calories: 880, isVeg: false, rating: 4.9,
        tags: ['biryani', 'non-veg', 'sunday special'], loved: true,
      },
      dinner: {
        id: 'su-d', name: 'Idly with Green Chutney',
        description: 'Soft idly with sambar, green chutney, idly podi, gingelly oil rice, rasam, pickle, milk and coffee.',
        calories: 580, isVeg: true, rating: 4.6,
        tags: ['south-indian', 'light'],
      },
    },
  },
]
