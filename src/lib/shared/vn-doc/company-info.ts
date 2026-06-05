import 'server-only'

export type CompanyInfo = {
  name: string
  taxCode: string
  address: string
  repName: string
  repTitle: string
  phone: string
  email: string
}

/**
 * Company/seller identity ("Bên A" / bên bán) printed on Vietnamese documents.
 * Static pilot values, overridable via COMPANY_* env vars. If admin editing is
 * needed later, swap this for a DB-backed accessor (keep the same return shape).
 */
export function getCompanyInfo(): CompanyInfo {
  return {
    name: process.env.COMPANY_NAME ?? 'VehicalAdvertise',
    taxCode: process.env.COMPANY_TAX_CODE ?? '0000000000',
    address: process.env.COMPANY_ADDRESS ?? '',
    repName: process.env.COMPANY_REP_NAME ?? 'Nguyễn Văn A',
    repTitle: process.env.COMPANY_REP_TITLE ?? 'Giám Đốc',
    phone: process.env.COMPANY_PHONE ?? '',
    email: process.env.COMPANY_EMAIL ?? '',
  }
}
