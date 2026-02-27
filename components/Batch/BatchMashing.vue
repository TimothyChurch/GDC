<script setup lang="ts">
import type { Batch, MashingStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const itemStore = useItemStore()
const { convertQuantity, ingredientCost } = useUnitConversion()

// Scaled ingredients from recipe
const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : undefined)

const scaleFactor = computed(() => {
  if (!props.batch || !recipe.value?.volume) return 1
  const batchInRecipeUnits = convertQuantity(props.batch.batchSize, props.batch.batchSizeUnit, recipe.value.volumeUnit)
  return batchInRecipeUnits / recipe.value.volume
})

const scaledIngredients = computed(() => {
  if (!recipe.value?.items) return []
  return recipe.value.items.map((ing) => {
    const item = itemStore.getItemById(ing._id)
    const pricePerUnit = latestPrice(ing._id)
    const scaledAmount = ing.amount * scaleFactor.value
    const cost = ingredientCost(pricePerUnit, scaledAmount, ing.unit, item?.inventoryUnit || ing.unit)
    return { id: ing._id, name: item?.name || 'Unknown', amount: scaledAmount, unit: ing.unit, cost }
  })
})

const scaledTotalCost = computed(() =>
  scaledIngredients.value.reduce((sum, ing) => sum + ing.cost, 0)
)

const updatingCost = ref(false)
const updateBatchCost = async () => {
  if (!props.batch || !recipe.value) return
  updatingCost.value = true
  try {
    const newRecipeCost = recipePrice(recipe.value)
    batchStore.setBatch(props.batch._id)
    batchStore.batch.recipeCost = newRecipeCost
    batchStore.batch.batchCost = scaledTotalCost.value
    await batchStore.updateBatch()
  } finally {
    updatingCost.value = false
  }
}

const stage = computed(() => props.batch.stages?.mashing as MashingStage | undefined)

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const local = ref({
  vessel: stage.value?.vessel || '',
  startedAt: stage.value?.startedAt ? new Date(stage.value.startedAt) : new Date(),
  strikeWaterVolume: stage.value?.strikeWaterVolume,
  strikeWaterVolumeUnit: stage.value?.strikeWaterVolumeUnit || 'gallon',
  strikeWaterTemp: stage.value?.strikeWaterTemp,
  strikeWaterTempUnit: stage.value?.strikeWaterTempUnit || 'F',
  mashTemp: stage.value?.mashTemp,
  mashTempUnit: stage.value?.mashTempUnit || 'F',
  mashDuration: stage.value?.mashDuration,
  pH: stage.value?.pH,
  preBoilGravity: stage.value?.preBoilGravity,
  postBoilGravity: stage.value?.postBoilGravity,
  notes: stage.value?.notes || '',
})

