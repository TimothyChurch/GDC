<script setup lang="ts">
import { fToC, cToF, brixToSg, sgToBrix, asGallons } from '~/utils/gaugeCalc'
import { abvToProof, proofToAbv } from '~/composables/transferDefinitions'

type CalcKind = 'abv' | 'proof' | 'temperature-f' | 'temperature-c' | 'brix' | 'sg' | 'volume-gal'

const props = withDefaults(defineProps<{
  modelValue: number | null | undefined
  kind?: CalcKind
  /** Source unit for `kind="volume-gal"` — converts to gallons (e.g. 'L', 'mL'). */
  fromUnit?: string
  /** ABV needed to compute proof gallons when `kind === "volume-gal"`. */
  abv?: number
  placeholder?: string
  step?: string | number
  min?: string | number
  max?: string | number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
}>(), {
  size: 'md',
  step: 'any',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const inner = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit('update:modelValue', v === '' || v == null ? null : Number(v)),
})

const companion = computed<string | null>(() => {
  const v = props.modelValue
  if (v === null || v === undefined || !Number.isFinite(v as number)) return null
  const n = Number(v)
  switch (props.kind) {
    case 'abv':
      return n > 0 ? `≈ ${abvToProof(n)} proof` : null
    case 'proof':
      return n > 0 ? `≈ ${proofToAbv(n)}% ABV` : null
    case 'temperature-f':
      return Number.isFinite(n) ? `≈ ${fToC(n)} °C` : null
    case 'temperature-c':
      return Number.isFinite(n) ? `≈ ${cToF(n)} °F` : null
    case 'brix':
      return n > 0 ? `≈ ${brixToSg(n)} SG` : null
    case 'sg':
      return n > 1 ? `≈ ${sgToBrix(n)} °P` : null
    case 'volume-gal': {
      if (n <= 0) return null
      const fromUnit = props.fromUnit
      if (!fromUnit || fromUnit === 'gal' || fromUnit === 'gallon') {
        if (props.abv && props.abv > 0) {
          const pg = +((asGallons(n, fromUnit || 'gallon') * props.abv) / 50).toFixed(2)
          return pg > 0 ? `${pg} proof gallons @ ${props.abv}% ABV` : null
        }
        return null
      }
      const gallons = asGallons(n, fromUnit)
      if (gallons <= 0) return null
      if (props.abv && props.abv > 0) {
        const pg = +((gallons * props.abv) / 50).toFixed(2)
        return `≈ ${gallons} gal · ${pg} PG`
      }
      return `≈ ${gallons} gal`
    }
    default:
      return null
  }
})
</script>

<template>
  <div>
    <UInput
      v-model.number="inner"
      type="number"
      :placeholder="placeholder"
      :step="step"
      :min="min"
      :max="max"
      :size="size"
      :disabled="disabled"
    />
    <p
      v-if="companion"
      class="mt-0.5 text-[10px] text-parchment/40 leading-tight tabular-nums"
      aria-live="polite"
    >
      <UIcon name="i-lucide-calculator" class="text-[11px] mr-0.5 align-text-bottom" />
      {{ companion }}
    </p>
  </div>
</template>
