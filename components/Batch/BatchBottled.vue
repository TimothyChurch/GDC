<script setup lang="ts">
import type { Batch, BottledStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const productionStore = useProductionStore()
const bottleStore = useBottleStore()

const stage = computed(() => props.batch.stages?.bottled as BottledStage | undefined)

const production = computed(() => {
  if (!stage.value?.productionRecord) return null
  return productionStore.productions.find((p) => p._id === stage.value?.productionRecord)
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

// Editing state
const local = ref({
  bottleCount: stage.value?.bottleCount,
  bottleSize: stage.value?.bottleSize || '',
  lotNumber: stage.value?.lotNumber || '',
  labeledAbv: stage.value?.labeledAbv,
  notes: stage.value?.notes || '',
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Bottled', {
      bottleCount: local.value.bottleCount,
      bottleSize: local.value.bottleSize,
      lotNumber: local.value.lotNumber,
      labeledAbv: local.value.labeledAbv,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-green-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-wine" class="text-lg text-green-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Bottled</h3>
    </div>

    <!-- Production Record Link -->
    <template v-if="production">
      <div class="mb-5 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
        <div class="text-xs font-semibold text-parchment/60 uppercase mb-3">Linked Production Record</div>
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
            to="/admin/production"
            class="text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            View Production Record &rarr;
          </NuxtLink>
        </div>
      </div>
    </template>
    <template v-else-if="!editing">
      <div class="mb-5 text-center py-4">
        <UIcon name="i-lucide-wine-off" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No production record linked</p>
      </div>
    </template>

    <!-- Bottling Details -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle Count</div>
        <template v-if="editing">
          <UInput v-model.number="local.bottleCount" type="number" placeholder="0" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.bottleCount || 'N/A' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle Size</div>
        <template v-if="editing">
          <UInput v-model="local.bottleSize" placeholder="e.g. 750mL" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.bottleSize || 'N/A' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Lot Number</div>
        <template v-if="editing">
          <UInput v-model="local.lotNumber" placeholder="e.g. LOT-2026-001" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.lotNumber || 'N/A' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Labeled ABV</div>
        <template v-if="editing">
          <UInput v-model.number="local.labeledAbv" type="number" step="0.1" placeholder="40" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.labeledAbv ? `${stage.labeledAbv}%` : 'N/A' }}</div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Bottling notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Bottled</UButton>
    </div>
  </div>
</template>
