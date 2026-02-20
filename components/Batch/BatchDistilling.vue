<script setup lang="ts">
import type { Batch, DistillingStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const stage = computed(() => props.batch.stages?.distilling as DistillingStage | undefined)

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const getVesselName = (id?: string) => {
  if (!id) return 'N/A'
  return vesselStore.getVesselById(id)?.name || 'Unknown'
}

const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

// Editing state
const local = ref({
  vessel: stage.value?.vessel || '',
  runType: stage.value?.runType || '' as string,
  runNumber: stage.value?.runNumber,
  chargeVolume: stage.value?.chargeVolume,
  chargeVolumeUnit: stage.value?.chargeVolumeUnit || 'gallon',
  chargeAbv: stage.value?.chargeAbv,
  additions: {
    tails: {
      volume: stage.value?.additions?.tails?.volume,
      volumeUnit: stage.value?.additions?.tails?.volumeUnit || 'gallon',
      abv: stage.value?.additions?.tails?.abv,
    },
    feints: {
      volume: stage.value?.additions?.feints?.volume,
      volumeUnit: stage.value?.additions?.feints?.volumeUnit || 'gallon',
      abv: stage.value?.additions?.feints?.abv,
    },
  },
  collected: {
    foreshots: {
      vessel: stage.value?.collected?.foreshots?.vessel || '',
      volume: stage.value?.collected?.foreshots?.volume,
      volumeUnit: stage.value?.collected?.foreshots?.volumeUnit || 'gallon',
      abv: stage.value?.collected?.foreshots?.abv,
    },
    heads: {
      vessel: stage.value?.collected?.heads?.vessel || '',
      volume: stage.value?.collected?.heads?.volume,
      volumeUnit: stage.value?.collected?.heads?.volumeUnit || 'gallon',
      abv: stage.value?.collected?.heads?.abv,
    },
    hearts: {
      vessel: stage.value?.collected?.hearts?.vessel || '',
      volume: stage.value?.collected?.hearts?.volume,
      volumeUnit: stage.value?.collected?.hearts?.volumeUnit || 'gallon',
      abv: stage.value?.collected?.hearts?.abv,
    },
    tails: {
      vessel: stage.value?.collected?.tails?.vessel || '',
      volume: stage.value?.collected?.tails?.volume,
      volumeUnit: stage.value?.collected?.tails?.volumeUnit || 'gallon',
      abv: stage.value?.collected?.tails?.abv,
    },
    total: {
      volume: stage.value?.collected?.total?.volume,
      volumeUnit: stage.value?.collected?.total?.volumeUnit || 'gallon',
      abv: stage.value?.collected?.total?.abv,
      proofGallons: stage.value?.collected?.total?.proofGallons,
    },
  },
  notes: stage.value?.notes || '',
})

const stillOptions = computed(() =>
  vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
)

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

const cutVesselOptions = computed(() => [
  ...stillOptions.value,
  ...tankOptions.value,
])

const runTypeOptions = ['stripping', 'spirit', 'single']
const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']

const cuts = computed(() => [
  { label: 'Foreshots', key: 'foreshots' as const, data: stage.value?.collected?.foreshots },
  { label: 'Heads', key: 'heads' as const, data: stage.value?.collected?.heads },
  { label: 'Hearts', key: 'hearts' as const, data: stage.value?.collected?.hearts },
  { label: 'Tails', key: 'tails' as const, data: stage.value?.collected?.tails },
  { label: 'Total', key: 'total' as const, data: stage.value?.collected?.total },
])

// Auto-calculate proof gallons for total collected
const calculatedTotalPG = computed(() => {
  const t = local.value.collected.total
  if (t.volume && t.abv) {
    return calculateProofGallons(t.volume, t.volumeUnit, t.abv)
  }
  return null
})

const displayTotalPG = computed(() => {
  const t = stage.value?.collected?.total
  if (t?.proofGallons) return t.proofGallons
  if (t?.volume && t?.abv) {
    return calculateProofGallons(t.volume, t.volumeUnit || 'gallon', t.abv)
  }
  return null
})

watch([() => local.value.collected.total.volume, () => local.value.collected.total.abv, () => local.value.collected.total.volumeUnit], () => {
  if (calculatedTotalPG.value !== null) {
    local.value.collected.total.proofGallons = calculatedTotalPG.value
  }
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Distilling', {
      vessel: local.value.vessel || undefined,
      runType: local.value.runType || undefined,
      runNumber: local.value.runNumber,
      chargeVolume: local.value.chargeVolume,
      chargeVolumeUnit: local.value.chargeVolumeUnit,
      chargeAbv: local.value.chargeAbv,
      additions: {
        tails: {
          volume: local.value.additions.tails.volume,
          volumeUnit: local.value.additions.tails.volumeUnit,
          abv: local.value.additions.tails.abv,
        },
        feints: {
          volume: local.value.additions.feints.volume,
          volumeUnit: local.value.additions.feints.volumeUnit,
          abv: local.value.additions.feints.abv,
        },
      },
      collected: {
        foreshots: { ...local.value.collected.foreshots, vessel: local.value.collected.foreshots.vessel || undefined },
        heads: { ...local.value.collected.heads, vessel: local.value.collected.heads.vessel || undefined },
        hearts: { ...local.value.collected.hearts, vessel: local.value.collected.hearts.vessel || undefined },
        tails: { ...local.value.collected.tails, vessel: local.value.collected.tails.vessel || undefined },
        total: { ...local.value.collected.total },
      },
      notes: local.value.notes,
    })
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Still</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="stillOptions" value-key="value" label-key="label" placeholder="Select still" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Run Type</div>
        <template v-if="editing">
          <USelect v-model="local.runType" :items="runTypeOptions" placeholder="Select run type" />
        </template>
        <div v-else class="text-sm text-parchment capitalize">{{ stage?.runType || 'Not set' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Run Number</div>
        <template v-if="editing">
          <UInput v-model.number="local.runNumber" type="number" placeholder="1" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.runNumber || 'N/A' }}</div>
      </div>
    </div>

    <!-- Charge -->
    <div class="mb-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Charge</div>
      <div v-if="editing" class="grid grid-cols-3 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.chargeVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.chargeVolumeUnit" :items="volumeUnits" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.chargeAbv" type="number" placeholder="0" />
        </UFormField>
      </div>
      <div v-else class="text-sm text-parchment/60">
        <template v-if="stage?.chargeVolume">
          {{ stage.chargeVolume }} {{ stage.chargeVolumeUnit }} @ {{ stage.chargeAbv }}% ABV
        </template>
        <template v-else>Not recorded</template>
      </div>
    </div>

    <!-- Additions -->
    <div class="mb-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Additions</div>
      <div v-if="editing" class="space-y-3">
        <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
          <div class="text-xs font-semibold text-parchment/60 uppercase mb-2">Tails Added Back</div>
          <div class="grid grid-cols-3 gap-3">
            <UFormField label="Volume">
              <UInput v-model.number="local.additions.tails.volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.additions.tails.volumeUnit" :items="volumeUnits" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="local.additions.tails.abv" type="number" placeholder="0" />
            </UFormField>
          </div>
        </div>
        <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
          <div class="text-xs font-semibold text-parchment/60 uppercase mb-2">Feints Added Back</div>
          <div class="grid grid-cols-3 gap-3">
            <UFormField label="Volume">
              <UInput v-model.number="local.additions.feints.volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.additions.feints.volumeUnit" :items="volumeUnits" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="local.additions.feints.abv" type="number" placeholder="0" />
            </UFormField>
          </div>
        </div>
      </div>
      <div v-else class="space-y-1 text-sm text-parchment/60">
        <div v-if="stage?.additions?.tails?.volume">
          Tails: {{ stage.additions.tails.volume }} {{ stage.additions.tails.volumeUnit }}
          @ {{ stage.additions.tails.abv }}% ABV
        </div>
        <div v-if="stage?.additions?.feints?.volume">
          Feints: {{ stage.additions.feints.volume }} {{ stage.additions.feints.volumeUnit }}
          @ {{ stage.additions.feints.abv }}% ABV
        </div>
        <div v-if="!stage?.additions?.tails?.volume && !stage?.additions?.feints?.volume">
          None
        </div>
      </div>
    </div>

    <!-- Collected Cuts -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Collected Cuts</div>
      <div v-if="editing" class="space-y-3">
        <!-- Foreshots -->
        <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
          <div class="text-xs font-semibold text-parchment/60 uppercase mb-2">Foreshots</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <UFormField label="Vessel">
              <USelect v-model="local.collected.foreshots.vessel" :items="cutVesselOptions" value-key="value" label-key="label" placeholder="Vessel" />
            </UFormField>
            <UFormField label="Volume">
              <UInput v-model.number="local.collected.foreshots.volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.collected.foreshots.volumeUnit" :items="volumeUnits" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="local.collected.foreshots.abv" type="number" placeholder="0" />
            </UFormField>
          </div>
        </div>

        <!-- Heads, Hearts, Tails -->
        <div v-for="cut in (['heads', 'hearts', 'tails'] as const)" :key="cut" class="p-3 rounded-lg border border-brown/20 bg-brown/5">
          <div class="text-xs font-semibold text-parchment/60 uppercase mb-2">{{ cut }}</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <UFormField label="Vessel">
              <USelect v-model="local.collected[cut].vessel" :items="cutVesselOptions" value-key="value" label-key="label" placeholder="Vessel" />
            </UFormField>
            <UFormField label="Volume">
              <UInput v-model.number="local.collected[cut].volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.collected[cut].volumeUnit" :items="volumeUnits" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="local.collected[cut].abv" type="number" placeholder="0" />
            </UFormField>
          </div>
        </div>

        <!-- Total -->
        <div class="p-3 rounded-lg border border-copper/20 bg-copper/5">
          <div class="text-xs font-semibold text-copper uppercase mb-2">Total</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <UFormField label="Volume">
              <UInput v-model.number="local.collected.total.volume" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Unit">
              <USelect v-model="local.collected.total.volumeUnit" :items="volumeUnits" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="local.collected.total.abv" type="number" placeholder="0" />
            </UFormField>
            <UFormField label="Proof Gallons">
              <UInput v-model.number="local.collected.total.proofGallons" type="number" step="0.01" :placeholder="calculatedTotalPG?.toString() || '0'" />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Read-only cuts display -->
      <div v-else class="divide-y divide-brown/20">
        <div v-for="cut in cuts" :key="cut.key" class="flex items-center justify-between py-2 gap-2">
          <span class="text-sm font-medium text-parchment/60 uppercase w-20 shrink-0">{{ cut.label }}</span>
          <span v-if="cut.key !== 'total'" class="text-sm text-parchment/50 truncate">{{ getVesselName((cut.data as any)?.vessel) }}</span>
          <span v-else class="text-sm text-parchment/50">&mdash;</span>
          <span class="text-sm text-parchment whitespace-nowrap">
            {{ cut.data?.volume || 0 }} {{ cut.data?.volumeUnit || '' }}
          </span>
          <span class="text-sm text-parchment/60 whitespace-nowrap">{{ cut.data?.abv || 0 }}% ABV</span>
          <span v-if="cut.key === 'total' && displayTotalPG" class="text-sm text-copper font-semibold whitespace-nowrap">
            {{ displayTotalPG }} PG
          </span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="mt-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Distilling notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Distilling</UButton>
    </div>
  </div>
</template>
