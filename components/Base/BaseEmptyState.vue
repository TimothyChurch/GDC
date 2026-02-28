<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="text-center py-12">
    <UIcon
      v-if="icon"
      :name="icon"
      class="text-3xl text-parchment/30 mx-auto mb-3"
    />
    <p class="text-sm font-medium text-parchment/70 mb-1">{{ title }}</p>
    <p v-if="description" class="text-xs text-parchment/50 mb-4">{{ description }}</p>
    <UButton
      v-if="actionLabel"
      icon="i-lucide-plus-circle"
      variant="ghost"
      size="sm"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </UButton>
  </div>
</template>
