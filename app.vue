<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import type { Params } from '~/types'
import { formatRupiah } from '~/utils/format'
import { useGoldCalculator } from '~/composables/useGoldCalculator'

const { params, offers, baseline, ranked, waSummary, restore, reset, addOffer, removeOffer } =
  useGoldCalculator()

onMounted(restore)

function patchParams(patch: Partial<Params>) {
  Object.assign(params, patch)
}

function rename(id: number, name: string) {
  const offer = offers.value.find((item) => item.id === id)
  if (offer) offer.name = name
}

function reprice(id: number, price: number) {
  const offer = offers.value.find((item) => item.id === id)
  if (offer) offer.price = price
}

async function add() {
  const id = addOffer()
  await nextTick()
  document.querySelector<HTMLInputElement>(`[data-focus-id="${id}"]`)?.select()
}
</script>

<template>
  <div class="wrap">
    <header>
      <div>
        <div class="eyebrow">Emas batangan Antam</div>
        <h1>Tawaran mereka, <em>patokan saya</em></h1>
        <p class="subhead">
          Setiap penawaran dibandingkan ke satu angka: berapa rupiah bersih yang benar-benar masuk
          kantong kalau emas dijual balik ke Antam hari ini.
        </p>
      </div>
      <div class="stamp mono">
        <b>{{ formatRupiah(params.buyback) }} / gr</b>
        harga buyback yang dipakai
      </div>
    </header>

    <ParamPanel :params="params" @update="patchParams" />

    <BaselineCard :params="params" :baseline="baseline" />

    <OffersTable
      :offers="ranked"
      @rename="rename"
      @reprice="reprice"
      @remove="removeOffer"
      @add="add"
      @reset="reset"
    />

    <GapChart :offers="ranked" />

    <WaSummary :text="waSummary" />

    <footer>
      <p class="notes" style="margin: 0">
        <b>Catatan pajak.</b> Dasar yang dipakai Antam pada halaman buyback-nya adalah
        <b>PMK 81/2024</b>: transaksi buyback di atas Rp 10 juta dipotong PPh 22 sebesar
        <b>1,5%</b>, langsung dari nilai transaksi. Karena <b>NIK sudah berfungsi sebagai NPWP</b>
        (PMK 112/2022), tarif 1,5% berlaku selama data identitas valid dan padan &mdash; tarif 100%
        lebih tinggi (3%) hanya relevan bila identitas tidak dapat divalidasi. Pemotongan juga tidak
        dilakukan bila penjual memegang Surat Keterangan Bebas. PMK 51/2025 dan 52/2025 mengatur
        emas lewat LJK bulion (tarif 0,25%) dan tidak mengubah pemotongan pada buyback Antam.
        Penjualan antar-individu tidak dipotong PPh 22, jadi tawaran teman memang dibandingkan ke
        angka <em>bersih</em> Antam, bukan ke harga buyback kotornya. Konfirmasi ulang di gerai
        sebelum transaksi.
      </p>
    </footer>
  </div>
</template>
