<script setup lang="ts">
import type { Batch, FilteringStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()

const stage = computed(() => props.batch.stages?.filtering as FilteringStage | undefined)

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
  method: stage.value?.method || '',
  preVolume: stage.value?.preVolume,
  preVolumeUnit: stage.value?.preVolumeUnit || 'gallon',
  preAbv: stage.value?.preAbv,
  postVolume: stage.value?.postVolume,
  postVolumeUnit: stage.value?.postVolumeUnit || 'gallon',
  postAbv: stage.value?.postAbv,
  filterMedia: stage.value?.filterMedia || '',
  passes: stage.value?.passes,
  notes: stage.value?.notes || '',
})

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

const volumeLoss = computed(() => {
  if (local.value.preVolume && local.value.postVolume) {
    const loss = local.value.preVolume - local.value.postVolume
    return loss > 0 ? loss.toFixed(2) : null
  }
  return null
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Filtering', {
      vessel: local.value.vessel || undefined,
      method: local.value.method,
      preVolume: local.value.preVolume,
      preVolumeUnit: local.value.preVolumeUnit,
      preAbv: local.value.preAbv,
      postVolume: local.value.postVolume,
      postVolumeUnit: local.value.postVolumeUnit,
      postAbv: local.value.postAbv,
      filterMedia: local.value.filterMedia,
      passes: local.value.passes,
      notes: local.value.notes,
    })

    // Update the vessel's contents with post-filter volume and ABV
    if (local.value.vessel && local.value.postVolume != null && local.value.postAbv != null) {
      const vessel = vesselStore.getVesselById(local.value.vessel)
      if (vessel) {
        vesselStore.setVessel(vessel._id)
        const batchContent = vesselStore.vessel.contents?.find(c => c.batch === props.batch._id)
        if (batchContent) {
          batchContent.volume = local.value.postVolume
          batchContent.volumeUnit = local.value.postVolumeUnit
          batchContent.abv = local.value.postAbv
        }
        await vesselStore.updateVessel()
      }
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-sky-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-filter" class="text-lg text-sky-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Filtering</h3>
    </div>

    <!-- Vessel, Method, Start Date -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
          <UInput v-model="local.method" placeholder="e.g. charcoal, chill, plate, gravity" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.method || 'Not specified' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
    </div>

    <!-- Filter Media & Passes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Filter Media</div>
        <template v-if="editing">
          <UInput v-model="local.filterMedia" placeholder="e.g. activated carbon, cellulose pads" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ stage?.filterMedia || 'Not recorded' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Passes</div>
        <template v-if="editing">
          <UInput v-model.number="local.passes" type="number" placeholder="1" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ stage?.passes || 'N/A' }}</div>
      </div>
    </div>

    <!-- Pre-Filter -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Pre-Filter</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.preVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.preVolumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.preAbv" type="number" step="0.1" placeholder="0" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="stage?.preVolume">
          {{ stage.preVolume }} {{ stage.preVolumeUnit }} @ {{ stage.preAbv }}% ABV
        </template>
        <template v-else>Not recorded</template>
      </div>
    </div>

    <!-- Post-Filter -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Post-Filter</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.postVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.postVolumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.postAbv" type="number" step="0.1" placeholder="0" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="stage?.postVolume">
          {{ stage.postVolume }} {{ stage.postVolumeUnit }} @ {{ stage.postAbv }}% ABV
        </template>
        <template v-else>Not recorded</template>
      </div>
    </div>

    <!-- Volume Loss indicator -->
    <div v-if="!editing && volumeLoss" class="mb-4 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
      <span class="text-xs text-sky-400">Volume loss: {{ volumeLoss }} {{ stage?.preVolumeUnit || 'gallon' }}</span>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Filtering notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Filtering</UButton>
    </div>
  </div>
</template>
