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
  partnerTaxCode?: string | null
  billingAddress: string
  campaignName: string
  periodStart: string
  periodEnd: string
  amountVnd: number
  summaryItems?: PartnerInvoiceSummaryItem[]
  detailLines?: PartnerInvoiceDetailLine[]
}

export type PartnerInvoiceSummaryItem = {
  label: string
  amountVnd: number
}

export type PartnerInvoiceDetailLine = {
  label: string
  recipientName: string
  vehiclePlate: string
  periodLabel: string
  driverNetVnd: number
  platformFeeVnd: number
  garageVnd: number
  amountVnd: number
  status?: string
}

/** Vietnamese-style simple invoice billed to a partner (no VAT). */
export function buildPartnerInvoiceHtml(input: PartnerInvoiceHtmlInput) {
  const { company } = input
  const buyerLines: Array<[string, string]> = [['Đơn vị', input.partnerName]]
  if (input.partnerTaxCode) buyerLines.push(['Mã số thuế', input.partnerTaxCode])
  buyerLines.push(['Địa chỉ', input.billingAddress || '—'])

  return `
<article class="vn-doc">
  <style>${BASE_DOC_CSS}
  .vn-doc .money{text-align:right;white-space:nowrap}
  .vn-doc .compact th,.vn-doc .compact td{font-size:12px;padding:7px}
  </style>
  ${vnNationalHeader()}
  <h1>Hóa đơn dịch vụ</h1>
  <p class="subtitle">Số: ${escapeHtml(input.invoiceNumber)} · Ngày lập: ${escapeHtml(input.issuedAt.slice(0, 10))}</p>

  ${vnPartyBlock('Bên cung cấp dịch vụ (Bên bán)', [
    ['Đơn vị', company.name],
    ['Mã số thuế', company.taxCode || '—'],
    ['Địa chỉ', company.address || '—'],
  ])}

  ${vnPartyBlock('Khách hàng (Bên mua)', buyerLines)}

  <h2>Nội dung</h2>
  <table>
    <tr><th>Diễn giải</th><td>Dịch vụ quảng cáo trên xe ô tô theo chiến dịch "${escapeHtml(input.campaignName)}" từ ngày ${escapeHtml(input.periodStart)} đến ngày ${escapeHtml(input.periodEnd)}</td></tr>
    <tr><th>Thành tiền</th><td class="total">${escapeHtml(formatVndDong(input.amountVnd))}</td></tr>
  </table>
  <p class="in-words">Bằng chữ: ${escapeHtml(amountInWords(input.amountVnd))}.</p>

  ${renderSummaryItems(input.summaryItems)}
  ${renderDetailLines(input.detailLines)}

  ${vnSignatureRow('Bên bán', 'Bên mua')}
</article>`.trim()
}

function renderSummaryItems(items?: PartnerInvoiceSummaryItem[]) {
  if (!items?.length) return ''
  const rows = items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.label)}</td><td class="money">${escapeHtml(formatVndDong(item.amountVnd))}</td></tr>`,
    )
    .join('')
  return `
  <h2>Chi tiết phân bổ ngân sách</h2>
  <table>
    <tr><th>Hạng mục</th><th>Số tiền</th></tr>
    ${rows}
  </table>`.trim()
}

function renderDetailLines(lines?: PartnerInvoiceDetailLine[]) {
  if (!lines) return ''
  const rows = lines?.length
    ? lines.map(renderDetailLine).join('')
    : '<tr><td colspan="9">Chưa ghi nhận kỳ chi trả hoặc chi phí lắp đặt.</td></tr>'
  return `
  <h2>Chi tiết chi trả</h2>
  <table class="compact">
    <tr><th>STT</th><th>Loại</th><th>Người nhận</th><th>Xe</th><th>Kỳ/ngày</th><th>Tài xế</th><th>Phí nền tảng</th><th>Garage</th><th>Tổng</th></tr>
    ${rows}
  </table>`.trim()
}

function renderDetailLine(line: PartnerInvoiceDetailLine, index: number) {
  return `<tr>
    <td>${index + 1}</td>
    <td>${escapeHtml(line.label)}</td>
    <td>${escapeHtml(line.recipientName)}</td>
    <td>${escapeHtml(line.vehiclePlate)}</td>
    <td>${escapeHtml(line.periodLabel)}</td>
    <td class="money">${moneyOrDash(line.driverNetVnd)}</td>
    <td class="money">${moneyOrDash(line.platformFeeVnd)}</td>
    <td class="money">${moneyOrDash(line.garageVnd)}</td>
    <td class="money">${escapeHtml(formatVndDong(line.amountVnd))}</td>
  </tr>`
}

function moneyOrDash(amount: number) {
  return amount === 0 ? '—' : escapeHtml(formatVndDong(amount))
}
