<script setup lang="ts">
import type { Batch, BarrelAgingStage } from '~/types'
import type { Vessel } from '~/types/interfaces/Vessel'
import { calculateProofGallons } from '~/utils/proofGallons'
import { convertUnitRatio } from '~/utils/conversions'
import { Dollar } from '~/utils/formatting'
import { getNextStage } from '~/composables/batchPipeline'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const toast = useToast()

const stage = computed(() => props.batch.stages?.barrelAging as BarrelAgingStage | undefined)

// All barrels currently holding contents from this batch
const batchBarrels = computed(() => {
  if (!props.batch._id) return []
  return vesselStore.vessels.filter(v =>
    v.type === 'Barrel' && v.contents?.some(c => c.batch === props.batch._id)
  )
})

// Per-barrel content for this batch
const getBarrelContent = (barrel: Vessel) => {
  return barrel.contents?.find(c => c.batch === props.batch._id)
}

// Days aged from entry date
const daysAged = computed(() => {
  const entryDate = stage.value?.entry?.date
  if (!entryDate) return null
  return Math.floor((Date.now() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24))
})

const monthsAged = computed(() => {
  if (daysAged.value === null) return null
  return parseFloat((daysAged.value / 30.44).toFixed(1))
})

const getBarrelAgingProgress = (barrel: Vessel) => {
  const target = barrel.targetAge || stage.value?.targetAge
  if (!target || monthsAged.value === null) return null
  const pct = Math.min(100, (monthsAged.value / target) * 100)
  return { percent: Math.round(pct), months: monthsAged.value, target }
}

const getAgingProgressColor = (progress: { percent: number } | null) => {
  if (!progress) return 'bg-amber-500/60'
  if (progress.percent >= 100) return 'bg-green-500/60'
  if (progress.percent >= 75) return 'bg-amber-500/60'
  return 'bg-blue-500/60'
}

// Cost helpers — fill cost comes from recipeCost split into contents.value
const getBarrelFillCost = (barrel: Vessel) => {
  return getBarrelContent(barrel)?.value || 0
}

const getBarrelCost = (barrel: Vessel) => {
  return barrel.barrel?.cost || 0
}

const getBarrelTotalCost = (barrel: Vessel) => {
  return getBarrelFillCost(barrel) + getBarrelCost(barrel)
}

// Totals across all barrels
const totalVolume = computed(() => {
  return batchBarrels.value.reduce((sum, b) => {
    const content = getBarrelContent(b)
    return sum + (content?.volume || 0)
  }, 0)
})

const totalProofGallons = computed(() => {
  return batchBarrels.value.reduce((sum, b) => {
    const content = getBarrelContent(b)
    if (!content?.volume || !content?.abv) return sum
    return sum + calculateProofGallons(content.volume, content.volumeUnit || 'gallon', content.abv)
  }, 0)
})

const totalCost = computed(() => {
  return batchBarrels.value.reduce((sum, b) => sum + getBarrelTotalCost(b), 0)
})

// Collapse state per barrel
const collapsedBarrels = ref<Set<string>>(new Set())

const toggleBarrel = (barrelId: string) => {
  if (collapsedBarrels.value.has(barrelId)) {
    collapsedBarrels.value.delete(barrelId)
  } else {
    collapsedBarrels.value.add(barrelId)
  }
}

const isCollapsed = (barrelId: string) => collapsedBarrels.value.has(barrelId)

const shortUnit = (unit: string) => unit.replace(/gallon/i, 'gal').replace(/liter/i, 'L')

// --- Multi-barrel selection & advancement ---
const selectedBarrelIds = ref<Set<string>>(new Set())

const toggleSelect = (barrelId: string) => {
  if (selectedBarrelIds.value.has(barrelId)) {
    selectedBarrelIds.value.delete(barrelId)
  } else {
    selectedBarrelIds.value.add(barrelId)
  }
}

const isSelected = (barrelId: string) => selectedBarrelIds.value.has(barrelId)

const selectAll = () => {
  batchBarrels.value.forEach(b => selectedBarrelIds.value.add(b._id))
}

const deselectAll = () => {
  selectedBarrelIds.value.clear()
}

