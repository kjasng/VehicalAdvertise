export const metadata = { title: 'Approvals · Admin' }

export default function ApprovalsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="text-sm text-zinc-500">
          Driver KYC, vehicle registration, and campaign reviews land here.
        </p>
      </header>
      <div className="rounded-lg border bg-white p-8 text-center text-sm text-zinc-500 dark:bg-zinc-950">
        No pending items.
      </div>
    </div>
  )
}
