<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-3">
      <UIcon v-if="icon" :name="icon" class="text-2xl text-gold shrink-0" />
      <div>
        <h1 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond]">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-parchment/60 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
