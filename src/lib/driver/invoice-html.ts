import type { CompanyInfo } from '@/lib/shared/vn-doc/company-info'
import { amountInWords } from '@/lib/shared/vn-doc/amount-in-words'
import {
  BASE_DOC_CSS,
  vnNationalHeader,
  vnPartyBlock,
  vnSignatureRow,
} from '@/lib/shared/vn-doc/doc-styles'
import { escapeHtml, formatVndDong } from '@/lib/shared/vn-doc/format'

export type DriverInvoiceHtmlInput = {
  invoiceNumber: string
  requestedAt: string
  company: CompanyInfo
  driverName: string
  driverEmail: string | null
  campaignName: string
  periodStart: string
  periodEnd: string
  amountVnd: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBin: string | null
}

/** Vietnamese-style payment document for a driver's monthly withdrawal (no tax). */
export function buildDriverInvoiceHtml(input: DriverInvoiceHtmlInput) {
  const { company } = input
  return `
<article class="vn-doc">
  <style>${BASE_DOC_CSS}</style>
  ${vnNationalHeader()}
  <h1>Hóa đơn thanh toán</h1>
  <p class="subtitle">Số: ${escapeHtml(input.invoiceNumber)} · Ngày lập: ${escapeHtml(input.requestedAt.slice(0, 10))}</p>

  ${vnPartyBlock('Bên chi trả', [
    ['Đơn vị', company.name],
    ['Mã số thuế', company.taxCode || '—'],
    ['Địa chỉ', company.address || '—'],
  ])}

  ${vnPartyBlock('Bên nhận tiền', [
    ['Họ và tên', input.driverName],
    ['Email', input.driverEmail ?? '—'],
    ['Chủ tài khoản', input.bankAccountName],
    ['Số tài khoản', input.bankAccountNumber],
    ['Ngân hàng', input.bankBin ? `${input.bankName} (${input.bankBin})` : input.bankName],
  ])}

  <h2>Nội dung thanh toán</h2>
  <table>
    <tr><th>Diễn giải</th><td>Tiền thuê vị trí quảng cáo trên xe ô tô theo chiến dịch "${escapeHtml(input.campaignName)}"</td></tr>
    <tr><th>Kỳ thanh toán</th><td>${escapeHtml(input.periodStart)} → ${escapeHtml(input.periodEnd)}</td></tr>
    <tr><th>Số tiền</th><td class="total">${escapeHtml(formatVndDong(input.amountVnd))}</td></tr>
  </table>
  <p class="in-words">Bằng chữ: ${escapeHtml(amountInWords(input.amountVnd))}.</p>

  ${vnSignatureRow('Bên chi trả', 'Bên nhận tiền')}
</article>`.trim()
}
