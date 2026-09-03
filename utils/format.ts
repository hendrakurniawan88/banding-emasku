const rupiahFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const decimalFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** "62.300.000" — angka polos dengan pemisah ribuan Indonesia. */
export function formatNumber(value: number): string {
  return rupiahFormatter.format(Math.round(value))
}

/** "Rp 62.300.000" */
export function formatRupiah(value: number): string {
  return `Rp ${formatNumber(value)}`
}

/** "+Rp 855.500" / "−Rp 855.500" — memakai minus sign, bukan hyphen. */
export function formatSignedRupiah(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}Rp ${formatNumber(Math.abs(value))}`
}

/** "2,62" — desimal gaya Indonesia, maksimal 2 angka di belakang koma. */
export function formatDecimal(value: number): string {
  return decimalFormatter.format(value)
}

/** "−1,39%" */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${formatDecimal(Math.abs(value))}%`
}

/** Ambil digit saja dari input bebas: "Rp 2.492.000" -> 2492000. */
export function parseDigits(value: string): number {
  const digits = String(value).replace(/[^0-9]/g, '')
  return digits ? Number.parseInt(digits, 10) : 0
}

/** Parse desimal gaya Indonesia: "25,5" -> 25.5. */
export function parseDecimal(value: string): number {
  const normalized = String(value).replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}
