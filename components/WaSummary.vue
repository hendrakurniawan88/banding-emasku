<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ text: string }>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const message = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

function flash(note: string) {
  message.value = note
  clearTimeout(timer)
  timer = setTimeout(() => (message.value = ''), 2600)
}

async function copy() {
  const el = textarea.value
  if (!el) return

  el.select()
  el.setSelectionRange(0, el.value.length)

  try {
    await navigator.clipboard.writeText(el.value)
    flash('Tersalin.')
  } catch {
    flash('Clipboard diblokir browser — teks sudah diblok, tekan Ctrl/Cmd + C.')
  }
}
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>Ringkasan untuk dikirim di WA</h2>
      <span class="hint">salin apa adanya</span>
    </div>

    <div class="panel-body wa">
      <label class="visually-hidden" for="wa-text">Ringkasan penawaran</label>
      <textarea id="wa-text" ref="textarea" :value="text" spellcheck="false" readonly />

      <div class="copy-row">
        <button class="btn primary" type="button" @click="copy">Salin teks</button>
        <span class="notes">{{ message }}</span>
      </div>
    </div>
  </section>
</template>
