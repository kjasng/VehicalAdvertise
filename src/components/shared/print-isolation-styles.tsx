/**
 * PrintIsolationStyles — server component that injects print-only CSS inline
 * in the page HTML (not the cached global stylesheet). On `@media print`,
 * everything is hidden except the `.print-document` container, so /print
 * routes output just the document with no app chrome (sidebar, header, nav).
 *
 * Inlined on purpose: the global stylesheet can be served stale by dev HMR,
 * but page-level HTML is always fresh on navigation.
 *
 * - `@page { margin: 0 }` drops the browser-injected header/footer strip
 *   (page title + date + URL) and default page margins.
 * - Collapsing `.min-h-screen` prevents the full-height app layout from
 *   spilling into a blank trailing page.
 */
export function PrintIsolationStyles() {
  return (
    <style>{`
@media print {
  @page { margin: 0; }
  html, body { height: auto !important; background: #fff !important; }
  .min-h-screen { min-height: 0 !important; }
  body * { visibility: hidden !important; }
  .print-document, .print-document * { visibility: visible !important; }
  .print-document {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 12mm !important;
    border: 0 !important;
  }
}
    `}</style>
  )
}
