<script setup lang="ts">
import type { Cocktail } from '~/types'

const props = defineProps<{
  data?: Cocktail[]
}>()

const cocktailStore = useCocktailStore()

const cocktails = computed(() => props.data ?? cocktailStore.cocktails)
</script>

<template>
  <div v-if="cocktailStore.loading" class="text-center py-12">
    <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
    <p class="text-sm text-parchment/50">Loading cocktails...</p>
  </div>

  <BaseEmptyState v-else-if="cocktails.length === 0" icon="i-lucide-martini" title="No cocktails found" description="Add cocktails to build your menu" />

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    <CocktailCard
      v-for="cocktail in cocktails"
      :key="cocktail._id"
      :cocktail="cocktail"
    />
  </div>
</template>
