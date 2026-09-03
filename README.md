# Banding Emasku

Kalkulator pembanding penawaran calon pembeli emas terhadap **harga bersih buyback Antam**.
Angka pembandingnya bukan harga buyback kotor, melainkan uang yang benar-benar diterima setelah
PPh 22 dan materai — karena penjualan antar-individu tidak dipotong keduanya.

## Stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | Nuxt 3 (SSG) | Standar tim; `nuxt generate` menghasilkan static murni |
| State | Composable + `reactive` | Satu halaman, satu sumber state — Pinia belum berbayar manfaatnya |
| Persistensi | `localStorage`, guard `import.meta.client` | Tanpa backend, tanpa biaya |
| Styling | CSS variables (light/dark) | Nol dependensi |
| Test | Vitest pada logic murni | Perhitungan uang wajib punya jaring pengaman |

Tidak ada dependensi runtime di luar Nuxt dan Vue.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit test logic perhitungan
npm run generate   # output static ke .output/public
```

## Deploy ke Vercel

`vercel.json` sudah mengunci mode static:

```json
{ "buildCommand": "npm run generate", "outputDirectory": ".output/public" }
```

1. Push repo ini ke `origin` (GitHub).
2. Vercel → **Add New Project** → import `banding-emasku`.
3. Framework preset terdeteksi **Nuxt.js**; biarkan setting default — `vercel.json` yang menang.
4. Deploy. Hasilnya static file, tanpa serverless function, jadi masuk free tier.

CLI: `npx vercel --prod`.

## Struktur

```
app.vue                        # komposisi halaman
components/ParamPanel.vue      # input buyback, berat, tarif PPh, materai
components/BaselineCard.vue    # harga impas + rincian potongan
components/OffersTable.vue     # tabel penawaran (editable)
components/GapChart.vue        # grafik divergen vs titik impas
components/WaSummary.vue       # teks siap kirim WhatsApp
composables/useGoldCalculator.ts
utils/gold.ts                  # SEMUA logic perhitungan (pure, teruji)
utils/format.ts                # formatter & parser rupiah
tests/gold.spec.ts
```

Aturan main: `utils/gold.ts` bebas dari DOM dan Vue. Setiap perubahan rumus masuk ke sana dan
wajib bawa test.

## Dasar perhitungan

```
bruto       = berat × harga buyback per gram
PPh 22      = bruto × tarif   (0% bila bruto ≤ Rp 10.000.000 — PMK 81/2024)
net         = bruto − PPh 22 − materai
titik impas = net ÷ berat      → tawaran per gram harus di atas angka ini
```

Tarif PPh 22 buyback: **1,5%** selama NIK/NPWP valid dan padan (NIK berfungsi sebagai NPWP,
PMK 112/2022); 3% hanya bila identitas tidak dapat divalidasi; 0% bila memegang SKB.
PMK 51/2025 dan 52/2025 mengatur emas lewat LJK bulion dan tidak mengubah pemotongan buyback Antam.

> Angka default (harga buyback 3 Sep 2026) adalah titik awal, bukan harga live.
> Perbarui field "Harga buyback / gr" sebelum dipakai menawar.

## Konvensi

Conventional Commits — `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.
