<script setup lang="ts">
import type { Batch, MacerationStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const itemStore = useItemStore()
const recipeStore = useRecipeStore()
const { convertQuantity, ingredientCost } = useUnitConversion()

const stage = computed(() => props.batch.stages?.maceration as MacerationStage | undefined)
const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : undefined)

// Scaled ingredients from recipe
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

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const elapsedDays = computed(() => {
  const start = stage.value?.startDate
  if (!start) return null
  const end = stage.value?.endDate || new Date()
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
})

const formatDate = (d?: Date | string) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const getBotanicalName = (botanical: { item?: string; name?: string }) => {
  if (botanical.name) return botanical.name
  if (botanical.item) return itemStore.nameById(botanical.item) || 'Unknown'
  return 'Unknown'
}

// Editing state
const local = ref({
  vessel: stage.value?.vessel || '',
  baseSpirit: {
    source: stage.value?.baseSpirit?.source || '',
    volume: stage.value?.baseSpirit?.volume,
    volumeUnit: stage.value?.baseSpirit?.volumeUnit || 'gallon',
    abv: stage.value?.baseSpirit?.abv,
  },
  method: stage.value?.method || '' as string,
  startDate: stage.value?.startDate ? new Date(stage.value.startDate) : undefined as Date | undefined,
  endDate: stage.value?.endDate ? new Date(stage.value.endDate) : undefined as Date | undefined,
  temperature: stage.value?.temperature,
  temperatureUnit: stage.value?.temperatureUnit || 'F',
  duration: stage.value?.duration ?? recipe.value?.macerationDays,
  notes: stage.value?.notes || '',
})

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

const methodOptions = ['direct', 'vapor basket', 'both']
const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']
const weightUnits = ['g', 'kg', 'oz', 'lb']

// Botanicals management
const showAddBotanical = ref(false)
const newBotanical = ref({
  item: '' as string,
  name: '',
  weight: undefined as number | undefined,
  weightUnit: 'g',
})

const addBotanical = async () => {
  const botanicals = [
    ...(stage.value?.botanicals || []),
    {
      item: newBotanical.value.item || undefined,
      name: newBotanical.value.name || (newBotanical.value.item ? itemStore.nameById(newBotanical.value.item) : ''),
      weight: newBotanical.value.weight,
      weightUnit: newBotanical.value.weightUnit,
    },
  ]
  await batchStore.updateStageData(props.batch._id, 'Maceration', { botanicals })
  showAddBotanical.value = false
  newBotanical.value = { item: '', name: '', weight: undefined, weightUnit: 'g' }
}

