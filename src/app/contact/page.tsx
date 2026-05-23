import {
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'

import { MarketingShell } from '@/components/public/marketing-layout'
import { PageBanner } from '@/components/public/page-design-blocks'

export const metadata = { title: 'Contact · VehicalAdvertise' }

const contactCards = [
  [Mail, 'Email', 'hello@vehicaladvertise.com', 'Best for general questions and media kits.'],
  [Phone, 'Phone / WhatsApp', '+84 912 345 678', 'Best for urgent driver support or ad bookings.'],
  [MapPin, 'Office', 'Ba Dinh, Hanoi', 'Best for physical contract signings.'],
  [Clock3, 'Hours', 'Mon - Fri, 9:00 - 18:00', 'Best for knowing when to expect a reply.'],
] as const

const faqs = [
  [
    'How can advertisers start a campaign?',
    'Choose Advertiser / Brand in the contact form, share your company name or estimated budget, and our sales team will prepare the right media package.',
  ],
  [
    'How do drivers get paid?',
    'Driver payouts are tied to campaign rules, verification photos, and approved route activity. The onboarding team confirms the exact payout schedule before launch.',
  ],
  [
    'Where are the garage partners?',
    'We coordinate wrapping and decal checks through partner hubs around Hanoi. Garage locations are confirmed after the vehicle and campaign are approved.',
  ],
  [
    'When will the team reply?',
    'Most messages are routed within one business day. Urgent driver support and ad booking requests should use Phone / WhatsApp.',
  ],
  [
    'How are decals reviewed before launch?',
    'Creative files are checked for placement, vehicle fit, brand safety, and campaign requirements before printing or installation is scheduled.',
  ],
] as const

function Field({
  label,
  placeholder,
  type = 'text',
}: {
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <label className="block space-y-1.5 text-[13px] font-bold text-[#1a1a1a]">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="focus:border-primary focus:ring-primary/20 h-12 w-full rounded-md border border-[#cbccc9] bg-[#f7f8fa] px-4 text-base transition outline-none focus:bg-[#fff7f2] focus:ring-2"
      />
    </label>
  )
}

export default function ContactPage() {
  return (
    <MarketingShell active="/contact">
      <PageBanner
        title="CONTACT"
        image="contact-banner.png"
        className="min-h-[500px]"
        titleClassName="md:text-[82px]"
      />

      <section className="bg-[#f7f8fa] px-6 py-[72px] lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_520px]">
          <form className="space-y-5 rounded-lg border border-[#cbccc9] bg-white p-8">
            <h1 className="font-heading text-[34px] leading-none text-[#1a1a1a]">Reach Us</h1>
            <Field label="Full Name" placeholder="Enter your full name" />
            <Field label="Email Address" placeholder="name@company.com" type="email" />

            <label className="block space-y-2 text-[13px] font-bold text-[#1a1a1a]">
              <span>I am a...</span>
              <span className="border-primary flex h-12 items-center justify-between rounded-md border-2 bg-[#fff7f2] px-4 text-base font-semibold">
                Advertiser / Brand
                <ChevronDown className="text-primary size-[18px]" aria-hidden="true" />
              </span>
            </label>

            <Field label="Company Name" placeholder="e.g. VietRide Co." />

            <label className="block space-y-1.5 text-[13px] font-bold text-[#1a1a1a]">
              <span>Message</span>
              <textarea
                placeholder="Tell us what you need help with..."
                className="focus:border-primary focus:ring-primary/20 min-h-[116px] w-full rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4 text-base transition outline-none focus:bg-[#fff7f2] focus:ring-2"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <p className="rounded-md border border-[#a6ddb7] bg-[#e8f7ee] p-3 text-xs leading-[1.35] font-bold text-[#176b37]">
                Success: Thanks, Manh! We will reply within 24 hours.
              </p>
              <p className="rounded-md border border-[#ffb48a] bg-[#fff1e8] p-3 text-xs leading-[1.35] font-bold text-[#a33a00]">
                Error: Please complete the required fields.
              </p>
            </div>

            <button
              type="submit"
              className="bg-primary flex h-[50px] w-full items-center justify-center gap-2 rounded-md text-[15px] font-extrabold text-white transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              Send Message
              <Send className="size-[18px]" aria-hidden="true" />
            </button>
          </form>

          <aside className="space-y-[22px]">
            <div className="space-y-3 px-[18px]">
              <p className="text-primary text-[13px] font-extrabold uppercase">Direct contact</p>
              <h2 className="font-heading text-[40px] leading-[1.1] text-[#1a1a1a]">
                Reach the right team faster.
              </h2>
              <p className="text-base leading-[1.55] text-[#666666]">
                Each contact channel maps to a clear purpose, so advertisers, drivers, and garage
                partners know where to start.
              </p>
            </div>

            <div className="space-y-3">
              {contactCards.map(([Icon, title, detail, best]) => (
                <article
                  key={title}
                  className="rounded-lg border border-[#cbccc9] bg-white p-[18px]"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="text-primary size-4" aria-hidden="true" />
                    <h3 className="text-primary text-[13px] font-extrabold">{title}</h3>
                  </div>
                  <p className="mt-1 text-[17px] font-bold text-[#1a1a1a]">{detail}</p>
                  <p className="mt-1 text-sm text-[#666666]">{best}</p>
                </article>
              ))}
            </div>

            <div className="rounded-lg border border-[#cbccc9] bg-white p-[18px]">
              <p className="text-primary text-[13px] font-extrabold">Social Media</p>
              <p className="mt-2 text-sm leading-[1.5] text-[#666666]">
                Follow campaign updates, driver onboarding notices, and advertiser case studies.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    [BriefcaseBusiness, 'LinkedIn'],
                    [Globe, 'Facebook'],
                  ] as const
                ).map(([Icon, label]) => (
                  <span
                    key={label}
                    className="hover:border-primary flex h-[38px] items-center justify-center gap-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] text-[13px] font-extrabold text-[#1a1a1a] transition hover:bg-[#fff7f2]"
                  >
                    <Icon className="text-primary size-4" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:px-[220px]">
        <div className="mx-auto max-w-[920px] space-y-7">
          <h2 className="font-heading text-center text-[64px] leading-none text-[#1a1a1a]">FAQ</h2>
          <div className="space-y-2.5">
            {faqs.map(([question, answer]) => (
              <article
                key={question}
                className="rounded-lg border border-[#cbccc9] bg-[#f7f8fa] px-[22px] py-4"
              >
                <h3 className="text-lg font-extrabold text-[#1a1a1a]">{question}</h3>
                <p className="mt-1.5 text-sm leading-[1.5] text-[#666666]">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
