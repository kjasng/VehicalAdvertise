import { AtSign, Globe2, Megaphone, MessageCircle } from 'lucide-react'

const footerGroups = [
  ['PLATFORM', 'For Drivers', 'For Advertisers', 'Garage Network', 'Pricing'],
  ['COMPANY', 'About Us', 'Careers', 'Blog', 'Contact'],
  ['SUPPORT', 'Help Center', 'Terms of Service', 'Privacy Policy', 'FAQ'],
]

const socialIcons = [
  ['web', Globe2],
  ['chat', MessageCircle],
  ['campaign', Megaphone],
  ['mail', AtSign],
] as const

export function MarketingFooter() {
  return (
    <footer className="bg-[#1a1a1a] px-6 py-14 text-white lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="grid gap-10 md:grid-cols-[320px_1fr_1fr_1fr] md:justify-between">
          <div className="space-y-4">
            <p className="font-heading text-[32px] leading-none">VehicalAdvertise</p>
            <p className="text-sm leading-[1.6] text-white/60">
              Di chuyen cung co thong diep. Connecting drivers and advertisers across Vietnam&apos;s
              busiest roads.
            </p>
            <div className="flex gap-4">
              {socialIcons.map(([label, Icon]) => (
                <Icon key={label} className="size-5 text-white/50" aria-hidden="true" />
              ))}
            </div>
          </div>
          {footerGroups.map(([title, ...links]) => (
            <div key={title} className="space-y-4">
              <p className="text-xs font-semibold tracking-[1.5px] text-white/40">{title}</p>
              <div className="grid gap-4 text-sm text-white/80">
                {links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col gap-3 text-sm text-white/40 md:flex-row md:justify-between">
          <span>© 2026 VehicalAdvertise. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
