'use client'

/**
 * WeeklyKmChart — client component.
 * Recharts area chart of last 7 days km driven.
 * Pencil-styled: primary fill at 20% opacity, primary stroke.
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { SectionShell } from '@/components/shared/section-shell'

import type { DailyKmPoint } from './mock-data'

interface WeeklyKmChartProps {
  data: DailyKmPoint[]
}

export function WeeklyKmChart({ data }: WeeklyKmChartProps) {
  return (
    <SectionShell title="This Week" variant="light">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff5c00" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ff5c00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbccc9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{
              fontSize: 11,
              fontFamily: 'Inter, sans-serif',
              fill: '#666666',
              fontWeight: 700,
            }}
            axisLine={{ stroke: '#cbccc9' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#666666' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} km`, 'Km']}
            contentStyle={{
              border: '1px solid #cbccc9',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <Area
            type="monotone"
            dataKey="km"
            stroke="#ff5c00"
            strokeWidth={2}
            fill="url(#kmGradient)"
            dot={{ r: 3, fill: '#ff5c00', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </SectionShell>
  )
}
