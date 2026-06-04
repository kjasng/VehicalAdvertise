export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-[#cbccc9] bg-white p-4">
      <h2 className="font-heading text-[24px] leading-none text-[#1a1a1a] uppercase">{title}</h2>
      {children}
    </section>
  )
}

export function Field({
  id,
  label,
  value,
  onChange,
  required = true,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="focus:ring-primary h-11 w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
      />
    </label>
  )
}
