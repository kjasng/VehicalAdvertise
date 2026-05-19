export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  )
}
