<script setup lang="ts">
import type { Batch, BottledStage } from '~/types'
import { LazyPanelProduction } from '#components'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const productionStore = useProductionStore()
const bottleStore = useBottleStore()
const vesselStore = useVesselStore()
const overlay = useOverlay()
const toast = useToast()

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

const totalCost = computed(() => {
  if (!production.value) return 0
  return production.value.productionCost || 0
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

/** Open the production panel to create and link a production record to this batch */
const creatingProduction = ref(false)
const createProductionRecord = async () => {
  creatingProduction.value = true
  try {
    // Gather vessel IDs that contain this batch
    const batchVesselIds = vesselStore.vessels
      .filter(v =>
        (v.type.toLowerCase() === 'barrel' || v.type.toLowerCase() === 'tank') &&
        v.contents?.some(c => c.batch === props.batch._id)
      )
      .map(v => v._id)

    // Reset the production store to a fresh new production, pre-filled with batch data
    productionStore.resetProduction()
    productionStore.production.date = new Date()
    productionStore.production.vessel = batchVesselIds

    // Open the production panel with batch linkage prefill
    const panel = overlay.create(LazyPanelProduction)
    const result = await panel.open({
      prefill: {
        batchId: props.batch._id,
        vessels: batchVesselIds,
        date: new Date(),
      },
    })

    // If a production ID was returned, the link was created successfully
    if (result && typeof result === 'string') {
      toast.add({
        title: 'Production linked',
        description: 'The bottling run has been recorded and linked to this batch.',
        color: 'success',
        icon: 'i-lucide-link',
      })
    }
  } finally {
    creatingProduction.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-green-500/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-wine" class="text-lg text-green-400" />
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Bottled</h3>
      </div>
      <!-- Create Production button when no record is linked -->
      <UButton
        v-if="!production && editing"
        icon="i-lucide-plus"
        size="sm"
        variant="soft"
        color="success"
        :loading="creatingProduction"
        @click="createProductionRecord"
      >
        Record Bottling Run
      </UButton>
    </div>

    <!-- Production Record Link -->
    <template v-if="production">
      <div class="mb-5 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs font-semibold text-parchment/60 uppercase">Linked Production Record</div>
          <NuxtLink
            :to="`/admin/production/${production._id}`"
            class="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
          >
            <span>View Details</span>
            <UIcon name="i-lucide-external-link" class="w-3 h-3" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
            <div class="text-sm text-parchment">{{ prodDate }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle</div>
            <NuxtLink
              v-if="production.bottle"
              :to="`/admin/bottles/${production.bottle}`"
              class="text-sm text-gold hover:text-copper transition-colors"
            >
              {{ bottleName }}
            </NuxtLink>
            <div v-else class="text-sm text-parchment">{{ bottleName }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Quantity</div>
            <div class="text-sm text-parchment">{{ production.quantity }} bottles</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div>
            <div class="text-sm text-parchment font-semibold">{{ Dollar.format(totalCost) }}</div>
          </div>
        </div>
        <div v-if="production.bottleCost" class="mt-2 pt-2 border-t border-green-500/10">
          <span class="text-xs text-parchment/50">Cost per bottle: </span>
          <span class="text-xs text-copper font-medium">{{ Dollar.format(production.bottleCost) }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="!editing">
      <div class="mb-5 p-4 rounded-lg border border-brown/20 bg-brown/5">
        <div class="text-center py-2">
          <UIcon name="i-lucide-wine-off" class="text-2xl text-parchment/20 mx-auto mb-2" />
          <p class="text-sm text-parchment/50 mb-3">No production record linked</p>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            variant="soft"
            color="success"
            :loading="creatingProduction"
            @click="createProductionRecord"
          >
            Record Bottling Run
          </UButton>
        </div>
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
