<script setup lang="ts">
import { computed } from 'vue'
import type { Params } from '~/types'
import { formatDecimal, formatNumber, parseDecimal, parseDigits } from '~/utils/format'

const props = defineProps<{ params: Params }>()
const emit = defineEmits<{ update: [patch: Partial<Params>] }>()

const buybackText = computed(() => formatNumber(props.params.buyback))
const feeText = computed(() => formatNumber(props.params.fee))
const weightText = computed(() => formatDecimal(props.params.weight))

function onBuyback(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseDigits(target.value)
  target.value = formatNumber(value)
  emit('update', { buyback: value })
}

function onFee(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseDigits(target.value)
  target.value = formatNumber(value)
  emit('update', { fee: value })
}

function onWeight(event: Event) {
  emit('update', { weight: parseDecimal((event.target as HTMLInputElement).value) })
}

function onPph(event: Event) {
  emit('update', { pph: Number.parseFloat((event.target as HTMLSelectElement).value) })
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Parameter patokan</h2>
      <span class="hint">ubah angkanya, semua ikut berubah</span>
    </div>
    <div class="panel-body grid-params">
      <label class="field">
        <span>Harga buyback / gr</span>
        <span class="prefix">
          <input
            :value="buybackText"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            @input="onBuyback"
          >
        </span>
      </label>

      <label class="field">
        <span>Berat total (gram)</span>
        <input
          :value="weightText"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          @input="onWeight"
        >
      </label>

      <label class="field">
        <span>PPh 22</span>
        <select :value="String(params.pph)" @change="onPph">
          <option value="1.5">1,5% &mdash; NIK/NPWP valid</option>
          <option value="3">3% &mdash; NIK tidak padan</option>
          <option value="0">0% &mdash; punya SKB</option>
        </select>
      </label>

      <label class="field">
        <span>Materai &amp; biaya lain</span>
        <span class="prefix">
          <input :value="feeText" type="text" inputmode="numeric" autocomplete="off" @input="onFee">
        </span>
      </label>
    </div>
  </section>
</template>
