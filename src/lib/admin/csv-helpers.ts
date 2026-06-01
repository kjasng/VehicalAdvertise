import 'server-only'

/** Escapes a single CSV cell value (RFC 4180 + formula injection protection). */
function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  // Prefix formula-injection chars so Excel/Sheets don't evaluate them as formulas
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  if (safe.includes(',') || safe.includes('\n') || safe.includes('"')) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

/** Converts headers + rows to a RFC 4180 CSV string. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ]
  return lines.join('\r\n')
}

/** Returns a Next.js Response with CSV content-disposition headers. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
