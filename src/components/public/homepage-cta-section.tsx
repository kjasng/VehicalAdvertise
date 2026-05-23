import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { buttonMotion } from '@/components/public/homepage-sections'
import { cn } from '@/lib/utils'

export function HomeCtaSection() {
  return (
    <section className="bg-primary px-6 py-[100px] text-center text-white lg:px-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="font-heading text-5xl leading-[1.05] md:text-[56px]">
          READY TO GET
          <br />
          YOUR MESSAGE MOVING?
        </h2>
        <p className="text-lg leading-[1.6] text-white/80">
          Whether you&apos;re a driver looking to earn extra income or a business seeking
          high-impact mobile advertising, VehicalAdvertise connects you to the road.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/login?role=driver"
            className={buttonVariants({
              variant: 'secondary',
              className: cn(
                'rounded !bg-white px-9 py-6 text-base font-semibold !text-black hover:!bg-white hover:!text-black',
                buttonMotion,
              ),
            })}
          >
            Join as Driver
          </Link>
          <Link
            href="/for-advertisers"
            className={buttonVariants({
              variant: 'outline',
              className: cn(
                'rounded border-2 border-white bg-transparent px-9 py-6 text-base font-semibold text-white hover:text-primary',
                buttonMotion,
              ),
            })}
          >
            Advertise Now
          </Link>
        </div>
      </div>
    </section>
  )
}