const removeBotanical = async (index: number) => {
  const botanicals = [...(stage.value?.botanicals || [])]
  botanicals.splice(index, 1)
  await batchStore.updateStageData(props.batch._id, 'Maceration', { botanicals })
}

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Maceration', {
      vessel: local.value.vessel || undefined,
      baseSpirit: {
        source: local.value.baseSpirit.source,
        volume: local.value.baseSpirit.volume,
        volumeUnit: local.value.baseSpirit.volumeUnit,
        abv: local.value.baseSpirit.abv,
      },
      method: local.value.method || undefined,
      startDate: local.value.startDate,
      endDate: local.value.endDate,
      temperature: local.value.temperature,
      temperatureUnit: local.value.temperatureUnit,
      duration: local.value.duration,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-emerald-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-leaf" class="text-lg text-emerald-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Maceration</h3>
    </div>

    <!-- Header info -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="tankOptions" value-key="value" label-key="label" placeholder="Select tank" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Method</div>
        <template v-if="editing">
          <USelect v-model="local.method" :items="methodOptions" placeholder="Select method" />
        </template>
        <div v-else class="text-sm text-parchment capitalize">{{ stage?.method || 'Not set' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Temperature</div>
        <template v-if="editing">
          <div class="flex gap-2">
            <UInput v-model.number="local.temperature" type="number" placeholder="68" class="flex-1" />
            <USelect v-model="local.temperatureUnit" :items="['F', 'C']" class="w-16" />
          </div>
        </template>
        <div v-else class="text-sm text-parchment">
          <template v-if="stage?.temperature">{{ stage.temperature }}&deg;{{ stage.temperatureUnit }}</template>
          <template v-else>Not set</template>
        </div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Desired Days</div>
        <template v-if="editing">
          <UInput v-model.number="local.duration" type="number" placeholder="e.g. 7" />
          <div v-if="recipe?.macerationDays && !stage?.duration" class="text-xs text-parchment/40 mt-1">
            Default from recipe: {{ recipe.macerationDays }} days
          </div>
        </template>
        <div v-else class="text-sm text-parchment">
          <template v-if="stage?.duration">{{ stage.duration }} days</template>
          <template v-else-if="recipe?.macerationDays">{{ recipe.macerationDays }} days <span class="text-parchment/40">(from recipe)</span></template>
          <template v-else>N/A</template>
        </div>
      </div>
    </div>

    <!-- Recipe Ingredients (scaled) -->
    <div v-if="scaledIngredients.length > 0" class="mb-5 pb-4 border-b border-brown/20">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">
          Ingredients
          <span class="text-parchment/40 ml-1">(scaled to {{ batch.batchSize }} {{ batch.batchSizeUnit }})</span>
        </div>
        <span class="text-sm font-semibold text-gold">{{ Dollar.format(scaledTotalCost) }}</span>
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

    <!-- Dates -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <template v-if="editing">
          <SiteDatePicker v-model="local.startDate" />
        </template>
        <div v-else class="text-sm text-parchment">{{ formatDate(stage?.startDate) }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">End Date</div>
        <template v-if="editing">
          <SiteDatePicker v-model="local.endDate" />
        </template>
        <div v-else class="text-sm text-parchment">{{ formatDate(stage?.endDate) }}</div>
      </div>
    </div>

    <!-- Elapsed Days indicator -->
    <div v-if="elapsedDays != null && !editing" class="mb-5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <div class="flex items-center justify-between text-sm">
        <span class="text-emerald-400">
          Elapsed: {{ elapsedDays }} day{{ elapsedDays !== 1 ? 's' : '' }}
        </span>
        <span v-if="stage?.duration || recipe?.macerationDays" class="text-parchment/50">
          {{ Math.max(0, (stage?.duration || recipe?.macerationDays || 0) - elapsedDays) }} day{{ Math.max(0, (stage?.duration || recipe?.macerationDays || 0) - elapsedDays) !== 1 ? 's' : '' }} remaining
        </span>
      </div>
    </div>

    <!-- Base Spirit -->
    <div class="mb-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Base Spirit</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="Source">
          <UInput v-model="local.baseSpirit.source" placeholder="e.g. GNS, house vodka" />
        </UFormField>
        <UFormField label="Volume">
          <UInput v-model.number="local.baseSpirit.volume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.baseSpirit.volumeUnit" :items="volumeUnits" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.baseSpirit.abv" type="number" placeholder="0" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="stage?.baseSpirit?.source">
          {{ stage.baseSpirit.source }}
          <template v-if="stage.baseSpirit.volume">
            &mdash; {{ stage.baseSpirit.volume }} {{ stage.baseSpirit.volumeUnit }}
            @ {{ stage.baseSpirit.abv }}% ABV
          </template>
        </template>
        <template v-else>Not recorded</template>
      </div>
    </div>

    <!-- Botanicals -->
    <div class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Botanicals</div>
        <UButton
          v-if="editing"
          size="xs"
          variant="outline"
          icon="i-lucide-plus"
          @click="showAddBotanical = !showAddBotanical"
        >
          Add Botanical
        </UButton>
      </div>

      <!-- Add botanical form -->
      <div v-if="showAddBotanical" class="mb-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="col-span-2 sm:col-span-1">
            <div class="text-xs text-parchment/60 mb-1">Item (optional)</div>
            <BaseItemSelect v-model="newBotanical.item" placeholder="Select item" size="sm" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">Name</div>
            <UInput v-model="newBotanical.name" placeholder="e.g. Juniper berries" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">Weight</div>
            <div class="flex gap-2">
              <UInput v-model.number="newBotanical.weight" type="number" placeholder="0" class="flex-1" />
              <USelect v-model="newBotanical.weightUnit" :items="weightUnits" class="w-16" />
            </div>
          </div>
          <div class="flex items-end">
            <UButton size="sm" @click="addBotanical">Add</UButton>
          </div>
        </div>
      </div>

      <!-- Botanicals list -->
      <div v-if="(stage?.botanicals || []).length > 0" class="divide-y divide-brown/20">
        <div
          v-for="(botanical, i) in stage?.botanicals"
          :key="i"
          class="flex items-center justify-between py-2 text-sm"
        >
          <span class="text-parchment">{{ getBotanicalName(botanical) }}</span>
          <div class="flex items-center gap-3">
            <span v-if="botanical.weight" class="text-parchment/60">
              {{ botanical.weight }} {{ botanical.weightUnit }}
            </span>
            <UButton
              v-if="editing"
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-x"
              @click="removeBotanical(i)"
            />
          </div>
        </div>
      </div>
      <div v-else class="text-center py-3">
        <p class="text-sm text-parchment/50">No botanicals added</p>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Maceration notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Maceration</UButton>
    </div>
  </div>
</template>
