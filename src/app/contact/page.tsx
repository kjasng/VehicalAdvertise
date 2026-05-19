import { Mail, MapPin, Phone } from 'lucide-react'

import { EyebrowTitle } from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import { faqs, images } from '@/components/public/marketing-data'

export const metadata = { title: 'Contact · VehicalAdvertise' }

export default function ContactPage() {
  return (
    <MarketingShell active="/contact">
      {/* Page hero section */}
      <section
        className="flex min-h-[500px] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{ backgroundImage: `linear-gradient(#00000099, #00000099), url(${images.contact})` }}
      >
        <h1 className="font-heading text-7xl leading-none md:text-8xl">CONTACT</h1>
      </section>

      {/* Contact form section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_520px]">
          <form className="space-y-5 rounded-md border border-black/15 bg-white p-8">
            <h2 className="font-heading text-4xl">Reach Us</h2>
            {['Full name', 'Email', 'Audience', 'Message'].map((label) => (
              <label key={label} className="block text-sm font-bold">
                {label}
                <input
                  className="mt-2 h-12 w-full rounded-md border border-black/15 bg-white px-4 text-base"
                  placeholder={label}
                />
              </label>
            ))}
            <button className="bg-primary h-12 w-full rounded-md font-black text-white">
              Send message
            </button>
          </form>
          <div className="space-y-5">
            <EyebrowTitle
              eyebrow="Direct contact"
              title="CHOOSE YOUR PATH"
              text="Driver support, campaign planning, garage onboarding, and finance questions route to the right team."
            />
            {[
              [Mail, 'hello@vehicaladvertise.vn'],
              [Phone, '+84 24 0000 2026'],
              [MapPin, 'Hanoi pilot office'],
            ].map(([Icon, text]) => (
              <div
                key={String(text)}
                className="flex items-center gap-4 rounded-md border border-black/15 bg-white p-5"
              >
                <Icon className="text-primary size-5" />
                <span className="font-bold">{String(text)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="font-heading text-center text-6xl">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq} className="rounded-md border border-black/15 bg-white p-5 font-black">
                {faq}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
