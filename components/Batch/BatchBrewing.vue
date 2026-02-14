<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()

const vesselName = computed(() => {
  if (!props.batch.brewing?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(props.batch.brewing.vessel)?.name || 'Unknown'
})

const brewDate = computed(() => {
  if (!props.batch.brewing?.date) return 'Not set'
  return new Date(props.batch.brewing.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const localVessel = ref(props.batch.brewing?.vessel || '')
const localDate = ref(props.batch.brewing?.date ? new Date(props.batch.brewing.date) : new Date())
const localNotes = ref(props.batch.brewing?.notes || '')

const isDirty = computed(() => {
  return localVessel.value !== (props.batch.brewing?.vessel || '')
    || localNotes.value !== (props.batch.brewing?.notes || '')
    || localDate.value?.toISOString() !== (props.batch.brewing?.date ? new Date(props.batch.brewing.date).toISOString() : new Date().toISOString())
})

const mashTunOptions = computed(() =>
  vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }))
)

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (!target) return
    target.brewing = {
      vessel: localVessel.value || undefined,
      date: localDate.value,
      notes: localNotes.value,
    }
    batchStore.batch = target
    await batchStore.updateBatch()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-orange-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-flame" class="text-lg text-orange-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Brewing</h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="localVessel" :items="mashTunOptions" value-key="value" label-key="label" placeholder="Select mash tun" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Brew Date</div>
        <template v-if="editing">
          <SiteDatePicker v-model="localDate" />
        </template>
        <div v-else class="text-sm text-parchment">{{ brewDate }}</div>
      </div>
      <div class="sm:col-span-1">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <template v-if="editing">
          <UTextarea v-model="localNotes" placeholder="Brewing notes..." :rows="2" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ batch.brewing?.notes || 'None' }}</div>
      </div>
    </div>

    <div v-if="editing && isDirty" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Brewing</UButton>
    </div>
  </div>
</template>
