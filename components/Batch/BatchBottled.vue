<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
}>()

const productionStore = useProductionStore()
const bottleStore = useBottleStore()

const production = computed(() => {
  if (!props.batch.bottled?.productionRecord) return null
  return productionStore.productions.find((p) => p._id === props.batch.bottled.productionRecord)
})

const bottleName = computed(() => {
  if (!production.value?.bottle) return 'Unknown'
  return bottleStore.getBottleById(production.value.bottle)?.name || 'Unknown'
})

const prodDate = computed(() => {
  if (!production.value?.date) return ''
  return new Date(production.value.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-green-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-wine" class="text-lg text-green-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Bottled</h3>
    </div>

    <template v-if="production">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
          <div class="text-sm text-parchment">{{ prodDate }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle</div>
          <div class="text-sm text-parchment">{{ bottleName }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Quantity</div>
          <div class="text-sm text-parchment">{{ production.quantity }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle Cost</div>
          <div class="text-sm text-parchment">{{ Dollar.format(production.bottleCost || 0) }}</div>
        </div>
      </div>
      <div class="mt-3">
        <NuxtLink
          :to="`/admin/production`"
          class="text-xs text-copper hover:text-gold transition-colors"
        >
          View Production Record &rarr;
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <div class="text-center py-6">
        <UIcon name="i-lucide-wine-off" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No production record linked</p>
      </div>
    </template>
  </div>
</template>
