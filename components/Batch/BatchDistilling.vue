<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const vesselName = computed(() => {
  if (!props.batch.distilling?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(props.batch.distilling.vessel)?.name || 'Unknown'
})

const distillDate = computed(() => {
  if (!props.batch.distilling?.date) return 'Not set'
  return new Date(props.batch.distilling.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const getVesselName = (id?: string) => {
  if (!id) return 'N/A'
  return vesselStore.getVesselById(id)?.name || 'Unknown'
}

// Editing state
const local = ref({
  vessel: props.batch.distilling?.vessel || '',
  date: props.batch.distilling?.date ? new Date(props.batch.distilling.date) : new Date(),
  additions: {
    tails: { ...props.batch.distilling?.additions?.tails },
  },
  collected: {
    heads: { ...props.batch.distilling?.collected?.heads },
    hearts: { ...props.batch.distilling?.collected?.hearts },
    tails: { ...props.batch.distilling?.collected?.tails },
    total: { ...props.batch.distilling?.collected?.total },
  },
  notes: props.batch.distilling?.notes || '',
})

const stillOptions = computed(() =>
  vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
)
const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)
const allVesselOptions = computed(() => [
  ...stillOptions.value,
  ...tankOptions.value,
])

const cuts = computed(() => [
  { label: 'Heads', key: 'heads' as const, data: props.batch.distilling?.collected?.heads },
  { label: 'Hearts', key: 'hearts' as const, data: props.batch.distilling?.collected?.hearts },
  { label: 'Tails', key: 'tails' as const, data: props.batch.distilling?.collected?.tails },
  { label: 'Total', key: 'total' as const, data: props.batch.distilling?.collected?.total },
])

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (!target) return
    target.distilling = {
      vessel: local.value.vessel || undefined,
      date: local.value.date,
      additions: {
        tails: {
          volume: local.value.additions.tails.volume,
          volumeUnit: local.value.additions.tails.volumeUnit,
          abv: local.value.additions.tails.abv,
        },
      },
      collected: {
        heads: { ...local.value.collected.heads },
        hearts: { ...local.value.collected.hearts },
        tails: { ...local.value.collected.tails },
        total: { ...local.value.collected.total },
      },
      notes: local.value.notes,
    }
    batchStore.batch = target
    await batchStore.updateBatch()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-copper/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-flask-conical" class="text-lg text-copper" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Distilling</h3>
    </div>

    <!-- Header info -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="stillOptions" value-key="value" label-key="label" placeholder="Select still" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Distill Date</div>
        <template v-if="editing">
          <SiteDatePicker v-model="local.date" />
        </template>
        <div v-else class="text-sm text-parchment">{{ distillDate }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <template v-if="editing">
          <UTextarea v-model="local.notes" placeholder="Distilling notes..." :rows="2" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ batch.distilling?.notes || 'None' }}</div>
      </div>
    </div>

    <!-- Additions (tails added back) -->
    <div class="mb-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Tails Added Back</div>
      <div v-if="editing" class="grid grid-cols-3 gap-3">
        <UFormField label="Volume">
          <UInput v-model="local.additions.tails.volume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.additions.tails.volumeUnit" :items="['gallon', 'L', 'mL', 'fl oz']" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model="local.additions.tails.abv" type="number" placeholder="0" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="batch.distilling?.additions?.tails?.volume">
          {{ batch.distilling.additions.tails.volume }} {{ batch.distilling.additions.tails.volumeUnit }}
          @ {{ batch.distilling.additions.tails.abv }}% ABV
        </template>
        <template v-else>None</template>
      </div>
    </div>

    <!-- Collected Cuts -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Collected Cuts</div>
      <div v-if="editing" class="space-y-3">
        <div v-for="cut in (['heads', 'hearts', 'tails', 'total'] as const)" :key="cut" class="p-3 rounded-lg border border-brown/20 bg-brown/5">
          <div class="text-xs font-semibold text-parchment/60 uppercase mb-2">{{ cut }}</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <UFormField v-if="cut !== 'total'" label="Vessel">
              <USelect v-model="local.collected[cut].vessel" :items="allVesselOptions" value-key="value" label-key="label" placeholder="Vessel" />
            </UFormField>
            <UFormField label="Volume">
              <UInput v-model="local.collected[cut].volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.collected[cut].volumeUnit" :items="['gallon', 'L', 'mL', 'fl oz']" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model="local.collected[cut].abv" type="number" placeholder="0" />
            </UFormField>
          </div>
        </div>
      </div>
      <div v-else class="divide-y divide-brown/20">
        <div v-for="cut in cuts" :key="cut.key" class="flex items-center justify-between py-2">
          <span class="text-sm font-medium text-parchment/60 uppercase w-16">{{ cut.label }}</span>
          <span v-if="cut.key !== 'total'" class="text-sm text-parchment/50">{{ getVesselName(cut.data?.vessel) }}</span>
          <span v-else class="text-sm text-parchment/50">&mdash;</span>
          <span class="text-sm text-parchment">
            {{ cut.data?.volume || 0 }} {{ cut.data?.volumeUnit || '' }}
          </span>
          <span class="text-sm text-parchment/60">{{ cut.data?.abv || 0 }}% ABV</span>
        </div>
      </div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Distilling</UButton>
    </div>
  </div>
</template>
