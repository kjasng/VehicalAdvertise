import { escapeHtml, formatVnd } from './format'

export type GarageWithdrawalHtmlInput = {
  withdrawalNumber: string
  requestedAt: string
  garageName: string
  garageAddress: string
  amountVnd: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBin: string | null | undefined
}

export function buildGarageWithdrawalHtml(input: GarageWithdrawalHtmlInput) {
  return `
<article class="invoice-doc">
  <style>
    .invoice-doc{font-family:Arial,sans-serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:32px}
    .invoice-doc h1{font-size:28px;margin:0 0 8px;text-transform:uppercase}
    .invoice-doc h2{font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1.5px}
    .invoice-doc p,.invoice-doc td,.invoice-doc th{font-size:13px;line-height:1.5}
    .invoice-doc table{width:100%;border-collapse:collapse;margin-top:8px}
    .invoice-doc th,.invoice-doc td{border:1px solid #cbccc9;padding:10px;text-align:left}
    .invoice-doc th{background:#f7f8fa;text-transform:uppercase;font-size:11px;letter-spacing:1px}
    .invoice-doc .total{font-size:22px;font-weight:700}
    @media print{.invoice-doc{padding:0}.no-print{display:none}}
  </style>
  <h1>Garage Withdrawal Invoice</h1>
  <p><strong>No:</strong> ${escapeHtml(input.withdrawalNumber)}</p>
  <p><strong>Requested:</strong> ${escapeHtml(input.requestedAt.slice(0, 10))}</p>

  <h2>Garage</h2>
  <table>
    <tr><th>Name</th><td>${escapeHtml(input.garageName)}</td></tr>
    <tr><th>Address</th><td>${escapeHtml(input.garageAddress)}</td></tr>
    <tr><th>Withdrawal Amount</th><td class="total">${escapeHtml(formatVnd(input.amountVnd))}</td></tr>
  </table>

  <h2>Payout Bank Snapshot</h2>
  <table>
    <tr><th>Account Holder</th><td>${escapeHtml(input.bankAccountName)}</td></tr>
    <tr><th>Account Number</th><td>${escapeHtml(input.bankAccountNumber)}</td></tr>
    <tr><th>Bank</th><td>${escapeHtml(input.bankName)}</td></tr>
    <tr><th>Bank Code/BIN</th><td>${escapeHtml(input.bankBin ?? '—')}</td></tr>
  </table>
</article>`.trim()
}
