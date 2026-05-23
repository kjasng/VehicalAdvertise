import { team, values } from '@/components/public/who-we-are-data'
import { cn } from '@/lib/utils'

export function ValuesGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {values.map(([Icon, number, title, text, foot, active]) => (
        <article
          key={number}
          className={cn(
            'flex min-h-[330px] flex-col gap-4 rounded-md p-6',
            active ? 'bg-[#1a1a1a] text-white' : 'border border-[#cbccc9] bg-[#f7f8fa] text-[#1a1a1a]',
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'flex size-11 items-center justify-center rounded-md text-sm font-extrabold',
                active ? 'bg-primary' : 'bg-[#1a1a1a] text-white',
              )}
            >
              {number}
            </span>
            <Icon className="text-primary size-7" aria-hidden="true" />
          </div>
          <h3 className="font-heading text-[27px] leading-[1.08] whitespace-pre-line">{title}</h3>
          <p className={cn('text-sm leading-[1.52]', active ? 'text-[#d8d8d8]' : 'text-[#666666]')}>
            {text}
          </p>
          <p
            className={cn(
              'mt-auto rounded px-3 py-2 text-xs font-bold',
              active ? 'bg-[#2a2a2a] text-white' : 'border border-[#cbccc9] bg-white text-[#1a1a1a]',
            )}
          >
            <span className="bg-primary mr-2 inline-block size-2 rounded-full" />
            {foot}
          </p>
        </article>
      ))}
    </div>
  )
}

export function TeamGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {team.map(([initials, name, role, bio, focus, active]) => (
        <article
          key={name}
          className={cn('rounded-md p-6', active ? 'bg-[#1a1a1a] text-white' : 'border border-[#cbccc9] bg-white')}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'font-heading flex size-[68px] items-center justify-center rounded-full text-2xl text-white',
                active ? 'bg-primary' : 'bg-[#1a1a1a]',
              )}
            >
              {initials}
            </span>
            <div>
              <h3 className="font-heading text-[27px] leading-none">{name}</h3>
              <p className="text-primary mt-1 text-[13px] font-extrabold">{role}</p>
            </div>
          </div>
          <p className={cn('mt-4 text-sm leading-[1.55]', active ? 'text-[#d8d8d8]' : 'text-[#666666]')}>
            {bio}
          </p>
          <p className={cn('mt-4 w-fit rounded px-3 py-2 text-xs font-bold', active ? 'bg-[#2a2a2a] text-white' : 'bg-[#eef0f2] text-[#1a1a1a]')}>
            <span className="bg-primary mr-2 inline-block size-2 rounded-full" />
            {focus}
          </p>
        </article>
      ))}
    </div>
  )
}
