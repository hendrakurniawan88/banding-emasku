import { computed, reactive, ref, watch } from 'vue'
import type { Offer, Params } from '~/types'
import {
  DEFAULT_OFFERS,
  DEFAULT_PARAMS,
  buildWaSummary,
  calcBaseline,
  rankOffers,
} from '~/utils/gold'

const STORAGE_KEY = 'banding-emasku:v1'

interface PersistedState {
  params: Params
  offers: Offer[]
}

function readStorage(): PersistedState | null {
  if (!import.meta.client) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed?.params || !Array.isArray(parsed.offers)) return null
    return parsed
  } catch {
    // localStorage bisa diblokir (private mode / kebijakan browser) — pakai default.
    return null
  }
}

function writeStorage(state: PersistedState): void {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Gagal menyimpan bukan kondisi fatal: kalkulator tetap jalan di memori.
  }
}

export function useGoldCalculator() {
  const params = reactive<Params>({ ...DEFAULT_PARAMS })
  const offers = ref<Offer[]>(DEFAULT_OFFERS.map((offer) => ({ ...offer })))
  const restored = ref(false)

  const baseline = computed(() => calcBaseline(params))
  const ranked = computed(() => rankOffers(offers.value, params, baseline.value))
  const waSummary = computed(() => buildWaSummary(params, baseline.value, ranked.value))

  function restore(): void {
    const saved = readStorage()
    if (saved) {
      Object.assign(params, saved.params)
      offers.value = saved.offers
    }
    restored.value = true
  }

  function reset(): void {
    Object.assign(params, DEFAULT_PARAMS)
    offers.value = DEFAULT_OFFERS.map((offer) => ({ ...offer }))
  }

  function addOffer(): number {
    const nextId = offers.value.reduce((max, offer) => Math.max(max, offer.id), 0) + 1
    offers.value.push({
      id: nextId,
      name: 'Buyer baru',
      price: Math.round(baseline.value.perGram / 1000) * 1000,
    })
    return nextId
  }

  function removeOffer(id: number): void {
    offers.value = offers.value.filter((offer) => offer.id !== id)
  }

  watch(
    [() => ({ ...params }), offers],
    () => {
      if (restored.value) writeStorage({ params: { ...params }, offers: offers.value })
    },
    { deep: true },
  )

  return { params, offers, baseline, ranked, waSummary, restore, reset, addOffer, removeOffer }
}
