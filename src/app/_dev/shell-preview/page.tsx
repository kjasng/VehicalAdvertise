/**
 * Dev-only smoke-test page for Phase 02 shell primitives.
 * Accessible at /_dev/shell-preview in development only.
 * Returns 404 in production.
 */
import { notFound } from 'next/navigation'

import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { Button } from '@/components/ui/button'

export default function ShellPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="min-h-screen space-y-10 bg-[#f7f8fa] p-8">
      <h1 className="font-heading text-[32px] text-[#1a1a1a] uppercase">
        Phase 02 — Shell Primitives Preview
      </h1>

      {/* PageHeader */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">PageHeader</p>
        <div className="rounded border border-[#cbccc9] bg-white p-6">
          <PageHeader
            kicker="DASHBOARD OVERVIEW"
            title="ADMIN PANEL"
            cta={<Button size="sm">New Campaign</Button>}
          />
        </div>
      </section>

      {/* KpiCards */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">KpiCard</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Active Drivers" value="1,248" delta="8.2" deltaDirection="up" />
          <KpiCard label="Campaigns" value="34" delta="2.1" deltaDirection="down" />
          <KpiCard
            label="Revenue VND"
            value="142M"
            delta="12.4"
            deltaDirection="up"
            deltaUnit="%"
          />
          <KpiCard label="Pending KYC" value="17" />
        </div>
      </section>

      {/* SectionShell light */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">
          SectionShell (light)
        </p>
        <SectionShell
          title="RECENT ACTIVITY"
          action={
            <Button size="sm" variant="outline">
              View All
            </Button>
          }
        >
          <p className="text-sm text-[#666]">Table or list content goes here.</p>
        </SectionShell>
      </section>

      {/* SectionShell dark */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">
          SectionShell (dark)
        </p>
        <SectionShell title="ANALYTICS" variant="dark">
          <p className="text-sm text-white/60">Chart content goes here.</p>
        </SectionShell>
      </section>

      {/* EmptyState */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">EmptyState</p>
        <EmptyState
          kicker="NO CAMPAIGNS YET"
          title="NOTHING HERE"
          helper="Create your first campaign to start tracking driver performance and ad spend."
          cta={<Button>Create Campaign</Button>}
        />
      </section>

      {/* Nav item examples (visual only) */}
      <section className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#666] uppercase">
          Sidebar Nav Items (visual mock — active state)
        </p>
        <div className="w-[240px] space-y-0.5 rounded-md bg-[#1a1a1a] p-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Users, label: 'Drivers KYC', active: false },
            { icon: FileText, label: 'Reports', active: false },
            { icon: Settings, label: 'Settings', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded px-4 py-3 text-[13px] font-medium ${
                active ? 'bg-primary text-white' : 'text-white/70'
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
