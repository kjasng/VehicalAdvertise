'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { chooseRoleAction } from './actions'

import type { UserRole } from '@/types/db'

type SelfAssignable = Exclude<UserRole, 'admin' | 'pending'>

const ROLES: { id: SelfAssignable; label: string; copy: string }[] = [
  {
    id: 'driver',
    label: 'I drive',
    copy: 'Earn from your commute. KYC + vehicle registration next.',
  },
  {
    id: 'partner',
    label: 'I advertise',
    copy: 'Run campaigns on vehicles in Hanoi. Top up, brief, go live.',
  },
  {
    id: 'garage',
    label: 'I install decals',
    copy: 'Receive install orders, upload proof, get paid weekly.',
  },
]

export function RoleForm() {
  const [pending, startTransition] = useTransition()

  const submit = (role: SelfAssignable) => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('role', role)
      const result = await chooseRoleAction(fd)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="grid gap-3">
      {ROLES.map(({ id, label, copy }) => (
        <Button
          key={id}
          variant="outline"
          disabled={pending}
          onClick={() => submit(id)}
          className="h-auto flex-col items-start gap-1 px-4 py-3 text-left"
        >
          <span className="w-full text-base font-medium">{label}</span>
          <span className="text-xs font-normal text-zinc-500">{copy}</span>
        </Button>
      ))}
    </div>
  )
}
