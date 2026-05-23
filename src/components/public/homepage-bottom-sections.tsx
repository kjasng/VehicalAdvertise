import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  MapPin,
  QrCode,
  Star,
  Wallet,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import {
  buttonMotion,
  HomeImageBlock,
} from '@/components/public/homepage-sections'
import { cn } from '@/lib/utils'

const asset = '/landing/pencil/'

const advertiserFeatures = [
  [MapPin, 'Target by route & area'],
  [Activity, 'Real-time GPS analytics'],
  [QrCode, 'QR code interaction tracking'],
  [Wallet, 'Flexible budget management'],
] as const

const garages = [
  ['Garage Thanh Xuan', 'Thanh Xuan District', 'garage-thanh-xuan.jpg'],
  ['Garage Cau Giay', 'Cau Giay District', 'garage-cau-giay.jpg'],
  ['Garage Hoan Kiem', 'Hoan Kiem District', 'garage-hoan-kiem.jpg'],
]

const garageNavigator = [
  ['Garage Thanh Xuan', 'Thanh Xuan'],
  ['Garage Cau Giay', 'Cau Giay'],
  ['Garage Hoan Kiem', 'Hoan Kiem'],
  ['Garage Dong Da', 'Dong Da'],
  ['Garage Long Bien', 'Long Bien'],
  ['Garage Hai Ba Trung', 'Hai Ba Trung'],
] as const

const testimonials = [
  [
    ['I earn an extra 3 million VND per month just from my daily commute. The decal installation was quick and professional. I barely notice it is there. Best decision I made this year.', 'Nguyen Minh Tuan', 'Driver - Thanh Xuan', 'avatar-tuan.jpg', 'dark'],
    ['The GPS tracking is incredibly accurate. I always know exactly how much I have earned.', 'Pham Lan Anh', 'Driver - Dong Da', 'avatar-lan-anh.jpg', 'light'],
  ],
  [
    ['Our brand visibility increased 40% after a 3-month campaign with VehicalAdvertise. The tracking dashboard makes ROI measurement effortless.', 'Tran Thi Mai', 'Marketing Director - VinaTech', 'avatar-mai.jpg', 'light'],
    ['We ran campaigns across 200 vehicles in Hanoi for 6 months. The reach was phenomenal and cost per impression was 5x lower than billboards. VehicalAdvertise changed our marketing strategy entirely.', 'Hoang Duc Minh', 'CEO - GreenFood Vietnam', 'avatar-minh.jpg', 'orange'],
  ],
  [
    ['As a Grab driver, this is the easiest side income I have ever had. Just drive like normal and get paid every month. No hassle at all.', 'Le Van Hung', 'Driver - Cau Giay', 'avatar-hung.jpg', 'light'],
    ['We placed ads on 50 vehicles targeting the airport route. Within 2 months our app downloads from Hanoi increased by 28%. The QR code tracking was a game changer for attribution.', 'Do Thanh Hoa', 'Growth Lead - RideShare VN', 'avatar-hoa.jpg', 'muted'],
  ],
] as const

