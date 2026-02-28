<script setup lang="ts">
const props = defineProps<{
  bottleId: string
}>()

const router = useRouter()
const productionStore = useProductionStore()
const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const bottleProductions = computed(() =>
  productionStore.getProductionsByBottle(props.bottleId),
)

const totalProduced = computed(() =>
  bottleProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0),
)

const getBatchForProduction = (productionId: string) => {
  return batchStore.batches.find(
    (b) => b.stages?.bottled?.productionRecord === productionId,
  )
}

const getVesselNames = (vesselIds: string[]) => {
  return vesselIds
    .map((id) => vesselStore.getVesselById(id)?.name)
    .filter(Boolean)
    .join(", ")
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
          Production History
        </h3>
        <p v-if="bottleProductions.length > 0" class="text-xs text-parchment/60 mt-0.5">
          {{ bottleProductions.length }} production{{ bottleProductions.length !== 1 ? 's' : '' }}
          &middot; {{ totalProduced }} bottles produced
        </p>
      </div>
    </div>

    <!-- Production list -->
    <div v-if="bottleProductions.length > 0" class="space-y-3">
      <div
        v-for="prod in bottleProductions"
        :key="prod._id"
        class="rounded-lg border border-brown/20 bg-brown/5 p-4 cursor-pointer hover:border-copper/40 transition-colors"
        @click="router.push(`/admin/production/${prod._id}`)"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Date and batch info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium text-parchment">
                {{ new Date(prod.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </span>
              <span
                v-if="prod._id === bottleProductions[0]?._id"
                class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-copper/15 text-copper border border-copper/25"
              >
                Latest
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-parchment/60">
              <span v-if="getVesselNames(prod.vessel)">
                <UIcon name="i-lucide-container" class="inline-block mr-0.5 align-text-bottom" />
                {{ getVesselNames(prod.vessel) }}
              </span>
              <NuxtLink
                v-if="getBatchForProduction(prod._id)"
                :to="`/admin/batch/${getBatchForProduction(prod._id)?._id}`"
                class="text-copper hover:text-gold transition-colors"
                @click.stop
              >
                <UIcon name="i-lucide-flask-conical" class="inline-block mr-0.5 align-text-bottom" />
                Batch #{{ getBatchForProduction(prod._id)?.batchNumber || getBatchForProduction(prod._id)?._id?.slice(-6) }}
              </NuxtLink>
            </div>
          </div>

          <!-- Metrics -->
          <div class="flex items-center gap-4 sm:gap-6 text-right">
            <div>
              <div class="text-xs text-parchment/60 uppercase tracking-wider">Qty</div>
              <div class="text-sm font-semibold text-parchment">{{ prod.quantity }}</div>
            </div>
            <div>
              <div class="text-xs text-parchment/60 uppercase tracking-wider">Cost/Bottle</div>
              <div class="text-sm font-semibold text-copper">{{ Dollar.format(prod.bottleCost || 0) }}</div>
            </div>
            <div>
              <div class="text-xs text-parchment/60 uppercase tracking-wider">Total Cost</div>
              <div class="text-sm font-semibold text-parchment/70">{{ Dollar.format(prod.productionCost || 0) }}</div>
            </div>
            <UIcon name="i-lucide-chevron-right" class="text-parchment/30 shrink-0 hidden sm:block" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6">
      <UIcon name="i-lucide-factory" class="text-2xl text-parchment/20 mx-auto mb-2" />
      <p class="text-sm text-parchment/50">No production records for this bottle</p>
    </div>
  </div>
</template>
