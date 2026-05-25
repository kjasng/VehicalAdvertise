'use client'

/**
 * WeeklyKmChart — recharts line chart of weekly km driven (last 12 weeks).
 * Client component; data comes from mock-data.ts.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { MOCK_WEEKLY_KM } from './mock-data'

export function WeeklyKmChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={MOCK_WEEKLY_KM} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbccc9" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#666666', fontWeight: 700 }}
          axisLine={{ stroke: '#cbccc9' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fill: '#666666' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => {
            const num = typeof value === 'number' ? value : Number(value)
            return [num.toLocaleString('vi-VN') + ' km', 'Total km']
          }}
          contentStyle={{
            border: '1px solid #cbccc9',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <Line
          type="monotone"
          dataKey="km"
          stroke="#ff5c00"
          strokeWidth={2}
          dot={{ r: 3, fill: '#ff5c00', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
