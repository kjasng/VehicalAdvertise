import type { CompanyInfo } from '@/lib/shared/vn-doc/company-info'
import {
  BASE_DOC_CSS,
  vnNationalHeader,
  vnPartyBlock,
  vnSignatureRow,
} from '@/lib/shared/vn-doc/doc-styles'
import { escapeHtml } from '@/lib/shared/vn-doc/format'

export type AdLeaseContractInput = {
  contractNumber: string
  signDate: string
  company: CompanyInfo
  driverName: string
  driverCccd: string | null
  driverAddress: string | null
  vehiclePlate: string
  campaignName: string
  periodStart: string
  periodEnd: string
}

/**
 * "Hợp đồng thuê vị trí quảng cáo trên xe ô tô" — Vietnamese ad-space lease
 * contract between the company (Bên A) and an individual driver (Bên B).
 * No tax/withholding clause (per project decision).
 */
export function buildAdLeaseContractHtml(input: AdLeaseContractInput) {
  const { company } = input
  return `
<article class="vn-doc">
  <style>${BASE_DOC_CSS}</style>
  ${vnNationalHeader()}
  <h1>Hợp đồng thuê vị trí quảng cáo trên xe ô tô</h1>
  <p class="subtitle">Số: ${escapeHtml(input.contractNumber)} · Ngày ${escapeHtml(input.signDate.slice(0, 10))}</p>

  <p>Căn cứ Bộ luật Dân sự và nhu cầu, khả năng của hai bên, hôm nay hai bên gồm:</p>

  ${vnPartyBlock('Bên A (Bên thuê)', [
    ['Đơn vị', company.name],
    ['Mã số thuế', company.taxCode || '—'],
    ['Địa chỉ', company.address || '—'],
    [
      'Người đại diện',
      company.repTitle ? `${company.repName} — ${company.repTitle}` : company.repName,
    ],
  ])}

  ${vnPartyBlock('Bên B (Chủ xe / Bên cho thuê)', [
    ['Họ và tên', input.driverName],
    ['CCCD/CMND', input.driverCccd ?? '—'],
    ['Địa chỉ', input.driverAddress ?? '—'],
    ['Biển số xe', input.vehiclePlate],
  ])}

  <h2>Điều 1. Nội dung hợp đồng</h2>
  <p>Bên B đồng ý cho Bên A thuê vị trí trên thân xe ô tô biển số ${escapeHtml(input.vehiclePlate)} để dán decal quảng cáo theo chiến dịch "${escapeHtml(input.campaignName)}".</p>

  <h2>Điều 2. Thời hạn</h2>
  <p>Từ ngày ${escapeHtml(input.periodStart)} đến ngày ${escapeHtml(input.periodEnd)}, có thể gia hạn theo thỏa thuận của hai bên.</p>

  <h2>Điều 3. Giá thuê và thanh toán</h2>
  <p>Tiền thuê được tính theo số ki-lô-mét thực tế của xe trong kỳ và thanh toán theo từng kỳ qua tài khoản ngân hàng của Bên B. Chi tiết số tiền từng kỳ thể hiện trên hóa đơn thanh toán kèm theo.</p>

  <h2>Điều 4. Quyền và nghĩa vụ của hai bên</h2>
  <p>Bên A: thiết kế, thi công dán và tháo decal; thanh toán đúng kỳ. Bên B: giữ gìn decal, sử dụng xe bình thường, thông báo khi decal hư hỏng.</p>

  <h2>Điều 5. Điều khoản chung</h2>
  <p>Hai bên cam kết thực hiện đúng hợp đồng; mọi tranh chấp được giải quyết trên tinh thần thương lượng, nếu không thành thì đưa ra Tòa án có thẩm quyền. Hợp đồng lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản.</p>

  ${vnSignatureRow('Bên A', 'Bên B')}
</article>`.trim()
}
