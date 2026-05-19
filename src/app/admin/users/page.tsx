import { PlaceholderCard } from '@/components/shared/role-nav'

export const metadata = { title: 'Admin · Users' }

export default function AdminUsersPage() {
  return (
    <PlaceholderCard
      title="Users"
      hint="Directory: search, suspend, role change. KYC actions deep-link to /admin/drivers-kyc."
    />
  )
}
