<script setup lang="ts">
import type { Batch, Recipe } from '~/types'
import { STAGE_DISPLAY, stageTextColor, stageBgColor, hasStageVolumes, getActiveStages } from '~/composables/batchPipeline'

const props = defineProps<{
  batch: Batch
  recipe?: Recipe
}>()

const batchStore = useBatchStore()
const toast = useToast()

const stageDisplay = computed(() => {
  const d = STAGE_DISPLAY[props.batch.currentStage]
  return d || { icon: 'i-lucide-circle', color: 'neutral' }
})

const statusBadge = computed(() => {
  switch (props.batch.status) {
    case 'active': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
})

const batchCostDisplay = computed(() => {
  if (props.batch.batchCost) return Dollar.format(props.batch.batchCost)
  return Dollar.format(0)
})

const recipeCostDisplay = computed(() => {
  if (props.batch.recipeCost) return Dollar.format(props.batch.recipeCost)
  if (props.recipe) return Dollar.format(recipePrice(props.recipe))
  return Dollar.format(0)
})

const barrelCostDisplay = computed(() => {
  if (props.batch.barrelCost != null) return Dollar.format(props.batch.barrelCost)
  return null
})

const totalBatchCost = computed(() => {
  return (props.batch.batchCost || 0) + (props.batch.barrelCost || 0)
})

// Inline barrel cost editing
const editingBarrelCost = ref(false)
const localBarrelCost = ref<number | undefined>(undefined)
const savingBarrelCost = ref(false)

const startEditBarrelCost = () => {
  localBarrelCost.value = props.batch.barrelCost
  editingBarrelCost.value = true
}

const cancelEditBarrelCost = () => {
  editingBarrelCost.value = false
}

const saveBarrelCost = async () => {
  savingBarrelCost.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (target) {
      target.barrelCost = localBarrelCost.value
      batchStore.setBatch(target._id)
      batchStore.batch.barrelCost = localBarrelCost.value
      await batchStore.updateBatch()
      toast.add({ title: 'Barrel cost updated', color: 'success', icon: 'i-lucide-check-circle' })
    }
    editingBarrelCost.value = false
  } catch {
    toast.add({ title: 'Failed to update barrel cost', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    savingBarrelCost.value = false
  }
}

// Volume distribution for split batches
const isSplit = computed(() => {
  if (!hasStageVolumes(props.batch)) return false
  const active = getActiveStages(props.batch)
  return active.length > 1
})

const volumeDistribution = computed(() => {
  if (!props.batch.stageVolumes) return []
  return Object.entries(props.batch.stageVolumes)
    .filter(([, vol]) => vol > 0)
    .map(([stage, vol]) => {
      const display = STAGE_DISPLAY[stage] || { icon: 'i-lucide-circle', color: 'neutral' }
      return { stage, volume: vol, ...display }
    })
})

const volumeUnit = computed(() => {
  return (props.batch.batchSizeUnit || 'gallon').replace(/gallon/i, 'gal').replace(/liter/i, 'L')
})
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-bold font-[Cormorant_Garamond]">
          <NuxtLink
            v-if="recipe?._id"
            :to="`/admin/recipes/${recipe._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ recipe.name }}
          </NuxtLink>
          <span v-else class="text-parchment">Unknown Recipe</span>
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <span v-if="recipe?.class" class="text-sm text-parchment/60">{{ recipe.class }}</span>
          <span v-if="recipe?.class && recipe?.type" class="text-parchment/50">-</span>
          <span v-if="recipe?.type" class="text-sm text-parchment/60">{{ recipe.type }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span :class="['px-3 py-1 rounded-full text-xs font-semibold border', statusBadge]">
          {{ batch.status }}
        </span>
        <!-- Single stage badge for non-split batches -->
        <span
          v-if="!isSplit"
          class="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1"
          :class="stageBgColor(stageDisplay.color)"
        >
          <UIcon :name="stageDisplay.icon" :class="stageTextColor(stageDisplay.color)" class="text-sm" />
          {{ batch.currentStage }}
        </span>
      </div>
    </div>

    <!-- Volume distribution for split batches -->
    <div v-if="isSplit" class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="entry in volumeDistribution"
        :key="entry.stage"
        class="px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5"
        :class="stageBgColor(entry.color)"
      >
        <UIcon :name="entry.icon" :class="stageTextColor(entry.color)" class="text-xs" />
        {{ entry.stage }}: {{ entry.volume }} {{ volumeUnit }}
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-brown/20">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch Size</div>
        <div class="text-sm text-parchment font-medium">
          {{ batch.batchSize }} {{ batch.batchSizeUnit }}
        </div>
      </div>
      <div v-if="batch.batchNumber">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch #</div>
        <div class="text-sm text-parchment font-medium">{{ batch.batchNumber }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Recipe Cost</div>
        <div class="text-sm text-parchment font-medium">{{ recipeCostDisplay }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Ingredient Cost</div>
        <div class="text-sm text-parchment font-medium">{{ batchCostDisplay }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 flex items-center gap-1">
          Barrel Cost
          <UButton
            v-if="!editingBarrelCost"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-pencil"
            class="h-4 w-4"
            :ui="{ leadingIcon: 'size-3' }"
            @click="startEditBarrelCost"
          />
        </div>
        <template v-if="editingBarrelCost">
          <div class="flex items-center gap-1">
            <UInput
              v-model.number="localBarrelCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              size="xs"
              class="w-24"
            />
            <UButton
              size="xs"
              :loading="savingBarrelCost"
              icon="i-lucide-check"
              @click="saveBarrelCost"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-x"
              @click="cancelEditBarrelCost"
            />
          </div>
        </template>
        <div v-else class="text-sm text-parchment font-medium">
          {{ barrelCostDisplay || '--' }}
        </div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total Cost</div>
        <div class="text-sm text-gold font-semibold">{{ Dollar.format(totalBatchCost) }}</div>
      </div>
    </div>
  </div>
</template>
