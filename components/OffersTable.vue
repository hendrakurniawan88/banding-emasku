<script setup lang="ts">
import type { RankedOffer } from '~/types'
import {
  formatNumber,
  formatPercent,
  formatRupiah,
  formatSignedRupiah,
  parseDigits,
} from '~/utils/format'

defineProps<{ offers: RankedOffer[] }>()

const emit = defineEmits<{
  rename: [id: number, name: string]
  reprice: [id: number, price: number]
  remove: [id: number]
  add: []
  reset: []
}>()

function onName(id: number, event: Event) {
  emit('rename', id, (event.target as HTMLInputElement).value)
}

function onPrice(id: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseDigits(target.value)
  target.value = formatNumber(value)
  emit('reprice', id, value)
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Penawaran yang masuk</h2>
      <span class="hint">nama &amp; harga bisa langsung diedit</span>
    </div>

    <div class="tbl-scroll">
      <table>
        <thead>
          <tr>
            <th>Calon buyer</th>
            <th>Tawaran / gr</th>
            <th>Total diterima</th>
            <th>Selisih vs Antam</th>
            <th>%</th>
            <th>Kurang / gr</th>
            <th>Posisi</th>
            <th><span class="visually-hidden">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="offers.length === 0">
            <td colspan="8" style="text-align: center; color: var(--muted); padding: 26px">
              Belum ada penawaran. Tambah satu untuk mulai membandingkan.
            </td>
          </tr>

          <tr v-for="(offer, index) in offers" :key="offer.id" :class="{ best: index === 0 }">
            <td>
              <div class="buyer">
                <span class="rank mono">{{ index + 1 }}</span>
                <input
                  :value="offer.name"
                  :data-focus-id="offer.id"
                  aria-label="Nama calon buyer"
                  autocomplete="off"
                  @input="onName(offer.id, $event)"
                >
              </div>
            </td>
            <td>
              <input
                class="cell-input mono"
                :value="formatNumber(offer.price)"
                inputmode="numeric"
                autocomplete="off"
                aria-label="Tawaran per gram"
                @input="onPrice(offer.id, $event)"
              >
            </td>
            <td class="mono">{{ formatRupiah(offer.total) }}</td>
            <td class="mono delta" :class="offer.aboveBaseline ? 'up' : 'down'">
              {{ formatSignedRupiah(offer.diff) }}
            </td>
            <td class="mono delta" :class="offer.aboveBaseline ? 'up' : 'down'">
              {{ formatPercent(offer.diffPct) }}
            </td>
            <td class="mono">
              <span v-if="offer.aboveBaseline" style="color: var(--muted)">&mdash;</span>
              <template v-else>{{ formatRupiah(offer.gapPerGram) }} / gr</template>
            </td>
            <td>
              <span class="pill" :class="offer.aboveBaseline ? 'up' : 'down'">
                {{ offer.aboveBaseline ? 'Di atas Antam' : 'Di bawah Antam' }}
              </span>
            </td>
            <td>
              <button
                class="icon-btn"
                type="button"
                :aria-label="`Hapus ${offer.name}`"
                @click="emit('remove', offer.id)"
              >
                &times;
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row-actions">
      <button class="btn" type="button" @click="emit('add')">+ Tambah penawaran</button>
      <button class="btn" type="button" @click="emit('reset')">Reset ke data awal</button>
    </div>

    <div class="panel-body" style="padding-top: 14px">
      <p class="notes" style="margin: 0">
        <b>Asumsi:</b> tawaran teman dihitung tunai penuh &mdash; tanpa PPh 22, tanpa materai, tanpa
        ongkos kirim. Kalau ada biaya yang Anda tanggung, turunkan tawaran/gr-nya secara manual
        supaya adil.
      </p>
    </div>
  </section>
</template>
