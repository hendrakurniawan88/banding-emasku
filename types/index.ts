export interface Params {
  /** Harga buyback Antam per gram, dalam rupiah penuh. */
  buyback: number
  /** Berat total emas yang dijual, dalam gram. */
  weight: number
  /** Tarif PPh 22 yang berlaku, dalam persen (1.5 | 3 | 0). */
  pph: number
  /** Materai dan biaya lain per transaksi, dalam rupiah. */
  fee: number
}

export interface Offer {
  id: number
  name: string
  /** Tawaran calon pembeli per gram, dalam rupiah penuh. */
  price: number
}

export interface Baseline {
  gross: number
  /** Tarif efektif setelah memperhitungkan ambang Rp 10 juta. */
  rate: number
  /** True bila nilai transaksi tidak melewati ambang pemungutan. */
  exempt: boolean
  pphAmount: number
  net: number
  /** Harga impas per gram: tawaran di atas angka ini mengalahkan Antam. */
  perGram: number
}

export interface RankedOffer extends Offer {
  total: number
  /** Selisih rupiah terhadap uang bersih jalur Antam. */
  diff: number
  /** Selisih dalam persen terhadap uang bersih jalur Antam. */
  diffPct: number
  /** Kekurangan per gram menuju titik impas; negatif berarti sudah di atas. */
  gapPerGram: number
  aboveBaseline: boolean
}