const selectedBarrels = computed(() =>
  batchBarrels.value.filter(b => selectedBarrelIds.value.has(b._id))
)

const selectedVolume = computed(() => {
  return selectedBarrels.value.reduce((sum, b) => {
    const content = getBarrelContent(b)
    return sum + (content?.volume || 0)
  }, 0)
})

const selectedCost = computed(() => {
  return selectedBarrels.value.reduce((sum, b) => sum + getBarrelTotalCost(b), 0)
})

// Next stage after Barrel Aging
const nextStageAfterBarrelAging = computed(() =>
  getNextStage(props.batch.pipeline, 'Barrel Aging')
)

// Destination vessel options (tanks for post-barrel stages)
const destinationVesselId = ref('')
const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

// Check if next stage needs a vessel
const nextStageNeedsVessel = computed(() => {
  const next = nextStageAfterBarrelAging.value
  if (!next || next === 'Bottled') return false
  return true
})

// --- Per-barrel exit & send modal ---
const showExitModal = ref(false)
const exitBarrelId = ref('')
const exitForm = ref({
  volume: 0,
  volumeUnit: 'gallon',
  abv: 0,
})

const exitBarrel = computed(() =>
  exitBarrelId.value ? vesselStore.getVesselById(exitBarrelId.value) : null
)

const exitBarrelContent = computed(() => {
  if (!exitBarrel.value) return null
  return getBarrelContent(exitBarrel.value)
})

const exitProofGallons = computed(() => {
  if (!exitForm.value.volume || !exitForm.value.abv) return 0
  return calculateProofGallons(exitForm.value.volume, exitForm.value.volumeUnit, exitForm.value.abv)
})

const openExitModal = (barrel: Vessel) => {
  exitBarrelId.value = barrel._id
  const content = getBarrelContent(barrel)
  // Pre-fill with current barrel contents as starting point
  exitForm.value = {
    volume: content?.volume || 0,
    volumeUnit: content?.volumeUnit || 'gallon',
    abv: content?.abv || 0,
  }
  destinationVesselId.value = ''
  showExitModal.value = true
}

// --- Shared advancement logic ---
const advancing = ref(false)

