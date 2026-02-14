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

  <div v-else-if="cocktails.length === 0" class="text-center py-12">
    <UIcon name="i-lucide-martini" class="text-2xl text-parchment/20 mx-auto mb-2" />
    <p class="text-sm text-parchment/50">No cocktails found</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    <CocktailCard
      v-for="cocktail in cocktails"
      :key="cocktail._id"
      :cocktail="cocktail"
    />
  </div>
</template>
