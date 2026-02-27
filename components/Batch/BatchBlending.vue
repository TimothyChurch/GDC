<script setup lang="ts">
import type { Batch, BlendingStage } from '~/types'
import { convertUnitRatio } from '~/utils/conversions'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const router = useRouter()
const toast = useToast()

const stage = computed(() => props.batch.stages?.blending as BlendingStage | undefined)

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
  components: stage.value?.components?.length
    ? stage.value.components.map((c) => ({
        source: c.source || '',
        volume: c.volume,
        volumeUnit: c.volumeUnit || 'gallon',
        abv: c.abv,
      }))
    : [{ source: '', volume: undefined as number | undefined, volumeUnit: 'gallon', abv: undefined as number | undefined }],
  resultVolume: stage.value?.resultVolume,
  resultVolumeUnit: stage.value?.resultVolumeUnit || 'gallon',
  resultAbv: stage.value?.resultAbv,
  notes: stage.value?.notes || '',
})

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

const addComponent = () => {
  local.value.components.push({
    source: '',
    volume: undefined as number | undefined,
    volumeUnit: 'gallon',
    abv: undefined as number | undefined,
  })
}

const removeComponent = (index: number) => {
  if (local.value.components.length > 1) {
    local.value.components.splice(index, 1)
  }
}

// Target unit for blending totals: use result unit or first component's unit
const blendTargetUnit = computed(() => local.value.resultVolumeUnit || local.value.components[0]?.volumeUnit || 'gallon')

// Calculate total blended volume from components (converted to common unit)
const calculatedTotalVolume = computed(() => {
  const target = blendTargetUnit.value
  const total = local.value.components.reduce((sum, c) => {
    return sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target)
  }, 0)
  return total > 0 ? +total.toFixed(2) : null
})

// Calculate blended ABV (volume-weighted average, using converted volumes)
const calculatedBlendedAbv = computed(() => {
  const target = blendTargetUnit.value
  const totalVolume = local.value.components.reduce((sum, c) => {
    return sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target)
  }, 0)
  if (totalVolume <= 0) return null
  const weightedAbv = local.value.components.reduce((sum, c) => {
    const converted = (c.volume || 0) * convertUnitRatio(c.volumeUnit || target, target)
    return sum + converted * (c.abv || 0)
  }, 0)
  return +(weightedAbv / totalVolume).toFixed(2)
})

const recipe = computed(() => props.batch?.recipe ? recipeStore.getRecipeById(props.batch.recipe) : undefined)

// Get the next stage after Blending in the pipeline
const nextStageAfterBlending = computed(() => {
  const idx = props.batch.pipeline.indexOf('Blending')
  if (idx === -1 || idx >= props.batch.pipeline.length - 1) return null
  return props.batch.pipeline[idx + 1]
})

