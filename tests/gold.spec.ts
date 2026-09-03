import { describe, expect, it } from 'vitest'
import type { Offer, Params } from '../types'
import { buildWaSummary, calcBaseline, chartScale, rankOffers } from '../utils/gold'
import { formatPercent, formatRupiah, parseDecimal, parseDigits } from '../utils/format'

const params: Params = { buyback: 2_492_000, weight: 25, pph: 1.5, fee: 10_000 }
const offers: Offer[] = [
  { id: 1, name: 'Adam', price: 2_390_000 },
  { id: 2, name: 'Fikri', price: 2_420_000 },
]

describe('calcBaseline', () => {
  it('menghitung kasus nyata 25 gr @ Rp 2.492.000', () => {
    const baseline = calcBaseline(params)
    expect(baseline.gross).toBe(62_300_000)
    expect(baseline.pphAmount).toBe(934_500)
    expect(baseline.net).toBe(61_355_500)
    expect(baseline.perGram).toBe(2_454_220)
    expect(baseline.exempt).toBe(false)
  })

  it('membebaskan PPh 22 bila nilai transaksi tidak melewati ambang Rp 10 juta', () => {
    const baseline = calcBaseline({ ...params, weight: 3 })
    expect(baseline.gross).toBe(7_476_000)
    expect(baseline.exempt).toBe(true)
    expect(baseline.rate).toBe(0)
    expect(baseline.pphAmount).toBe(0)
    expect(baseline.net).toBe(7_466_000)
  })

  it('memakai tarif 3% saat identitas tidak dapat divalidasi', () => {
    expect(calcBaseline({ ...params, pph: 3 }).pphAmount).toBe(1_869_000)
  })

  it('tidak membagi nol saat berat kosong', () => {
    expect(calcBaseline({ ...params, weight: 0 }).perGram).toBe(0)
  })
})

describe('rankOffers', () => {
  const baseline = calcBaseline(params)
  const ranked = rankOffers(offers, params, baseline)

  it('mengurutkan dari tawaran per gram tertinggi', () => {
    expect(ranked.map((offer) => offer.name)).toEqual(['Fikri', 'Adam'])
  })

  it('menghitung selisih rupiah, persen, dan kekurangan per gram', () => {
    const [fikri, adam] = ranked
    expect(fikri!.total).toBe(60_500_000)
    expect(fikri!.diff).toBe(-855_500)
    expect(fikri!.diffPct).toBeCloseTo(-1.394, 3)
    expect(fikri!.gapPerGram).toBe(34_220)
    expect(fikri!.aboveBaseline).toBe(false)
    expect(adam!.gapPerGram).toBe(64_220)
  })

  it('menandai tawaran yang sudah melewati titik impas', () => {
    const [winner] = rankOffers([{ id: 9, name: 'Rian', price: 2_460_000 }], params, baseline)
    expect(winner!.aboveBaseline).toBe(true)
    expect(winner!.diff).toBeGreaterThan(0)
    expect(winner!.gapPerGram).toBeLessThan(0)
  })

  it('mengembalikan array kosong bila belum ada penawaran', () => {
    expect(rankOffers([], params, baseline)).toEqual([])
  })
})

describe('chartScale', () => {
  it('memberi ruang di atas simpangan terbesar', () => {
    const ranked = rankOffers(offers, params, calcBaseline(params))
    expect(chartScale(ranked)).toBe(3.5)
  })

  it('memakai skala minimum 1% saat belum ada penawaran', () => {
    expect(chartScale([])).toBe(1)
  })
})

describe('buildWaSummary', () => {
  const baseline = calcBaseline(params)
  const text = buildWaSummary(params, baseline, rankOffers(offers, params, baseline))

  it('memakai format desimal Indonesia untuk tarif', () => {
    expect(text).toContain('dipotong PPh 22 1,5% + materai Rp 10.000')
  })

  it('memuat patokan bersih dan harga impas per gram', () => {
    expect(text).toContain('bersih diterima Rp 61.355.500')
    expect(text).toContain('Rp 2.454.220/gr')
  })

  it('menyebut kekurangan tawaran tertinggi', () => {
    expect(text).toContain('Tawaran tertinggi (Fikri) masih kurang Rp 34.220/gr')
  })
})

describe('format', () => {
  it('memformat rupiah dan persen gaya Indonesia', () => {
    expect(formatRupiah(61_355_500)).toBe('Rp 61.355.500')
    expect(formatPercent(-1.3944)).toBe('−1,39%')
  })

  it('mem-parse input bebas dari pengguna', () => {
    expect(parseDigits('Rp 2.492.000')).toBe(2_492_000)
    expect(parseDigits('')).toBe(0)
    expect(parseDecimal('25,5')).toBe(25.5)
    expect(parseDecimal('abc')).toBe(0)
  })
})
