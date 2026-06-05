import type { CompanyInfo } from '@/lib/shared/vn-doc/company-info'
import { BASE_DOC_CSS, vnNationalHeader, vnSignatureRow } from '@/lib/shared/vn-doc/doc-styles'
import { escapeHtml } from '@/lib/shared/vn-doc/format'

export type AcceptanceVehicle = {
  plate: string
  driverName: string
  installedAt: string | null
}

export type AcceptanceRecordInput = {
  recordNumber: string
  issuedAt: string
  company: CompanyInfo
  partnerName: string
  campaignName: string
  periodStart: string
  periodEnd: string
  vehicles: AcceptanceVehicle[]
  photoUrls: string[]
}

/** "Biên bản nghiệm thu" — campaign acceptance record (vehicle list + install photos). */
export function buildAcceptanceRecordHtml(input: AcceptanceRecordInput) {
  const { company } = input
  const vehicleRows = input.vehicles.length
    ? input.vehicles
        .map(
          (v, i) =>
            `<tr><td>${i + 1}</td><td>${escapeHtml(v.plate)}</td><td>${escapeHtml(v.driverName)}</td><td>${escapeHtml(v.installedAt?.slice(0, 10) ?? '—')}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="4">Chưa có xe nghiệm thu.</td></tr>'

  const photoBlock = input.photoUrls.length
    ? `<h2>Hình ảnh nghiệm thu</h2><div class="photo-grid">${input.photoUrls
        .map((url) => `<img src="${escapeHtml(url)}" alt="Ảnh nghiệm thu dán xe" />`)
        .join('')}</div>`
    : ''

  return `
<article class="vn-doc">
  <style>${BASE_DOC_CSS}
  .vn-doc .photo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
  .vn-doc .photo-grid img{width:100%;height:auto;border:1px solid #cbccc9;border-radius:4px}
  </style>
  ${vnNationalHeader()}
  <h1>Biên bản nghiệm thu chiến dịch quảng cáo</h1>
  <p class="subtitle">Số: ${escapeHtml(input.recordNumber)} · Ngày ${escapeHtml(input.issuedAt.slice(0, 10))}</p>

  <p>Hôm nay, hai bên cùng tiến hành nghiệm thu việc thi công dán decal quảng cáo theo chiến dịch "${escapeHtml(input.campaignName)}", giai đoạn từ ngày ${escapeHtml(input.periodStart)} đến ngày ${escapeHtml(input.periodEnd)}.</p>

  <h2>Các bên</h2>
  <table>
    <tr><th>Bên A (Đơn vị thực hiện)</th><td>${escapeHtml(company.name)} — MST ${escapeHtml(company.taxCode || '—')}</td></tr>
    <tr><th>Bên B (Khách hàng)</th><td>${escapeHtml(input.partnerName)}</td></tr>
  </table>

  <h2>Danh sách xe nghiệm thu</h2>
  <table>
    <tr><th>STT</th><th>Biển số</th><th>Tài xế</th><th>Ngày dán</th></tr>
    ${vehicleRows}
  </table>

  ${photoBlock}

  <p>Hai bên thống nhất xác nhận việc dán quảng cáo đã hoàn thành đúng yêu cầu chiến dịch nêu trên.</p>

  ${vnSignatureRow('Đại diện Bên A', 'Đại diện Bên B')}
</article>`.trim()
}
