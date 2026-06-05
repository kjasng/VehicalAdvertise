import VNnum2words from 'vn-num2words'

/**
 * Convert a VND amount to the Vietnamese words form used on documents,
 * e.g. 1050000 -> "Một triệu không trăm năm mươi nghìn đồng".
 */
export function amountInWords(vnd: number): string {
  const rounded = Math.round(Number(vnd) || 0)
  if (!rounded) return 'Không đồng'
  const words = VNnum2words(rounded).trim()
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} đồng`
}
