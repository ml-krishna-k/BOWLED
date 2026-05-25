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

export function Home() {
  return (
    <>
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
