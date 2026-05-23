// Auth pages own the full viewport via AuthShell, so this layout is a passthrough.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
