import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Marquee } from '@/components/sections/Marquee'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { WeeklyMenu } from '@/components/sections/WeeklyMenu'
import { Plans } from '@/components/sections/Plans'
import { WhyStudents } from '@/components/sections/WhyStudents'
import { FoodShowcase } from '@/components/sections/FoodShowcase'
import { ParentTrust } from '@/components/sections/ParentTrust'
import { Testimonials } from '@/components/sections/Testimonials'
import { KitchenTrust } from '@/components/sections/KitchenTrust'
import { AppPreview } from '@/components/sections/AppPreview'
import { FAQ } from '@/components/sections/FAQ'
import { CTA } from '@/components/sections/CTA'
import { Seo, localBusinessSchema, faqPageSchema } from '@/components/seo/Seo'
import { FAQS } from '@/data/faq'

export function Home() {
  return (
    <>
      <Seo
        title="Bowled — Home-Style Daily Meals in Chennai | Tamil Tiffin"
        description="Bowled delivers three home-cooked Tamil meals a day across Chennai. PG, hostel, office or home — from ₹69/meal. By Sree Krishna Catering since 2006."
        keywords="meal subscription chennai, home cooked food chennai, tiffin service chennai, hostel food chennai, pg food chennai, student meals chennai, healthy meals chennai, office lunch chennai, tamil home cooking chennai"
        path="/"
        ogType="website"
        schema={[
          localBusinessSchema(),
          faqPageSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <WeeklyMenu />
        <Plans />
        <WhyStudents />
        <FoodShowcase />
        <ParentTrust />
        <Testimonials />
        <KitchenTrust />
        <AppPreview />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
