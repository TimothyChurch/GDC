<script setup lang="ts">
import { STAGE_KEY_MAP, hasReachedStage as _hasReached, isCurrentStage as _isCurrent } from '~/composables/batchPipeline'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const vesselStore = useVesselStore()

const batch = computed(() => batchStore.getBatchById(route.params._id as string))
const recipe = computed(() => batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : undefined)

const itemStore = useItemStore()
const { convertQuantity, ingredientCost } = useUnitConversion()

const containingVessels = computed(() => {
  if (!batch.value?._id) return []
  return vesselStore.vessels.filter(v =>
    v.contents?.some(c => c.batch === batch.value!._id)
  )
})

// Scale recipe ingredients to batch size
const scaleFactor = computed(() => {
  if (!batch.value || !recipe.value || !recipe.value.volume) return 1
  const batchInRecipeUnits = convertQuantity(batch.value.batchSize, batch.value.batchSizeUnit, recipe.value.volumeUnit)
  return batchInRecipeUnits / recipe.value.volume
})

const scaledIngredients = computed(() => {
  if (!recipe.value?.items) return []
  return recipe.value.items.map((ing) => {
    const item = itemStore.getItemById(ing._id)
    const pricePerUnit = latestPrice(ing._id)
    const scaledAmount = ing.amount * scaleFactor.value
    const cost = ingredientCost(pricePerUnit, scaledAmount, ing.unit, item?.inventoryUnit || ing.unit)
    return {
      id: ing._id,
      name: item?.name || 'Unknown',
      amount: scaledAmount,
      unit: ing.unit,
      cost,
    }
  })
})

const scaledTotalCost = computed(() =>
  scaledIngredients.value.reduce((sum, ing) => sum + ing.cost, 0)
)

// Panel slide-over for editing
import { PanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelBatch)

const editBatch = () => {
  if (!batch.value) return
  batchStore.batch = batch.value
  panel.open()
}

// Stage helpers using batch pipeline
const hasReached = (stageName: string) => {
  if (!batch.value) return false
  if (batch.value.currentStage === 'Upcoming') return false
  return _hasReached(batch.value.pipeline, batch.value.currentStage, stageName)
}

const isCurrent = (stageName: string) => {
  if (!batch.value) return false
  return _isCurrent(batch.value.currentStage, stageName)
}

// Dynamic component map
const STAGE_COMPONENTS: Record<string, string> = {
  'Mashing': 'BatchMashing',
  'Fermenting': 'BatchFermenting',
  'Distilling': 'BatchDistilling',
  'Maceration': 'BatchMaceration',
  'Filtering': 'BatchFiltering',
  'Barrel Aging': 'BatchBarrelAging',
  'Storage': 'BatchStorage',
  'Blending': 'BatchBlending',
  'Proofing': 'BatchProofing',
  'Bottled': 'BatchBottled',
}

</script>

<template>
  <div v-if="batch" class="space-y-6">
    <AdminPageHeader
      :title="recipe?.name || 'Batch'"
      :subtitle="`${batch.batchSize} ${batch.batchSizeUnit} batch`"
      icon="i-lucide-flask-conical"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/batch')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editBatch"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <BatchStepper :pipeline="batch.pipeline" :current-stage="batch.currentStage" />

    <BatchHeader :batch="batch" :recipe="recipe" />

    <!-- Scaled Ingredients -->
    <div v-if="scaledIngredients.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
          Ingredients
          <span class="text-sm font-normal text-parchment/50 ml-2">
            (scaled to {{ batch.batchSize }} {{ batch.batchSizeUnit }})
          </span>
        </h3>
        <span class="text-sm font-semibold text-gold">{{ Dollar.format(scaledTotalCost) }}</span>
      </div>
      <div class="divide-y divide-brown/20">
        <div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider">
          <span>Item</span>
          <span>Amount</span>
          <span class="text-right">Cost</span>
        </div>
        <div
          v-for="ing in scaledIngredients"
          :key="ing.id"
          class="grid grid-cols-3 gap-4 py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/items/${ing.id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ ing.name }}
          </NuxtLink>
          <span class="text-parchment/60">{{ Number(ing.amount.toFixed(2)) }} {{ ing.unit }}</span>
          <span class="text-parchment text-right">{{ Dollar.format(ing.cost) }}</span>
        </div>
      </div>
    </div>

    <!-- Current Vessels -->
    <div v-if="containingVessels.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Current Vessels</h3>
      <div class="divide-y divide-brown/20">
        <div
          v-for="vessel in containingVessels"
          :key="vessel._id"
          class="flex items-center justify-between py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/vessels/${vessel._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ vessel.name }}
          </NuxtLink>
          <span class="text-parchment/50 text-xs">{{ vessel.type }}</span>
        </div>
      </div>
    </div>

    <!-- Dynamic stage components based on pipeline -->
    <template v-for="stage in batch.pipeline" :key="stage">
      <component
        v-if="hasReached(stage) && STAGE_COMPONENTS[stage]"
        :is="STAGE_COMPONENTS[stage]"
        :batch="batch"
        :editing="isCurrent(stage)"
      />
    </template>

    <!-- Advance action (only for active batches) -->
    <div v-if="batch.status === 'active'" class="flex justify-center">
      <BatchAdvanceAction :batch="batch" @advanced="() => {}" />
    </div>

    <!-- Activity Log -->
    <BatchActivityLog :batch="batch" />
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Batch not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/batch')"
    >
      Back to Batches
    </UButton>
  </div>
</template>
