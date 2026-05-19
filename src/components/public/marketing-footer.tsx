const footerGroups = [
  ['Platform', 'How it works', 'For drivers', 'For advertisers'],
  ['Operations', 'Garage network', 'Proof photos', 'Invoices'],
  ['Company', 'Who we are', 'Contact', 'Hanoi pilot'],
]

export function MarketingFooter() {
  return (
    <footer className="bg-black px-6 py-14 text-white lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-heading text-3xl text-primary">VehicalAdvertise</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            Vehicle advertising marketplace for Hanoi drivers, brands, garages, and campaign
            operators.
          </p>
        </div>
        {footerGroups.map(([title, ...links]) => (
          <div key={title}>
            <p className="font-bold">{title}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              {links.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:justify-between">
        <span>© 2026 VehicalAdvertise. All rights reserved.</span>
        <span>Made in Hanoi, Vietnam</span>
      </div>
    </footer>
  )
}
