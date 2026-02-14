<script setup lang="ts">
import type { Vessel } from '~/types'
import { differenceInDays } from 'date-fns'

const props = defineProps<{
  vessel: Vessel
  targetAgeDays?: number
}>()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const contentsName = computed(() => {
  if (!props.vessel.contents?.length) return 'Empty'
  return props.vessel.contents.map(c => {
    const batch = batchStore.getBatchById(c.batch)
    if (!batch?.recipe) return 'Unknown'
    return recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown'
  }).filter((name, i, arr) => arr.indexOf(name) === i).join(', ')
})

const fillDate = computed(() => {
  if (!props.vessel.contents?.length) return null
  const batch = batchStore.getBatchById(props.vessel.contents[0].batch)
  return batch?.barreled?.entry?.date ? new Date(batch.barreled.entry.date) : null
})

const ageDays = computed(() => {
  if (!fillDate.value) return 0
  return differenceInDays(new Date(), fillDate.value)
})

const ageDisplay = computed(() => {
  const days = ageDays.value
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`
})

const atTarget = computed(() =>
  props.targetAgeDays ? ageDays.value >= props.targetAgeDays : false
)

const ageFraction = computed(() => {
  if (!ageDays.value || ageDays.value === 0) return 0
  return Math.min(ageDays.value / (365 * 3), 1) // scale to 3 years max
})

const borderColor = computed(() => {
  if (atTarget.value) return 'border-gold ring-1 ring-gold/30'
  if (ageFraction.value > 0.66) return 'border-amber-700/60'
  if (ageFraction.value > 0.33) return 'border-amber-500/40'
  return 'border-brown/30'
})

const ageBgGradient = computed(() => {
  if (!fillDate.value) return 'bg-charcoal'
  if (ageFraction.value > 0.66) return 'bg-gradient-to-b from-amber-900/20 to-charcoal'
  if (ageFraction.value > 0.33) return 'bg-gradient-to-b from-amber-800/15 to-charcoal'
  return 'bg-gradient-to-b from-amber-700/10 to-charcoal'
})
</script>

<template>
  <div
    class="rounded-xl border p-4 transition-all"
    :class="[borderColor, ageBgGradient]"
  >
    <div class="flex items-start justify-between mb-2">
      <div>
        <div class="text-sm font-medium text-parchment">{{ vessel.name }}</div>
        <div class="text-xs text-parchment/60">{{ contentsName }}</div>
      </div>
      <span
        v-if="vessel.current?.abv"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25"
      >
        {{ vessel.current.abv }}% ABV
      </span>
    </div>

    <div class="space-y-1.5 text-xs">
      <div v-if="fillDate" class="flex justify-between text-parchment/50">
        <span>Fill Date</span>
        <span class="text-parchment/70">{{ fillDate.toLocaleDateString() }}</span>
      </div>
      <div v-if="ageDays > 0" class="flex justify-between text-parchment/50">
        <span>Age</span>
        <span class="font-semibold" :class="atTarget ? 'text-gold' : 'text-parchment/70'">{{ ageDisplay }}</span>
      </div>
      <div v-if="vessel.barrel?.char" class="flex justify-between text-parchment/50">
        <span>Char Level</span>
        <span class="text-parchment/70">{{ vessel.barrel.char }}</span>
      </div>
      <div v-if="vessel.barrel?.cost" class="flex justify-between text-parchment/50">
        <span>Barrel Cost</span>
        <span class="text-parchment/70">{{ Dollar.format(vessel.barrel.cost) }}</span>
      </div>
      <div v-if="vessel.current?.volume" class="flex justify-between text-parchment/50">
        <span>Volume</span>
        <span class="text-parchment/70">{{ vessel.current.volume }} {{ vessel.current.volumeUnit || 'gal' }}</span>
      </div>
    </div>

    <div v-if="atTarget" class="mt-2 text-center">
      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold border border-gold/30">
        At Target
      </span>
    </div>
  </div>
</template>
