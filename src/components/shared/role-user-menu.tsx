'use client'

/**
 * RoleUserMenu — client island.
 * Avatar (initials from email) + dropdown with Profile link + Sign Out.
 * Sign out calls the signOutAction server action.
 */

import { useRef, useState } from 'react'

import Link from 'next/link'

import { LogOut, User } from 'lucide-react'

import { signOutAction } from '@/app/(public)/login/actions'

interface RoleUserMenuProps {
  email: string | null
  profileHref?: string
}

function initials(email: string | null): string {
  if (!email) return '?'
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (local.slice(0, 2) || '?').toUpperCase()
}

export function RoleUserMenu({ email, profileHref = '/profile' }: RoleUserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setOpen((v) => !v)

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-haspopup="menu"
        className="bg-primary focus-visible:ring-primary flex size-9 items-center justify-center rounded-full text-[13px] font-bold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none"
      >
        {initials(email)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-2 min-w-[180px] overflow-hidden rounded-md border border-white/10 bg-[#252525] shadow-xl"
        >
          {/* email header */}
          {email && (
            <div className="border-b border-white/10 px-3 py-2">
              <p className="truncate text-[11px] text-white/50">{email}</p>
            </div>
          )}

          <Link
            href={profileHref}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:outline-none focus-visible:ring-inset"
            onClick={() => setOpen(false)}
          >
            <User className="size-4 shrink-0" aria-hidden="true" />
            Profile
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:outline-none focus-visible:ring-inset"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
