<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  description?: string
  to?: string
  disabled?: boolean
  tone?: 'default' | 'danger' | 'success'
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <component
    :is="to ? 'a' : 'button'"
    :href="to"
    :disabled="disabled"
    :class="[
      'flex items-center gap-4 w-full px-4 py-4 rounded-xl border min-h-[72px] transition-colors text-left',
      disabled
        ? 'bg-brown/5 border-brown/15 text-parchment/30 cursor-not-allowed'
        : tone === 'danger'
          ? 'bg-red-500/5 border-red-500/25 text-red-300 active:bg-red-500/15'
          : tone === 'success'
            ? 'bg-green-500/5 border-green-500/25 text-green-300 active:bg-green-500/15'
            : 'bg-charcoal border-brown/30 text-parchment active:bg-brown/15',
    ]"
    @click.prevent="!disabled && $emit('click')"
  >
    <div
      :class="[
        'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
        tone === 'danger' ? 'bg-red-500/15 text-red-400'
          : tone === 'success' ? 'bg-green-500/15 text-green-400'
          : 'bg-gold/15 text-gold',
      ]"
    >
      <UIcon :name="icon" class="text-2xl" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-base font-semibold leading-tight">{{ label }}</div>
      <div v-if="description" class="text-xs text-parchment/50 mt-0.5 leading-snug">
        {{ description }}
      </div>
    </div>
    <UIcon
      v-if="!disabled"
      name="i-lucide-chevron-right"
      class="text-xl text-parchment/30 shrink-0"
    />
  </component>
</template>