const sendBarrelsToNextStage = async (barrelIds: string[], exitData?: { volume: number; volumeUnit: string; abv: number }) => {
  const target = nextStageAfterBarrelAging.value
  if (!target) return

  advancing.value = true
  try {
    const batchUnit = props.batch.batchSizeUnit || 'gallon'
    let totalTransferVolume = 0
    let totalTransferValue = 0
    let weightedAbvSum = 0
    const barrelNames: string[] = []

    for (const barrelId of barrelIds) {
      const barrel = vesselStore.getVesselById(barrelId)
      if (!barrel) continue

      const content = getBarrelContent(barrel)
      if (!content) continue

      // Use exit data if provided (single barrel), otherwise use current contents
      const useExitData = exitData && barrelIds.length === 1
      const exitVol = useExitData ? exitData.volume : content.volume
      const exitVolUnit = useExitData ? exitData.volumeUnit : content.volumeUnit
      const exitAbv = useExitData ? exitData.abv : content.abv
      const volInBatchUnit = exitVol * convertUnitRatio(exitVolUnit, batchUnit)
      totalTransferVolume += volInBatchUnit
      totalTransferValue += content.value + (barrel.barrel?.cost || 0)
      weightedAbvSum += exitAbv * volInBatchUnit

      barrelNames.push(barrel.name)

      // Remove this batch's contents from the barrel
      barrel.contents = (barrel.contents || []).filter(c => c.batch !== props.batch._id)

      // Mark barrel as used
      barrel.isUsed = true
      const recipeStore = useRecipeStore()
      const recipe = recipeStore.getRecipeById(props.batch.recipe)
      if (recipe) {
        barrel.previousContents = recipe.type || recipe.name
      }

      vesselStore.vessel = barrel
      await vesselStore.updateVessel()
    }

    // Add contents to destination vessel (tank) if one was selected
    const destVessel = destinationVesselId.value
    if (destVessel) {
      const avgAbv = totalTransferVolume > 0 ? weightedAbvSum / totalTransferVolume : 0
      await vesselStore.addContents(destVessel, {
        batch: props.batch._id,
        volume: totalTransferVolume,
        volumeUnit: batchUnit,
        abv: avgAbv,
        value: totalTransferValue,
      })
    }

    // Advance batch stage: deduct from Barrel Aging, add to target
    await batchStore.advanceToStage(
      props.batch._id,
      target,
      { vessel: destVessel || undefined },
      totalTransferVolume,
      'Barrel Aging',
      totalTransferVolume,
    )

    // If single barrel with exit data, record exit info on barrel aging stage
    if (exitData && barrelIds.length === 1) {
      await batchStore.updateStageData(props.batch._id, 'Barrel Aging', {
        exit: {
          date: new Date(),
          volume: exitData.volume,
          volumeUnit: exitData.volumeUnit,
          abv: exitData.abv,
          proofGallons: calculateProofGallons(exitData.volume, exitData.volumeUnit, exitData.abv),
        },
      }, `Emptied barrel ${barrelNames[0]}: ${exitData.volume} ${shortUnit(exitData.volumeUnit)} @ ${exitData.abv}% ABV → ${target}`)
    } else {
      await batchStore.updateStageData(
        props.batch._id,
        target,
        {},
        `Transferred from ${barrelIds.length} barrel${barrelIds.length > 1 ? 's' : ''}: ${barrelNames.join(', ')}`,
      )
    }

    toast.add({
      title: `Sent ${barrelIds.length} barrel${barrelIds.length > 1 ? 's' : ''} to ${target}`,
      description: `${totalTransferVolume.toFixed(1)} ${batchUnit}`,
      color: 'success',
      icon: 'i-lucide-arrow-right',
    })

    selectedBarrelIds.value.clear()
    showExitModal.value = false
    showAdvanceConfirm.value = false
  } catch (error: unknown) {
    toast.add({
      title: 'Failed to advance barrels',
      description: String(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    advancing.value = false
  }
}

// Multi-barrel confirmation modal
const showAdvanceConfirm = ref(false)

const initiateMultiAdvance = () => {
  if (selectedBarrelIds.value.size === 0) return
  destinationVesselId.value = ''
  showAdvanceConfirm.value = true
}

// Legacy editing state (stage-level data)
const charLevelOptions = ['#1', '#2', '#3', '#4', 'Alligator']

const local = ref({
  vessel: stage.value?.vessel || '',
  barrelType: stage.value?.barrelType || '',
  barrelSize: stage.value?.barrelSize || '',
  charLevel: stage.value?.charLevel || '',
  previousUse: stage.value?.previousUse || '',
  warehouseLocation: stage.value?.warehouseLocation || '',
  entry: {
    date: stage.value?.entry?.date ? new Date(stage.value.entry.date) : new Date(),
    volume: stage.value?.entry?.volume,
    volumeUnit: stage.value?.entry?.volumeUnit || 'gallon',
    abv: stage.value?.entry?.abv,
    proofGallons: stage.value?.entry?.proofGallons,
  },
  exit: {
    date: stage.value?.exit?.date ? new Date(stage.value.exit.date) : undefined as Date | undefined,
    volume: stage.value?.exit?.volume,
    volumeUnit: stage.value?.exit?.volumeUnit || 'gallon',
    abv: stage.value?.exit?.abv,
    proofGallons: stage.value?.exit?.proofGallons,
  },
  targetAge: stage.value?.targetAge,
  notes: stage.value?.notes || '',
  barrelCost: props.batch.barrelCost,
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (target) target.barrelCost = local.value.barrelCost

    await batchStore.updateStageData(props.batch._id, 'Barrel Aging', {
      vessel: local.value.vessel || undefined,
      barrelType: local.value.barrelType,
      barrelSize: local.value.barrelSize,
      charLevel: local.value.charLevel || undefined,
      previousUse: local.value.previousUse,
      warehouseLocation: local.value.warehouseLocation,
      entry: {
        date: local.value.entry.date,
        volume: local.value.entry.volume,
        volumeUnit: local.value.entry.volumeUnit,
        abv: local.value.entry.abv,
        proofGallons: local.value.entry.proofGallons,
      },
      exit: {
        date: local.value.exit.date,
        volume: local.value.exit.volume,
        volumeUnit: local.value.exit.volumeUnit,
        abv: local.value.exit.abv,
        proofGallons: local.value.exit.proofGallons,
      },
      targetAge: local.value.targetAge,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-amber/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-cylinder" class="text-lg text-amber" />
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Barrel Aging</h3>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span v-if="batchBarrels.length > 1" class="text-parchment/60">
          {{ batchBarrels.length }} barrels
        </span>
        <span v-if="totalVolume > 0" class="text-parchment/60">
          {{ totalVolume.toFixed(1) }} gal
        </span>
        <span v-if="totalProofGallons > 0" class="text-amber-400 font-semibold">
          {{ totalProofGallons.toFixed(2) }} PG
        </span>
        <span v-if="totalCost > 0" class="text-green-400 font-semibold">
          {{ Dollar.format(totalCost) }}
        </span>
      </div>
    </div>

    <!-- Multi-select toolbar -->
    <div
      v-if="batchBarrels.length > 1 && nextStageAfterBarrelAging && batch.status === 'active'"
      class="flex items-center justify-between mb-3 px-2 py-2 rounded-lg bg-brown/5 border border-brown/15"
    >
      <div class="flex items-center gap-2">
        <UButton
          v-if="selectedBarrelIds.size < batchBarrels.length"
          size="xs" variant="ghost" color="neutral"
          @click="selectAll"
        >
          Select All
        </UButton>
        <UButton
          v-else
          size="xs" variant="ghost" color="neutral"
          @click="deselectAll"
        >
          Deselect All
        </UButton>
        <span v-if="selectedBarrelIds.size > 0" class="text-xs text-parchment/50">
          {{ selectedBarrelIds.size }} selected
          <template v-if="selectedVolume > 0">
            &middot; {{ selectedVolume.toFixed(1) }} gal
          </template>
          <template v-if="selectedCost > 0">
            &middot; {{ Dollar.format(selectedCost) }}
          </template>
        </span>
      </div>
      <UButton
        v-if="selectedBarrelIds.size > 0"
        icon="i-lucide-arrow-right"
        size="sm"
        color="primary"
        :loading="advancing"
        @click="initiateMultiAdvance"
      >
        Send {{ selectedBarrelIds.size }} to {{ nextStageAfterBarrelAging }}
      </UButton>
    </div>

    <!-- Per-barrel collapsible sections -->
    <div v-if="batchBarrels.length > 0" class="space-y-2 mb-5">
      <div
        v-for="barrel in batchBarrels"
        :key="barrel._id"
        class="bg-brown/5 rounded-lg border overflow-hidden transition-colors"
        :class="isSelected(barrel._id) ? 'border-amber/40 bg-amber/5' : 'border-brown/20'"
      >
        <!-- Barrel header -->
        <div
          class="flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-brown/10"
          @click="toggleBarrel(barrel._id)"
        >
          <!-- Selection checkbox (multi-barrel only) -->
          <input
            v-if="batchBarrels.length > 1 && nextStageAfterBarrelAging && batch.status === 'active'"
            type="checkbox"
            :checked="isSelected(barrel._id)"
            class="rounded border-brown/30 bg-charcoal text-amber-500 focus:ring-amber-500/50 shrink-0"
            @click.stop="toggleSelect(barrel._id)"
          />

          <UIcon
            :name="isCollapsed(barrel._id) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
            class="text-parchment/60 shrink-0 transition-transform duration-200"
          />
          <UIcon name="i-lucide-cylinder" class="text-amber/70 shrink-0" />
          <span class="text-sm font-bold text-parchment font-[Cormorant_Garamond]">
            {{ barrel.name }}
          </span>
          <UBadge v-if="barrel.barrel?.size" variant="subtle" color="neutral" size="xs">
            {{ barrel.barrel.size }}
          </UBadge>

          <!-- Collapsed summary -->
          <template v-if="isCollapsed(barrel._id)">
            <span v-if="getBarrelContent(barrel)" class="text-xs text-parchment/50 hidden sm:inline">
              {{ getBarrelContent(barrel)!.volume.toFixed(1) }} {{ shortUnit(getBarrelContent(barrel)!.volumeUnit || 'gallon') }}
              @ {{ getBarrelContent(barrel)!.abv.toFixed(1) }}% ABV
            </span>
            <span class="ml-auto" />
            <span v-if="getBarrelTotalCost(barrel) > 0" class="text-xs text-green-400 font-semibold shrink-0 hidden sm:inline">
              {{ Dollar.format(getBarrelTotalCost(barrel)) }}
            </span>
            <span v-if="daysAged !== null" class="text-xs text-amber-400 font-semibold shrink-0">
              {{ daysAged }}d
            </span>
          </template>
          <template v-else>
            <span class="ml-auto" />
            <span v-if="daysAged !== null" class="text-xs text-amber-400 font-semibold">
              {{ daysAged }} days
            </span>
          </template>
        </div>

        <!-- Expanded content -->
        <div
          class="grid transition-[grid-template-rows] duration-200 ease-in-out"
          :class="isCollapsed(barrel._id) ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
        >
          <div class="overflow-hidden">
            <div class="px-4 pb-4 space-y-4">
              <!-- Barrel details -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Size</div>
                  <div class="text-sm text-parchment">{{ barrel.barrel?.size || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Char Level</div>
                  <div class="text-sm text-parchment">{{ barrel.barrel?.char || stage?.charLevel || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Previous Use</div>
                  <div class="text-sm text-parchment">{{ barrel.previousContents || stage?.previousUse || 'None' }}</div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Location</div>
                  <div class="text-sm text-parchment">{{ barrel.location || stage?.warehouseLocation || 'N/A' }}</div>
                </div>
              </div>

              <!-- Contents -->
              <div v-if="getBarrelContent(barrel)" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Volume</div>
                  <div class="text-sm text-parchment">
                    {{ getBarrelContent(barrel)!.volume.toFixed(1) }} {{ shortUnit(getBarrelContent(barrel)!.volumeUnit || 'gallon') }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div>
                  <div class="text-sm text-parchment">{{ getBarrelContent(barrel)!.abv.toFixed(1) }}%</div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Proof Gallons</div>
                  <div class="text-sm text-amber-400 font-semibold">
                    {{ calculateProofGallons(getBarrelContent(barrel)!.volume, getBarrelContent(barrel)!.volumeUnit || 'gallon', getBarrelContent(barrel)!.abv).toFixed(2) }} PG
                  </div>
                </div>
                <div v-if="barrel.stats?.volume">
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill Level</div>
                  <div class="text-sm text-parchment">
                    {{ ((getBarrelContent(barrel)!.volume / barrel.stats.volume) * 100).toFixed(0) }}%
                  </div>
                </div>
              </div>

              <!-- Cost breakdown -->
              <div class="grid grid-cols-3 gap-3 p-3 rounded-lg bg-brown/5 border border-brown/10">
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill Cost</div>
                  <div class="text-sm text-parchment">
                    {{ getBarrelFillCost(barrel) > 0 ? Dollar.format(getBarrelFillCost(barrel)) : 'N/A' }}
                  </div>
                  <div class="text-[10px] text-parchment/60">Recipe ingredient cost</div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel Cost</div>
                  <div class="text-sm text-parchment">
                    {{ getBarrelCost(barrel) > 0 ? Dollar.format(getBarrelCost(barrel)) : 'N/A' }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div>
                  <div class="text-sm text-green-400 font-semibold">
                    {{ getBarrelTotalCost(barrel) > 0 ? Dollar.format(getBarrelTotalCost(barrel)) : 'N/A' }}
                  </div>
                </div>
              </div>

              <!-- Aging Progress -->
              <div v-if="getBarrelAgingProgress(barrel)">
                <div class="flex items-center justify-between mb-1">
                  <div class="text-xs text-parchment/60 uppercase tracking-wider">Aging Progress</div>
                  <span
                    class="text-xs font-semibold"
                    :class="getBarrelAgingProgress(barrel)!.percent >= 100 ? 'text-green-400' : 'text-amber-400'"
                  >
                    {{ getBarrelAgingProgress(barrel)!.months }} / {{ getBarrelAgingProgress(barrel)!.target }} months
                    — {{ getBarrelAgingProgress(barrel)!.percent }}%
                  </span>
                </div>
                <div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="getAgingProgressColor(getBarrelAgingProgress(barrel))"
                    :style="{ width: `${getBarrelAgingProgress(barrel)!.percent}%` }"
                  />
                </div>
                <div v-if="getBarrelAgingProgress(barrel)!.percent >= 100" class="mt-1 text-xs text-green-400 font-medium">
                  Target age reached
                </div>
              </div>

              <!-- Per-barrel actions -->
              <div class="flex items-center justify-between">
                <NuxtLink
                  :to="`/admin/vessels/${barrel._id}`"
                  class="text-xs text-gold hover:text-copper transition-colors"
                >
                  View Barrel Details &rarr;
                </NuxtLink>
                <UButton
                  v-if="nextStageAfterBarrelAging && batch.status === 'active'"
                  icon="i-lucide-arrow-right"
                  size="xs"
                  variant="outline"
                  color="primary"
                  @click.stop="openExitModal(barrel)"
                >
                  Send to {{ nextStageAfterBarrelAging }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback: no barrels found -->
    <div v-else-if="stage?.vessel" class="mb-5">
      <div class="text-sm text-parchment/60 mb-2">
        Barrel: {{ vesselStore.getVesselById(stage.vessel)?.name || 'Unknown' }}
      </div>
    </div>

    <div v-else class="mb-5 text-sm text-parchment/60 italic">No barrels assigned</div>

    <!-- Entry / Exit -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <BatchBarrelEntryExit
        :batch="batch"
        :editing="editing"
        type="entry"
        :local-entry-exit="local.entry"
      />
      <BatchBarrelEntryExit
        :batch="batch"
        :editing="editing"
        type="exit"
        :local-entry-exit="local.exit"
      />
    </div>

    <!-- Sampling Records -->
    <BatchBarrelSampling :batch="batch" :editing="editing" />

    <!-- Tasting Notes -->
    <BatchBarrelTastingNotes :batch="batch" />

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Barrel aging notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Barrel Aging</UButton>
    </div>

    <!-- Single barrel exit modal -->
    <UModal v-model:open="showExitModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
            <UIcon name="i-lucide-cylinder" class="text-amber inline mr-1" />
            {{ exitBarrel?.name }} &rarr; {{ nextStageAfterBarrelAging }}
          </h3>

          <!-- Current barrel contents (read-only) -->
          <div v-if="exitBarrelContent" class="rounded-lg border border-brown/20 bg-brown/5 p-3 mb-4">
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Current Contents</div>
            <div class="flex flex-wrap gap-4 text-sm text-parchment">
              <span>{{ exitBarrelContent.volume.toFixed(1) }} {{ shortUnit(exitBarrelContent.volumeUnit || 'gallon') }}</span>
              <span>{{ exitBarrelContent.abv.toFixed(1) }}% ABV</span>
              <span class="text-amber-400 font-semibold">
                {{ calculateProofGallons(exitBarrelContent.volume, exitBarrelContent.volumeUnit || 'gallon', exitBarrelContent.abv).toFixed(2) }} PG
              </span>
            </div>
          </div>

          <!-- Exit measurements -->
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Exit Measurements</div>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <UFormField label="Exit Volume">
              <UInput
                v-model.number="exitForm.volume"
                type="number"
                :min="0"
                step="0.1"
                placeholder="0"
              />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="exitForm.volumeUnit" :items="['gallon', 'L']" />
            </UFormField>
            <UFormField label="Exit ABV %">
              <UInput
                v-model.number="exitForm.abv"
                type="number"
                :min="0"
                :max="100"
                step="0.1"
                placeholder="0"
              />
            </UFormField>
          </div>

          <!-- Destination vessel -->
          <div v-if="nextStageNeedsVessel" class="mb-4">
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Destination Vessel</div>
            <USelect
              v-model="destinationVesselId"
              :items="tankOptions"
              value-key="value"
              label-key="label"
              placeholder="Select destination tank..."
            />
          </div>

          <!-- Calculated exit info -->
          <div v-if="exitForm.volume > 0 && exitForm.abv > 0" class="rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-xs text-parchment/50 uppercase">Proof Gallons</div>
                <div class="text-sm text-amber-400 font-semibold">{{ exitProofGallons.toFixed(2) }} PG</div>
              </div>
              <div v-if="exitBarrelContent">
                <div class="text-xs text-parchment/50 uppercase">Angel's Share</div>
                <div class="text-sm text-parchment">
                  {{ ((1 - exitForm.volume / exitBarrelContent.volume) * 100).toFixed(1) }}%
                </div>
              </div>
              <div v-if="exitBarrel">
                <div class="text-xs text-parchment/50 uppercase">Total Cost</div>
                <div class="text-sm text-green-400 font-semibold">{{ Dollar.format(getBarrelTotalCost(exitBarrel)) }}</div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="showExitModal = false">Cancel</UButton>
            <UButton
              :disabled="exitForm.volume <= 0 || exitForm.abv <= 0 || (nextStageNeedsVessel && !destinationVesselId)"
              :loading="advancing"
              @click="sendBarrelsToNextStage([exitBarrelId], exitForm)"
            >
              Send to {{ nextStageAfterBarrelAging }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Multi-barrel advance confirmation modal -->
    <UModal v-model:open="showAdvanceConfirm">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
            Send {{ selectedBarrels.length }} Barrel{{ selectedBarrels.length > 1 ? 's' : '' }} to {{ nextStageAfterBarrelAging }}
          </h3>

          <div class="space-y-2 mb-4">
            <div
              v-for="barrel in selectedBarrels"
              :key="barrel._id"
              class="flex items-center justify-between text-sm p-2 rounded bg-brown/5 border border-brown/10"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-cylinder" class="text-amber/70" />
                <span class="text-parchment">{{ barrel.name }}</span>
                <UBadge v-if="barrel.barrel?.size" variant="subtle" color="neutral" size="xs">{{ barrel.barrel.size }}</UBadge>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span v-if="getBarrelContent(barrel)" class="text-parchment/50">
                  {{ getBarrelContent(barrel)!.volume.toFixed(1) }} {{ shortUnit(getBarrelContent(barrel)!.volumeUnit || 'gallon') }}
                </span>
                <span class="text-green-400 font-semibold">{{ Dollar.format(getBarrelTotalCost(barrel)) }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-lg bg-brown/10 border border-brown/20 p-3 mb-4">
            <div class="grid grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-xs text-parchment/50 uppercase">Total Volume</div>
                <div class="text-sm text-parchment font-semibold">{{ selectedVolume.toFixed(1) }} gal</div>
              </div>
              <div>
                <div class="text-xs text-parchment/50 uppercase">Total Cost</div>
                <div class="text-sm text-green-400 font-semibold">{{ Dollar.format(selectedCost) }}</div>
              </div>
              <div>
                <div class="text-xs text-parchment/50 uppercase">Remaining</div>
                <div class="text-sm text-parchment/60">
                  {{ batchBarrels.length - selectedBarrels.length }} barrel{{ batchBarrels.length - selectedBarrels.length !== 1 ? 's' : '' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Destination vessel -->
          <div v-if="nextStageNeedsVessel" class="mb-4">
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Destination Vessel</div>
            <USelect
              v-model="destinationVesselId"
              :items="tankOptions"
              value-key="value"
              label-key="label"
              placeholder="Select destination tank..."
            />
          </div>

          <div v-if="batchBarrels.length > selectedBarrels.length" class="flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 mb-4">
            <UIcon name="i-lucide-info" class="text-amber shrink-0" />
            <span class="text-xs text-parchment/70">
              {{ batchBarrels.length - selectedBarrels.length }} barrel{{ batchBarrels.length - selectedBarrels.length !== 1 ? 's' : '' }} will remain aging.
              The batch will stay active in both Barrel Aging and {{ nextStageAfterBarrelAging }}.
            </span>
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="showAdvanceConfirm = false">Cancel</UButton>
            <UButton
              :loading="advancing"
              :disabled="nextStageNeedsVessel && !destinationVesselId"
              @click="sendBarrelsToNextStage([...selectedBarrelIds])"
            >
              Send to {{ nextStageAfterBarrelAging }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
