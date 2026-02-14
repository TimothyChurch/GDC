<script setup lang="ts">
import type { Cocktail } from '~/types'

const props = defineProps<{ cocktail: Cocktail }>()

const cocktailStore = useCocktailStore()

const cost = computed(() => cocktailStore.cocktailCost(props.cocktail))
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors">
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="text-sm font-medium text-parchment">{{ cocktail.name }}</div>
        <div class="text-xs text-parchment/60">{{ cocktail.glassware }}</div>
      </div>
      <UButton
        :icon="cocktail.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
        size="xs"
        variant="ghost"
        :color="cocktail.visible ? 'neutral' : 'error'"
        @click.stop="cocktailStore.toggleVisibility(cocktail._id)"
        :aria-label="cocktail.visible ? 'Hide cocktail' : 'Show cocktail'"
      />
    </div>

    <div class="flex items-center gap-2 mb-2">
      <span
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"
      >
        Cost: {{ Dollar.format(cost) }}
      </span>
      <span
        v-if="cocktail.price"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"
      >
        Price: {{ Dollar.format(cocktail.price) }}
      </span>
    </div>

    <div v-if="cocktail.menu" class="text-xs text-parchment/60 mb-2">
      Menu: {{ cocktail.menu }}
    </div>

    <div class="text-right">
      <span
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
        :class="cocktail.visible
          ? 'bg-green-500/15 text-green-400 border-green-500/25'
          : 'bg-red-500/15 text-red-400 border-red-500/25'"
      >
        {{ cocktail.visible ? 'On Menu' : 'Hidden' }}
      </span>
    </div>
  </div>
</template>
