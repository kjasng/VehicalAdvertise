import type { CompanyInfo } from '@/lib/shared/vn-doc/company-info'
import { amountInWords } from '@/lib/shared/vn-doc/amount-in-words'
import {
  BASE_DOC_CSS,
  vnNationalHeader,
  vnPartyBlock,
  vnSignatureRow,
} from '@/lib/shared/vn-doc/doc-styles'
import { escapeHtml, formatVndDong } from '@/lib/shared/vn-doc/format'

export type PartnerInvoiceHtmlInput = {
  invoiceNumber: string
  issuedAt: string
  company: CompanyInfo
  partnerName: string
  billingAddress: string
  campaignName: string
  periodStart: string
  periodEnd: string
  amountVnd: number
}

/** Vietnamese-style simple invoice billed to a partner (no VAT). */
export function buildPartnerInvoiceHtml(input: PartnerInvoiceHtmlInput) {
  const { company } = input
  return `
<article class="vn-doc">
  <style>${BASE_DOC_CSS}</style>
  ${vnNationalHeader()}
  <h1>Hóa đơn dịch vụ</h1>
  <p class="subtitle">Số: ${escapeHtml(input.invoiceNumber)} · Ngày lập: ${escapeHtml(input.issuedAt.slice(0, 10))}</p>

  ${vnPartyBlock('Bên cung cấp dịch vụ (Bên bán)', [
    ['Đơn vị', company.name],
    ['Mã số thuế', company.taxCode || '—'],
    ['Địa chỉ', company.address || '—'],
  ])}

  ${vnPartyBlock('Khách hàng (Bên mua)', [
    ['Đơn vị', input.partnerName],
    ['Địa chỉ', input.billingAddress || '—'],
  ])}

  <h2>Nội dung</h2>
  <table>
    <tr><th>Diễn giải</th><td>Dịch vụ quảng cáo trên xe ô tô theo chiến dịch "${escapeHtml(input.campaignName)}" từ ngày ${escapeHtml(input.periodStart)} đến ngày ${escapeHtml(input.periodEnd)}</td></tr>
    <tr><th>Thành tiền</th><td class="total">${escapeHtml(formatVndDong(input.amountVnd))}</td></tr>
  </table>
  <p class="in-words">Bằng chữ: ${escapeHtml(amountInWords(input.amountVnd))}.</p>

  ${vnSignatureRow('Bên bán', 'Bên mua')}
</article>`.trim()
}