// Create a new blended batch with "Mixed" prefix
const creatingBlend = ref(false)
const createBlendedBatch = async () => {
  const resultVol = stage.value?.resultVolume || calculatedTotalVolume.value
  const resultAbvVal = stage.value?.resultAbv || calculatedBlendedAbv.value
  if (!resultVol || !recipe.value) return

  creatingBlend.value = true
  try {
    // Build the pipeline starting from the stage after Blending
    const blendIdx = props.batch.pipeline.indexOf('Blending')
    const remainingPipeline = blendIdx >= 0
      ? props.batch.pipeline.slice(blendIdx + 1)
      : ['Storage', 'Proofing', 'Bottled']

    // Create the blended batch
    batchStore.resetBatch()
    const blendedBatch = batchStore.batch
    blendedBatch.recipe = props.batch.recipe
    blendedBatch.pipeline = remainingPipeline
    blendedBatch.currentStage = remainingPipeline[0] || 'Storage'
    blendedBatch.status = 'active'
    blendedBatch.batchSize = resultVol
    blendedBatch.batchSizeUnit = stage.value?.resultVolumeUnit || props.batch.batchSizeUnit || 'gallon'
    blendedBatch.recipeCost = props.batch.recipeCost || 0
    blendedBatch.stageVolumes = { [remainingPipeline[0] || 'Storage']: resultVol }
    blendedBatch.notes = `Mixed blend from batch ${props.batch.batchNumber || props.batch._id}. Class: Mixed ${recipe.value.class || ''}`.trim()

    await batchStore.updateBatch()

    toast.add({
      title: 'Blended batch created',
      description: `Mixed ${recipe.value.class || 'Spirit'} — ${resultVol} ${blendedBatch.batchSizeUnit}`,
      color: 'success',
      icon: 'i-lucide-git-merge',
    })

    // Navigate to the new batch
    const newBatch = batchStore.batches[batchStore.batches.length - 1]
    if (newBatch?._id) {
      router.push(`/admin/batch/${newBatch._id}`)
    }
  } catch (error: any) {
    toast.add({
      title: 'Failed to create blended batch',
      description: error?.message || 'Unknown error',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    creatingBlend.value = false
  }
}

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Blending', {
      vessel: local.value.vessel || undefined,
      components: local.value.components.filter((c) => c.source || c.volume || c.abv).map((c) => ({
        source: c.source,
        volume: c.volume,
        volumeUnit: c.volumeUnit,
        abv: c.abv,
      })),
      resultVolume: local.value.resultVolume,
      resultVolumeUnit: local.value.resultVolumeUnit,
      resultAbv: local.value.resultAbv,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-pink-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-git-merge" class="text-lg text-pink-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Blending</h3>
    </div>

    <!-- Vessel & Start Date -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="tankOptions" value-key="value" label-key="label" placeholder="Select tank" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
    </div>

    <!-- Blending Components -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Components</div>
        <UButton v-if="editing" size="xs" variant="outline" icon="i-lucide-plus" @click="addComponent">
          Add Component
        </UButton>
      </div>

      <template v-if="editing">
        <div class="space-y-3">
          <div
            v-for="(comp, index) in local.components"
            :key="index"
            class="p-3 rounded-lg border border-pink-500/15 bg-pink-500/5"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <UFormField label="Source">
                  <UInput v-model="comp.source" placeholder="e.g. Batch #42, Tank 3" />
                </UFormField>
                <UFormField label="Volume">
                  <UInput v-model.number="comp.volume" type="number" placeholder="0" />
                </UFormField>
                <UFormField label="Unit">
                  <USelect v-model="comp.volumeUnit" :items="['gallon', 'L', 'mL']" />
                </UFormField>
                <UFormField label="ABV %">
                  <UInput v-model.number="comp.abv" type="number" step="0.1" placeholder="0" />
                </UFormField>
              </div>
              <UButton
                v-if="local.components.length > 1"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                class="mt-6"
                @click="removeComponent(index)"
              />
            </div>
          </div>
        </div>

        <!-- Calculated blend preview -->
        <div v-if="calculatedTotalVolume" class="mt-2 px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
          <span class="text-xs text-pink-400">
            Calculated: {{ calculatedTotalVolume }} {{ blendTargetUnit }}
            <template v-if="calculatedBlendedAbv"> @ {{ calculatedBlendedAbv }}% ABV</template>
          </span>
        </div>
      </template>

      <template v-else>
        <div v-if="stage?.components?.length" class="divide-y divide-pink-500/10">
          <div
            v-for="(comp, index) in stage.components"
            :key="index"
            class="flex items-center justify-between py-2 text-sm"
          >
            <span class="text-parchment">{{ comp.source || 'Unknown source' }}</span>
            <span class="text-parchment/60">{{ comp.volume || 0 }} {{ comp.volumeUnit || 'gallon' }}</span>
            <span class="text-parchment/60">{{ comp.abv || 0 }}% ABV</span>
          </div>
        </div>
        <div v-else class="text-sm text-parchment/50">No components recorded</div>
      </template>
    </div>

    <!-- Result -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Result</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.resultVolume" type="number" :placeholder="calculatedTotalVolume?.toString() || '0'" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.resultVolumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.resultAbv" type="number" step="0.1" :placeholder="calculatedBlendedAbv?.toString() || '0'" />
        </UFormField>
      </div>
      <div v-else class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.resultVolume">Volume: {{ stage.resultVolume }} {{ stage.resultVolumeUnit }}</span>
        <span v-if="stage?.resultAbv">ABV: {{ stage.resultAbv }}%</span>
        <span v-if="!stage?.resultVolume && !stage?.resultAbv">Not recorded</span>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Blending notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex items-center justify-between">
      <UButton
        v-if="(stage?.resultVolume || calculatedTotalVolume) && recipe"
        icon="i-lucide-git-merge"
        variant="soft"
        color="success"
        size="sm"
        :loading="creatingBlend"
        @click="createBlendedBatch"
      >
        Create Mixed {{ recipe?.class || 'Spirit' }} Batch
      </UButton>
      <div v-else />
      <UButton @click="save" :loading="saving" size="sm">Save Blending</UButton>
    </div>
  </div>
</template>
