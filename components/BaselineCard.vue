<script setup lang="ts">
import { computed } from 'vue'
import type { Baseline, Params } from '~/types'
import { formatDecimal, formatRupiah } from '~/utils/format'

const props = defineProps<{ params: Params; baseline: Baseline }>()

const rateNote = computed(() => {
  if (props.baseline.exempt) return '(nilai ≤ Rp 10 juta — tidak dipungut)'
  return props.params.pph === 0 ? '(SKB — tidak dipotong)' : '(dipotong Antam)'
})
</script>

<template>
  <section class="panel baseline">
    <div class="breakeven">
      <div class="eyebrow">Harga minimum per gram</div>
      <div class="num mono">{{ formatRupiah(baseline.perGram) }}</div>
      <div class="unit">per gram, tunai, tanpa potongan</div>
      <p>
        Di bawah angka ini, jual ke Antam lebih untung meski kena PPh 22 dan materai. Di atasnya,
        tawaran teman lebih baik.
      </p>
    </div>

    <div class="ledger">
      <div class="eyebrow" style="margin-bottom: 8px">Jalur Antam &mdash; hitungan bersih</div>

      <div class="ledger-row">
        <span>
          Harga bruto
          <span class="mono">
            {{ formatDecimal(params.weight) }} gr &times; {{ formatRupiah(params.buyback) }}
          </span>
        </span>
        <b class="mono">{{ formatRupiah(baseline.gross) }}</b>
      </div>

      <div class="ledger-row sub">
        <span>PPh 22 {{ formatDecimal(baseline.rate) }}% {{ rateNote }}</span>
        <span class="mono delta down">&minus; {{ formatRupiah(baseline.pphAmount) }}</span>
      </div>

      <div class="ledger-row sub">
        <span>Materai &amp; biaya lain</span>
        <span class="mono delta down">&minus; {{ formatRupiah(params.fee) }}</span>
      </div>

      <div class="ledger-row">
        <span>Uang yang benar-benar diterima</span>
        <b class="mono">{{ formatRupiah(baseline.net) }}</b>
      </div>
    </div>
  </section>
</template>