export function HomeAdvertiserSection() {
  return (
    <section className="grid items-center gap-[60px] bg-[#f7f8fa] px-6 py-20 lg:grid-cols-[600px_1fr] lg:px-20">
      <HomeImageBlock image="advertiser.jpg" label="Advertiser campaign planning desk" className="min-h-[500px]" />
      <div className="flex flex-col gap-6">
        <div className="w-fit rounded bg-[#ff8533] px-4 py-1.5 text-xs font-semibold tracking-[2px] text-white">
          FOR ADVERTISERS
        </div>
        <h2 className="font-heading text-5xl leading-none text-[#1a1a1a] md:text-[56px]">
          REACH MILLIONS
          <br />
          ON THE MOVE
        </h2>
        <p className="max-w-xl text-base leading-[1.6] text-[#666666]">
          Launch targeted campaigns across Hanoi&apos;s busiest routes. Track real-time impressions, QR
          code interactions, and cost-per-kilometer from one dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {advertiserFeatures.map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a]">
              <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
        <Link href="/contact" className={buttonVariants({ className: cn('w-fit rounded bg-primary px-8 py-6 text-base font-semibold', buttonMotion) })}>
          Launch a Campaign
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

export function HomeGarageNetworkSection() {
  return (
    <section id="garage-network" className="bg-white px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="mx-auto max-w-[700px] space-y-4 text-center">
          <h2 className="font-heading text-5xl leading-none text-[#1a1a1a]">OUR GARAGE NETWORK</h2>
          <p className="text-base leading-[1.6] text-[#666666]">
            Verified garages across Hanoi handle professional advertising decal installation on your vehicle.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {garages.map(([name, area, image]) => (
            <article key={name} className="overflow-hidden rounded-md bg-white shadow-[0_2px_12px_#00000015]">
              <HomeImageBlock image={image} label={name} className="min-h-[220px] rounded-b-none" />
              <div className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a]">{name}</h3>
                <div className="flex items-center gap-2 text-sm text-[#666666]">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {area}
                </div>
              </div>
            </article>
          ))}
        </div>
        <nav aria-label="Garage network navigator">
          <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {garageNavigator.map(([name, district], index) => (
              <li key={name}>
                <a
                  href="#garage-network"
                  className={cn(
                    'flex h-full flex-col rounded-md border px-4 py-3 text-left transition hover:border-primary hover:bg-[#fff3ec]',
                    index === 0 ? 'border-primary bg-[#fff3ec]' : 'border-[#cbccc9] bg-white',
                  )}
                >
                  <span className="text-sm font-semibold text-[#1a1a1a]">{name}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-[#666666]">
                    <MapPin className="size-3 text-primary" aria-hidden="true" />
                    {district}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}

function TestimonialCard({
  item,
}: {
  item: readonly [string, string, string, string, 'dark' | 'light' | 'muted' | 'orange']
}) {
  const [text, name, role, avatar, tone] = item
  const inverse = tone === 'dark' || tone === 'orange'

  return (
    <article
      className={cn(
        'rounded-md p-7 shadow-[0_2px_12px_#00000010]',
        tone === 'dark' && 'bg-[#1a1a1a] p-10',
        tone === 'orange' && 'bg-primary p-10',
        tone === 'light' && 'bg-white',
        tone === 'muted' && 'bg-[#eef0f2] shadow-none',
      )}
    >
      <p className={cn('font-heading text-6xl leading-[0.55]', tone === 'orange' ? 'text-white' : 'text-primary')}>&quot;</p>
      <p className={cn('mt-5 text-sm leading-[1.7]', inverse ? 'text-white/85' : 'text-[#666666]')}>{text}</p>
      {(tone === 'dark' || name === 'Le Van Hung') && (
        <div className="mt-5 flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-4 fill-primary text-primary" aria-hidden="true" />
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center gap-3">
        <span className="size-11 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${asset}${avatar})` }} />
        <span>
          <span className={cn('block text-sm font-bold', inverse ? 'text-white' : 'text-[#1a1a1a]')}>{name}</span>
          <span className={cn('block text-xs', inverse ? 'text-white/65' : 'text-[#666666]')}>{role}</span>
        </span>
      </div>
    </article>
  )
}

export function HomeTestimonialsSection() {
  return (
    <section className="bg-[#f7f8fa] px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="mx-auto max-w-[600px] space-y-4 text-center">
          <h2 className="font-heading text-5xl leading-none text-[#1a1a1a]">WHAT THEY SAY</h2>
          <p className="text-base leading-[1.6] text-[#666666]">Hear from drivers and advertisers who trust VehicalAdvertise.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((column, index) => (
            <div key={index} className="grid content-start gap-5">
              {column.map((item) => <TestimonialCard key={item[1]} item={item} />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