const mashTunOptions = computed(() =>
  vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }))
)

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Mashing', {
      vessel: local.value.vessel || undefined,
      startedAt: local.value.startedAt,
      strikeWaterVolume: local.value.strikeWaterVolume,
      strikeWaterVolumeUnit: local.value.strikeWaterVolumeUnit,
      strikeWaterTemp: local.value.strikeWaterTemp,
      strikeWaterTempUnit: local.value.strikeWaterTempUnit,
      mashTemp: local.value.mashTemp,
      mashTempUnit: local.value.mashTempUnit,
      mashDuration: local.value.mashDuration,
      pH: local.value.pH,
      preBoilGravity: local.value.preBoilGravity,
      postBoilGravity: local.value.postBoilGravity,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-orange-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-flame" class="text-lg text-orange-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Mashing</h3>
    </div>

    <!-- Scaled Ingredients (grain bill) -->
    <div v-if="scaledIngredients.length > 0" class="mb-5 pb-4 border-b border-brown/20">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">
          Ingredients
          <span class="text-parchment/40 ml-1">(scaled to {{ batch.batchSize }} {{ batch.batchSizeUnit }})</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gold">{{ Dollar.format(scaledTotalCost) }}</span>
          <UButton
            v-if="scaledTotalCost !== (batch.batchCost || 0)"
            icon="i-lucide-refresh-cw"
            size="xs"
            variant="soft"
            :loading="updatingCost"
            @click="updateBatchCost"
          >
            Update Cost
          </UButton>
        </div>
      </div>
      <div class="divide-y divide-brown/10">
        <div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/50 uppercase tracking-wider">
          <span>Item</span>
          <span>Amount</span>
          <span class="text-right">Cost</span>
        </div>
        <div
          v-for="ing in scaledIngredients"
          :key="ing.id"
          class="grid grid-cols-3 gap-4 py-2 text-sm"
        >
          <NuxtLink :to="`/admin/items/${ing.id}`" class="text-gold hover:text-copper transition-colors">
            {{ ing.name }}
          </NuxtLink>
          <span class="text-parchment/60">{{ Number(ing.amount.toFixed(2)) }} {{ ing.unit }}</span>
          <span class="text-parchment text-right">{{ Dollar.format(ing.cost) }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="mashTunOptions" value-key="value" label-key="label" placeholder="Select mash tun" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <template v-if="editing">
          <SiteDatePicker v-model="local.startedAt" />
        </template>
        <div v-else class="text-sm text-parchment">{{ startDate }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Duration (min)</div>
        <template v-if="editing">
          <UInput v-model.number="local.mashDuration" type="number" placeholder="60" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.mashDuration || 'N/A' }}</div>
      </div>
    </div>

    <!-- Strike Water -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Strike Water</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.strikeWaterVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.strikeWaterVolumeUnit" :items="['gallon', 'L']" />
        </UFormField>
        <UFormField label="Temp">
          <UInput v-model.number="local.strikeWaterTemp" type="number" placeholder="165" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.strikeWaterTempUnit" :items="['F', 'C']" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="stage?.strikeWaterVolume">
          {{ stage.strikeWaterVolume }} {{ stage.strikeWaterVolumeUnit }}
          @ {{ stage.strikeWaterTemp }}&deg;{{ stage.strikeWaterTempUnit }}
        </template>
        <template v-else>Not recorded</template>
      </div>
    </div>

    <!-- Mash Temp & pH -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Mash Conditions</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="Mash Temp">
          <UInput v-model.number="local.mashTemp" type="number" placeholder="152" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.mashTempUnit" :items="['F', 'C']" />
        </UFormField>
        <UFormField label="pH">
          <UInput v-model.number="local.pH" type="number" step="0.1" placeholder="5.4" />
        </UFormField>
        <div />
      </div>
      <div v-else class="flex gap-6 text-sm text-parchment/60">
        <span v-if="stage?.mashTemp">Temp: {{ stage.mashTemp }}&deg;{{ stage.mashTempUnit }}</span>
        <span v-if="stage?.pH">pH: {{ stage.pH }}</span>
        <span v-if="!stage?.mashTemp && !stage?.pH">Not recorded</span>
      </div>
    </div>

    <!-- Gravity -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Gravity</div>
      <div v-if="editing" class="grid grid-cols-2 gap-3">
        <UFormField label="Pre-Boil Gravity">
          <UInput v-model.number="local.preBoilGravity" type="number" step="0.001" placeholder="1.050" />
        </UFormField>
        <UFormField label="Post-Boil Gravity">
          <UInput v-model.number="local.postBoilGravity" type="number" step="0.001" placeholder="1.060" />
        </UFormField>
      </div>
      <div v-else class="flex gap-6 text-sm text-parchment/60">
        <span v-if="stage?.preBoilGravity">Pre-Boil: {{ stage.preBoilGravity }}</span>
        <span v-if="stage?.postBoilGravity">Post-Boil: {{ stage.postBoilGravity }}</span>
        <span v-if="!stage?.preBoilGravity && !stage?.postBoilGravity">Not recorded</span>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Mashing notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Mashing</UButton>
    </div>
  </div>
</template>
