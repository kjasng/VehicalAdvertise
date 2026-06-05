export type MonthlyPeriod = {
  start: string
  end: string
  completed: boolean
}

export const DEFAULT_DRIVER_NET_MONTHLY_VND = 1_100_000
export const DEFAULT_PLATFORM_FEE_PCT = 10

function asUtcDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addMonths(date: string, months: number) {
  const d = asUtcDate(date)
  const day = d.getUTCDate()
  d.setUTCMonth(d.getUTCMonth() + months)
  if (d.getUTCDate() !== day) d.setUTCDate(0)
  return toDateString(d)
}

export function getCurrentMonthlyPeriod(earningStartDate: string, today = currentDateString()) {
  let start = earningStartDate
  let end = addMonths(start, 1)
  let guard = 0

  while (end <= today && guard < 60) {
    start = end
    end = addMonths(start, 1)
    guard++
  }

  return { start, end, completed: false }
}

export function getLastCompletedMonthlyPeriod(
  earningStartDate: string,
  today = currentDateString(),
): MonthlyPeriod | null {
  const firstEnd = addMonths(earningStartDate, 1)
  if (firstEnd > today) return null

  let start = earningStartDate
  let end = firstEnd
  let guard = 0

  while (addMonths(end, 1) <= today && guard < 60) {
    start = end
    end = addMonths(start, 1)
    guard++
  }

  return { start, end, completed: true }
}

export function computeGrossFromNet(netVnd: number, platformFeePct: number) {
  const safePct = Math.max(0, Math.min(platformFeePct, 99))
  const gross = Math.ceil(netVnd / (1 - safePct / 100))
  return {
    grossChargeVnd: gross,
    platformFeeVnd: gross - netVnd,
    driverNetVnd: netVnd,
  }
}

export function currentDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function formatVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + ' VND'
}
