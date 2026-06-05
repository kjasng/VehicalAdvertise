/**
 * Canonical formatting helpers for Vietnamese-style printed documents.
 * Used by the driver/partner/garage doc builders under src/lib/.
 */

/** Escape user-supplied strings before interpolating into document HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/** Format a VND amount the formal way for documents, e.g. "1.000.000 đồng". */
export function formatVndDong(amount: number): string {
  return `${Math.round(Number(amount) || 0).toLocaleString('vi-VN')} đồng`
}
