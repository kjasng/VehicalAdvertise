/**
 * Shared print styles + the Vietnamese national heading (Quốc hiệu, tiêu ngữ)
 * for formal documents (hợp đồng, hóa đơn, biên bản).
 */
import { escapeHtml } from './format'

/** Base CSS for `.vn-doc` printed documents. */
export const BASE_DOC_CSS = `
.vn-doc{font-family:'Times New Roman',Times,serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:32px;line-height:1.55}
.vn-doc h1{font-size:22px;margin:16px 0 4px;text-align:center;text-transform:uppercase;font-weight:700}
.vn-doc h2{font-size:14px;margin:20px 0 6px;text-transform:uppercase;letter-spacing:0.5px}
.vn-doc p,.vn-doc td,.vn-doc th,.vn-doc li{font-size:14px}
.vn-doc .subtitle{text-align:center;font-size:13px;color:#444;margin:0 0 16px}
.vn-doc .national{text-align:center;margin:0 0 8px}
.vn-doc .national .country{font-weight:700;text-transform:uppercase;font-size:14px}
.vn-doc .national .motto{font-weight:700;font-size:14px}
.vn-doc .national .rule{width:200px;border-top:1px solid #1a1a1a;margin:4px auto 0}
.vn-doc table{width:100%;border-collapse:collapse;margin-top:8px}
.vn-doc th,.vn-doc td{border:1px solid #cbccc9;padding:9px;text-align:left;vertical-align:top}
.vn-doc th{background:#f7f8fa;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}
.vn-doc .total{font-size:18px;font-weight:700}
.vn-doc .in-words{font-style:italic}
.vn-doc .sign-row{display:flex;justify-content:space-between;margin-top:40px;text-align:center}
.vn-doc .sign-row .sign-col{flex:1;font-size:14px}
.vn-doc .sign-row .role{font-weight:700;text-transform:uppercase}
.vn-doc .sign-row .hint{color:#666;font-style:italic;font-size:12px}
.vn-doc .sign-row .space{height:72px}
.vn-doc .party{margin:12px 0 4px}
.vn-doc .party .party-title{font-weight:700;text-transform:uppercase;font-size:13px;letter-spacing:0.5px;margin:0 0 4px}
.vn-doc .party p{margin:2px 0}
.vn-doc .party .lbl{display:inline-block;min-width:140px;color:#444}
@media print{.vn-doc{padding:0}.no-print{display:none}.page-break{break-after:page}}
`.trim()

/** Centered national heading block used at the top of formal documents. */
export function vnNationalHeader(): string {
  return `
<div class="national">
  <div class="country">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
  <div class="motto">Độc lập – Tự do – Hạnh phúc</div>
  <div class="rule"></div>
</div>`.trim()
}

/** Party identity block as prose lines (label: value) — the Vietnamese way, not a table. */
export function vnPartyBlock(title: string, lines: Array<[string, string]>): string {
  const rows = lines
    .map(
      ([label, value]) =>
        `<p><span class="lbl">${escapeHtml(label)}:</span> ${escapeHtml(value)}</p>`,
    )
    .join('')
  return `<div class="party"><p class="party-title">${escapeHtml(title)}</p>${rows}</div>`
}

/** Two-column signature footer (Bên A / Bên B or Bên bán / Bên mua). */
export function vnSignatureRow(left: string, right: string): string {
  return `
<div class="sign-row">
  <div class="sign-col"><div class="role">${left}</div><div class="hint">(Ký, ghi rõ họ tên)</div><div class="space"></div></div>
  <div class="sign-col"><div class="role">${right}</div><div class="hint">(Ký, ghi rõ họ tên)</div><div class="space"></div></div>
</div>`.trim()
}
