<script setup lang="ts">
import type { Vessel } from '~/types'

const props = defineProps<{ vessel: Vessel }>()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const fillPercent = computed(() => {
  const max = props.vessel.stats?.volume
  const current = props.vessel.current?.volume
  if (!max || !current) return 0
  return Math.min(100, (current / max) * 100)
})

const contentsNames = computed(() => {
  if (!props.vessel.contents?.length) return []
  return props.vessel.contents.map(c => {
    const batch = batchStore.getBatchById(c.batch)
    if (!batch?.recipe) return 'Unknown'
    return recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown'
  }).filter((name, i, arr) => arr.indexOf(name) === i)
})

const typeIcon = computed(() => {
  switch (props.vessel.type) {
    case 'Mash Tun': return 'i-lucide-flame'
    case 'Fermenter': return 'i-lucide-beaker'
    case 'Still': return 'i-lucide-flask-conical'
    case 'Tank': return 'i-lucide-cylinder'
    case 'Barrel': return 'i-lucide-cylinder'
    default: return 'i-lucide-container'
  }
})

const fillColor = computed(() => {
  if (fillPercent.value === 0) return 'bg-brown/20'
  if (fillPercent.value < 30) return 'bg-blue-500/60'
  if (fillPercent.value < 70) return 'bg-copper/60'
  return 'bg-gold/60'
})
</script>

<template>
  <NuxtLink :to="`/admin/vessels/${vessel._id}`" class="block bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors cursor-pointer">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <UIcon :name="typeIcon" class="text-lg text-copper" />
        <div>
          <div class="text-sm font-medium text-parchment">{{ vessel.name }}</div>
          <div class="text-xs text-parchment/60">{{ vessel.type }}</div>
        </div>
      </div>
      <span
        v-if="vessel.current?.abv"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25"
      >
        {{ vessel.current.abv }}% ABV
      </span>
    </div>

    <!-- Fill level bar -->
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-parchment/60">Fill Level</span>
        <span class="text-parchment/60">
          {{ vessel.current?.volume || 0 }}{{ vessel.current?.volumeUnit ? ` ${vessel.current.volumeUnit}` : '' }}
          <span v-if="vessel.stats?.volume" class="text-parchment/50">/ {{ vessel.stats.volume }} {{ vessel.stats.volumeUnit || '' }}</span>
        </span>
      </div>
      <div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="fillColor"
          :style="{ width: `${fillPercent}%` }"
        />
      </div>
    </div>

    <!-- Contents -->
    <div v-if="contentsNames.length > 0" class="mb-2">
      <div class="text-xs text-parchment/60 mb-1">Contents</div>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="name in contentsNames"
          :key="name"
          class="px-1.5 py-0.5 rounded text-[10px] bg-brown/20 text-parchment/60"
        >
          {{ name }}
        </span>
      </div>
    </div>
    <div v-else class="text-xs text-parchment/20 mb-2">Empty</div>

    <!-- Value -->
    <div v-if="vessel.current?.value" class="text-right">
      <span class="text-xs text-parchment/60">Value: </span>
      <span class="text-xs text-parchment font-medium">{{ Dollar.format(vessel.current.value) }}</span>
    </div>
  </NuxtLink>
</template>
