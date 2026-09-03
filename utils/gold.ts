import type { Baseline, Offer, Params, RankedOffer } from '~/types'
import { formatDecimal, formatPercent, formatRupiah } from './format'

/**
 * PMK 81/2024: transaksi buyback dengan nilai sampai dengan Rp 10.000.000
 * tidak dipungut PPh Pasal 22.
 */
export const AMBANG_PPH = 10_000_000

export const DEFAULT_PARAMS: Params = {
  buyback: 2_492_000,
  weight: 25,
  pph: 1.5,
  fee: 10_000,
}

export const DEFAULT_OFFERS: Offer[] = [
  { id: 1, name: 'Adam', price: 2_390_000 },
  { id: 2, name: 'Fikri', price: 2_420_000 },
]

/**
 * Hitung uang bersih jalur Antam dan harga impas per gram.
 * Harga impas inilah pembanding yang benar untuk tawaran antar-individu,
 * karena penjualan antar-individu tidak dipotong PPh 22 maupun materai.
 */
export function calcBaseline(params: Params): Baseline {
  const gross = params.weight * params.buyback
  const exempt = gross <= AMBANG_PPH
  const rate = exempt ? 0 : params.pph
  const pphAmount = gross * (rate / 100)
  const net = gross - pphAmount - params.fee

  return {
    gross,
    rate,
    exempt,
    pphAmount,
    net,
    perGram: params.weight > 0 ? net / params.weight : 0,
  }
}

/** Urutkan penawaran dari tawaran per gram tertinggi, lengkap dengan selisihnya. */
export function rankOffers(offers: Offer[], params: Params, baseline: Baseline): RankedOffer[] {
  return offers
    .map((offer): RankedOffer => {
      const total = offer.price * params.weight
      const diff = total - baseline.net

      return {
        ...offer,
        total,
        diff,
        diffPct: baseline.net > 0 ? (diff / baseline.net) * 100 : 0,
        gapPerGram: baseline.perGram - offer.price,
        aboveBaseline: diff >= 0,
      }
    })
    .sort((a, b) => b.price - a.price)
}

/** Skala simetris untuk grafik divergen, dibulatkan ke kelipatan 0,5%. */
export function chartScale(offers: RankedOffer[]): number {
  const maxAbs = offers.reduce((max, offer) => Math.max(max, Math.abs(offer.diffPct)), 0)
  return Math.max(1, Math.ceil(maxAbs * 1.25 * 2) / 2)
}

/** Teks siap tempel ke WhatsApp saat menawar balik. */
export function buildWaSummary(params: Params, baseline: Baseline, offers: RankedOffer[]): string {
  const lines: string[] = [
    `Update penawaran emas Antam ${params.weight} gr`,
    '',
    `Patokan saya = harga buyback Antam ${formatRupiah(params.buyback)}/gr,`,
    `dipotong PPh 22 ${formatDecimal(baseline.rate)}% + materai ${formatRupiah(params.fee)},`,
    `bersih diterima ${formatRupiah(baseline.net)} (setara ${formatRupiah(baseline.perGram)}/gr).`,
    '',
    `Jadi tawaran tunai mulai ${formatRupiah(baseline.perGram)}/gr sudah setara jual ke Antam.`,
  ]

  if (offers.length > 0) {
    lines.push('', 'Posisi penawaran sekarang:')
    offers.forEach((offer, index) => {
      lines.push(
        `${index + 1}. ${offer.name} — ${formatRupiah(offer.price)}/gr = ${formatRupiah(offer.total)}` +
          ` (${offer.diff >= 0 ? '+' : '-'}${formatRupiah(Math.abs(offer.diff))}, ${formatPercent(offer.diffPct)})`,
      )
    })

    const best = offers[0]!
    if (!best.aboveBaseline) {
      lines.push(
        '',
        `Tawaran tertinggi (${best.name}) masih kurang ${formatRupiah(best.gapPerGram)}/gr dari titik impas.`,
      )
    }
  }

  return lines.join('\n')
}
