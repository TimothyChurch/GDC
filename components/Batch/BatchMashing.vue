<script setup lang="ts">
import type { Batch, MashingStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()

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
