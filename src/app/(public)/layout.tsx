export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  )
}
