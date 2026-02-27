<script setup lang="ts">
/**
 * BaseQuantityInput
 * Combines a numeric input with a unit selector in a UFieldGroup.
 * Supports v-model:value (number) and v-model:unit (string).
 *
 * Usage:
 *   <BaseQuantityInput
 *     v-model:value="batch.batchSize"
 *     v-model:unit="batch.batchSizeUnit"
 *     :unit-options="volumeUnits"
 *     placeholder="Volume"
 *   />
 */
const props = withDefaults(defineProps<{
  value: number | string | null | undefined
  unit: string | null | undefined
  unitOptions: string[]
  placeholder?: string
  unitPlaceholder?: string
  size?: string
  disabled?: boolean
  step?: string
  min?: string
}>(), {
  placeholder: '',
  unitPlaceholder: 'unit',
  size: 'md',
  disabled: false,
  step: 'any',
  min: '0',
})

const emit = defineEmits<{
  'update:value': [val: number | string | null | undefined]
  'update:unit': [val: string | null | undefined]
}>()

const localValue = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val),
})

const localUnit = computed({
  get: () => props.unit ?? undefined,
  set: (val) => emit('update:unit', val),
})
</script>

<template>
  <UFieldGroup>
    <UInput
      v-model="localValue"
      type="number"
      :placeholder="placeholder"
      :size="size as any"
      :disabled="disabled"
      :step="step"
      :min="min"
    />
    <USelect
      v-model="localUnit"
      :items="unitOptions"
      :placeholder="unitPlaceholder"
      :size="size as any"
      :disabled="disabled"
    />
  </UFieldGroup>
</template>
