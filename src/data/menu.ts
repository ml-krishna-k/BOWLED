import type { DayMenu } from '@/types'

export const WEEKLY_MENU: DayMenu[] = [
  {
    day: 'Monday', short: 'Mon',
    meals: {
      breakfast: {
        id: 'm-b', name: 'Poha & Filter Coffee',
        description: 'Light, fluffy poha with peanuts, curry leaves and a hot south-style filter coffee.',
        calories: 380, isVeg: true, rating: 4.7,
        tags: ['light', 'classic'], loved: true,
      },
      lunch: {
        id: 'm-l', name: 'Dal Tadka Thali',
        description: 'Yellow dal tadka, jeera rice, ghee phulka, beans poriyal, curd and gulab jamun.',
        calories: 720, isVeg: true, rating: 4.8,
        tags: ['home-style', 'comfort'], loved: true,
      },
      dinner: {
        id: 'm-d', name: 'Veg Pulao & Raita',
        description: 'Aromatic veg pulao with cool boondi raita, papad and pickle.',
        calories: 640, isVeg: true, rating: 4.6, tags: ['light dinner'],
      },
    },
  },
  {
    day: 'Tuesday', short: 'Tue',
    meals: {
      breakfast: {
        id: 't-b', name: 'Masala Dosa',
        description: 'Crisp dosa with potato masala, coconut chutney and sambar.',
        calories: 460, isVeg: true, rating: 4.9, tags: ['south', 'crowd favourite'], loved: true,
      },
      lunch: {
        id: 't-l', name: 'Rajma Chawal',
        description: 'Slow-cooked rajma in tomato-onion gravy, basmati rice, salad and roasted papad.',
        calories: 750, isVeg: true, rating: 4.7, tags: ['north-indian'],
      },
      dinner: {
        id: 't-d', name: 'Chapati & Bhindi Masala',
        description: 'Soft chapatis, dry bhindi masala, dal fry, salad and a sweet treat.',
        calories: 610, isVeg: true, rating: 4.5, tags: ['home-style'],
      },
    },
  },
  {
    day: 'Wednesday', short: 'Wed',
    meals: {
      breakfast: {
        id: 'w-b', name: 'Idli Sambar',
        description: 'Steamed idlis with hot sambar and two chutneys — coconut and tomato.',
        calories: 410, isVeg: true, rating: 4.8, tags: ['light', 'south'],
      },
      lunch: {
        id: 'w-l', name: 'Chicken Curry Bowl',
        description: 'Tender chicken curry with onion-tomato masala, jeera rice and salad.',
        calories: 780, isVeg: false, rating: 4.8, tags: ['non-veg'], loved: true,
      },
      dinner: {
        id: 'w-d', name: 'Khichdi & Kadhi',
        description: 'Comforting moong-dal khichdi with tangy kadhi, ghee and pickle.',
        calories: 580, isVeg: true, rating: 4.6, tags: ['comfort', 'easy on tummy'],
      },
    },
  },
  {
    day: 'Thursday', short: 'Thu',
    meals: {
      breakfast: {
        id: 'th-b', name: 'Aloo Paratha',
        description: 'Two aloo parathas with white butter, curd and pickle.',
        calories: 520, isVeg: true, rating: 4.7, tags: ['filling'],
      },
      lunch: {
        id: 'th-l', name: 'Chole Bhature Bowl',
        description: 'Spiced chole, one fluffy bhatura, onions, lemon and a sweet.',
        calories: 820, isVeg: true, rating: 4.8, tags: ['indulgent'], loved: true,
      },
      dinner: {
        id: 'th-d', name: 'Veg Hakka Noodles',
        description: 'Stir-fried hakka noodles with crunchy veggies and house schezwan.',
        calories: 600, isVeg: true, rating: 4.5, tags: ['indo-chinese'],
      },
    },
  },
  {
    day: 'Friday', short: 'Fri',
    meals: {
      breakfast: {
        id: 'f-b', name: 'Upma & Banana',
        description: 'Soft semolina upma with cashew, curry leaves and a fresh banana.',
        calories: 360, isVeg: true, rating: 4.4, tags: ['light'],
      },
      lunch: {
        id: 'f-l', name: 'Egg Curry Thali',
        description: 'Two egg masala curry, jeera rice, dal, salad and curd.',
        calories: 740, isVeg: false, rating: 4.7, tags: ['protein-rich'],
      },
      dinner: {
        id: 'f-d', name: 'Paneer Butter Masala',
        description: 'Creamy paneer butter masala with butter naan and salad.',
        calories: 760, isVeg: true, rating: 4.9, tags: ['weekend treat'], loved: true,
      },
    },
  },
  {
    day: 'Saturday', short: 'Sat',
    meals: {
      breakfast: {
        id: 's-b', name: 'Pesarattu & Chutney',
        description: 'Crispy moong-dal pesarattu with ginger chutney and upma.',
        calories: 440, isVeg: true, rating: 4.6, tags: ['high-protein'],
      },
      lunch: {
        id: 's-l', name: 'Biryani Bowl',
        description: 'House dum biryani with raita, salan and a boiled egg.',
        calories: 820, isVeg: false, rating: 4.9, tags: ['weekend special'], loved: true,
      },
      dinner: {
        id: 's-d', name: 'Pav Bhaji',
        description: 'Buttery pav bhaji with chopped onion, lemon and roasted pav.',
        calories: 680, isVeg: true, rating: 4.7, tags: ['street-style'],
      },
    },
  },
  {
    day: 'Sunday', short: 'Sun',
    meals: {
      breakfast: {
        id: 'su-b', name: 'Chole Kulche',
        description: 'Slow-cooked chole with soft kulchas, onions and tangy pickle.',
        calories: 540, isVeg: true, rating: 4.7, tags: ['weekend'],
      },
      lunch: {
        id: 'su-l', name: 'Sunday Special Thali',
        description: 'Rotis, sabzi, dal, jeera rice, raita, papad, salad and dessert.',
        calories: 820, isVeg: true, rating: 4.9, tags: ['festive'], loved: true,
      },
      dinner: {
        id: 'su-d', name: 'Tomato Rasam Rice',
        description: 'Soothing tomato rasam with rice, ghee, papad and curd.',
        calories: 540, isVeg: true, rating: 4.5, tags: ['light'],
      },
    },
  },
]
