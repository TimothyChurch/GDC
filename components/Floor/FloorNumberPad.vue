<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number | null | undefined
  decimals?: boolean
  unit?: string
  placeholder?: string
}>(), {
  decimals: true,
  placeholder: '0',
})

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const display = ref<string>(
  props.modelValue !== null && props.modelValue !== undefined && Number.isFinite(props.modelValue)
    ? String(props.modelValue)
    : ''
)

watch(() => props.modelValue, (v) => {
  const incoming = v !== null && v !== undefined && Number.isFinite(v) ? String(v) : ''
  if (incoming !== display.value && parseFloat(display.value) !== v) {
    display.value = incoming
  }
})

function emitValue() {
  if (display.value === '' || display.value === '.') {
    emit('update:modelValue', null)
    return
  }
  const n = parseFloat(display.value)
  emit('update:modelValue', Number.isFinite(n) ? n : null)
}

function tapDigit(d: string) {
  if (d === '.' && (!props.decimals || display.value.includes('.'))) return
  if (d === '0' && display.value === '0') return
  if (display.value === '0' && d !== '.') {
    display.value = d
  } else {
    display.value += d
  }
  emitValue()
}

function tapBackspace() {
  display.value = display.value.slice(0, -1)
  emitValue()
}

function tapClear() {
  display.value = ''
  emitValue()
}

const keys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
</script>

<template>
  <div class="space-y-3">
    <!-- Display -->
    <div class="bg-brown/15 rounded-xl border border-brown/30 p-4 flex items-baseline justify-end gap-2 min-h-[64px]">
      <span class="text-3xl font-mono tabular-nums text-parchment leading-none">
        {{ display || placeholder }}
      </span>
      <span v-if="unit" class="text-sm text-parchment/50 leading-none">{{ unit }}</span>
    </div>

    <!-- Keypad -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="k in keys"
        :key="k"
        type="button"
        class="h-14 rounded-lg bg-charcoal border border-brown/30 text-2xl font-medium text-parchment active:bg-brown/30 transition-colors"
        @click="tapDigit(k)"
      >
        {{ k }}
      </button>
      <button
        type="button"
        class="h-14 rounded-lg bg-charcoal border border-brown/30 text-2xl font-medium text-parchment active:bg-brown/30 transition-colors disabled:opacity-30"
        :disabled="!decimals"
        @click="tapDigit('.')"
      >
        .
      </button>
      <button
        type="button"
        class="h-14 rounded-lg bg-charcoal border border-brown/30 text-2xl font-medium text-parchment active:bg-brown/30 transition-colors"
        @click="tapDigit('0')"
      >
        0
      </button>
      <button
        type="button"
        class="h-14 rounded-lg bg-charcoal border border-brown/30 text-2xl text-parchment/70 active:bg-brown/30 transition-colors flex items-center justify-center"
        @click="tapBackspace"
        aria-label="Backspace"
      >
        <UIcon name="i-lucide-delete" />
      </button>
    </div>

    <button
      type="button"
      class="w-full h-10 rounded-lg bg-brown/10 border border-brown/20 text-sm text-parchment/50 active:bg-brown/20 transition-colors"
      @click="tapClear"
    >
      Clear
    </button>
  </div>
</template>
