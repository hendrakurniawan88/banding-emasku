<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RankedOffer } from '~/types'
import { chartScale } from '~/utils/gold'
import { formatPercent, formatRupiah, formatSignedRupiah } from '~/utils/format'

const props = defineProps<{ offers: RankedOffer[] }>()

const scale = computed(() => chartScale(props.offers))
const ticks = computed(() => {
  const max = scale.value
  return [-max, -max / 2, 0, max / 2, max]
})

/** Posisi kiri (persen lebar track) untuk sebuah nilai simpangan. */
function tickLeft(value: number): string {
  return `${50 + (value / scale.value) * 50}%`
}

/** Lebar batang: setengah track dipakai untuk skala penuh satu sisi. */
function barWidth(offer: RankedOffer): string {
  return `${(Math.abs(offer.diffPct) / scale.value) * 50}%`
}

const tip = ref<{ x: number; y: number; offer: RankedOffer } | null>(null)

function showTip(event: MouseEvent, offer: RankedOffer) {
  tip.value = {
    x: Math.min(event.clientX + 14, window.innerWidth - 250),
    y: event.clientY + 16,
    offer,
  }
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Jarak ke patokan Antam</h2>
      <span class="hint">garis emas = titik impas</span>
    </div>

    <div class="chart">
      <p v-if="offers.length === 0" class="notes chart-empty" style="margin: 8px 0 16px">
        Grafik muncul setelah ada penawaran.
      </p>

      <template v-for="offer in offers" :key="offer.id">
        <div class="chart-name">{{ offer.name }}</div>
        <div class="track" @mousemove="showTip($event, offer)" @mouseleave="tip = null">
          <div
            v-for="tick in ticks"
            :key="tick"
            class="gridline"
            :class="{ zero: tick === 0 }"
            :style="{ left: tickLeft(tick) }"
          />
          <div
            class="bar"
            :class="offer.aboveBaseline ? 'up' : 'down'"
            :style="
              offer.aboveBaseline
                ? { left: '50%', width: barWidth(offer) }
                : { right: '50%', width: barWidth(offer) }
            "
          />
        </div>
        <div class="chart-val">
          <span class="pctv">{{ formatPercent(offer.diffPct) }}</span>
          &middot; {{ formatSignedRupiah(offer.diff) }}
        </div>
      </template>

      <div v-if="offers.length > 0" class="axis">
        <span v-for="tick in ticks" :key="tick" :style="{ left: tickLeft(tick) }">
          {{ tick === 0 ? '0' : formatPercent(tick) }}
        </span>
      </div>

      <div v-if="offers.length > 0" class="axis-note">
        <span>&larr; lebih rendah dari uang bersih Antam</span>
        <span>lebih tinggi &rarr;</span>
      </div>
    </div>

    <div v-if="tip" id="tip" role="status" :style="{ left: `${tip.x}px`, top: `${tip.y}px` }">
      <b>{{ tip.offer.name }}</b><br>
      {{ formatRupiah(tip.offer.price) }} / gr &middot; total
      <b>{{ formatRupiah(tip.offer.total) }}</b><br>
      {{ tip.offer.aboveBaseline ? 'Lebih tinggi' : 'Lebih rendah' }}
      <b>{{ formatRupiah(Math.abs(tip.offer.diff)) }}</b>
      ({{ formatPercent(tip.offer.diffPct) }}) dari uang bersih Antam
    </div>
  </section>
</template>
