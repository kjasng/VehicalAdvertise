import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin · Withdrawal Requests' }

export default function PayoutsPage() {
  redirect('/admin/invoices/driver')
}
