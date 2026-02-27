<script setup lang="ts">
import type { DistillingRun, DistillingAddition, DistillingCut } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'
import { convertUnitRatio } from '~/utils/conversions'

const props = defineProps<{
  run: DistillingRun
  runIndex: number
  editing: boolean
  batchId: string
}>()

const emit = defineEmits<{
  delete: [runIndex: number]
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']

// Build local editable copy
const local = ref<DistillingRun>(JSON.parse(JSON.stringify(props.run)))

// Re-sync local when prop changes (e.g. after save)
watch(() => props.run, (newRun) => {
  local.value = JSON.parse(JSON.stringify(newRun))
}, { deep: true })

// Date string for the date input (YYYY-MM-DD format)
const dateString = computed({
  get: () => {
    if (!local.value.date) return ''
    return new Date(local.value.date).toISOString().split('T')[0]
  },
  set: (val: string) => {
    local.value.date = val ? new Date(val) : undefined
  },
})

// Vessel options — destinations show only empty barrels, sources show all barrels
const destinationVesselOptions = computed(() => [
  ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
  ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
  ...vesselStore.emptyBarrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id })),
])

const cutVesselOptions = computed(() => [
  { label: 'Disposed', value: 'disposed' },
  ...destinationVesselOptions.value,
])

const sourceVesselOptions = computed(() => [
  ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
  ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
  ...vesselStore.barrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id })),
])

const getVesselName = (id?: string) => {
  if (!id) return 'N/A'
  if (id === 'disposed') return 'Disposed'
  return vesselStore.getVesselById(id)?.name || 'Unknown'
}

// Additions management
const addAddition = () => {
  if (!local.value.additions) local.value.additions = []
  local.value.additions.push({ label: '', sourceVessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined })
}

const removeAddition = (index: number) => {
  local.value.additions?.splice(index, 1)
}

// Ensure collected cuts object exists for spirit runs
const ensureCollected = () => {
  if (!local.value.collected) {
    local.value.collected = {
      foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      lateHeads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
    }
  }
  // Backfill lateHeads for existing data that was saved before this field existed
  if (local.value.collected && !local.value.collected.lateHeads) {
    local.value.collected.lateHeads = { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined }
  }
}

// Ensure output object exists for stripping runs
const ensureOutput = () => {
  if (!local.value.output) {
    local.value.output = { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined }
  }
}

// Auto-initialize the right structure when run type changes
watch(() => local.value.runType, (type) => {
  if (type === 'spirit') ensureCollected()
  if (type === 'stripping') ensureOutput()
})

// Auto-calculate totals
const calculatedTotal = computed(() => {
  const r = local.value
  if (r.runType === 'stripping' && r.output) {
    const vol = r.output.volume || 0
    const unit = r.output.volumeUnit || 'gallon'
    const abv = r.output.abv || 0
    return {
      volume: vol,
      volumeUnit: unit,
      abv,
      proofGallons: vol && abv ? calculateProofGallons(vol, unit, abv) : 0,
    }
  }
  if (r.runType === 'spirit' && r.collected) {
    const cuts = [r.collected.foreshots, r.collected.heads, r.collected.lateHeads, r.collected.hearts, r.collected.tails].filter(Boolean) as DistillingCut[]
    const baseUnit = cuts[0]?.volumeUnit || 'gallon'
    const totalVol = cuts.reduce(
      (sum, c) => sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || 'gallon', baseUnit), 0
    )
    // Volume-weighted ABV (normalized to baseUnit)
    const weightedAbv = totalVol > 0
      ? cuts.reduce(
          (sum, c) => sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || 'gallon', baseUnit) * (c.abv || 0), 0
        ) / totalVol
      : 0
    return {
      volume: totalVol,
      volumeUnit: baseUnit,
      abv: +weightedAbv.toFixed(2),
      proofGallons: totalVol && weightedAbv ? calculateProofGallons(totalVol, baseUnit, weightedAbv) : 0,
    }
  }
  return null
})

// Read-only display total (for existing data)
const displayTotal = computed(() => {
  if (props.run.total?.proofGallons) return props.run.total
  return calculatedTotal.value
})

const cutLabels = ['foreshots', 'heads', 'lateHeads', 'hearts', 'tails'] as const

// Human-readable label for cut keys
const cutDisplayLabels: Record<string, string> = {
  foreshots: 'Foreshots',
  heads: 'Heads',
  lateHeads: 'Late Heads',
  hearts: 'Hearts',
  tails: 'Tails',
}

// Read-only cut list for display
const displayCuts = computed(() => {
  if (!props.run.collected) return []
  return cutLabels
    .map(key => ({ label: cutDisplayLabels[key] || key, key, data: props.run.collected![key] }))
    .filter(c => c.data)
})

// Save
const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    // Attach calculated total
    const data = { ...local.value }
    if (calculatedTotal.value) {
      data.total = calculatedTotal.value
    }
    // Clean empty vessel strings
    if (data.output && !data.output.vessel) data.output.vessel = undefined
    if (data.collected) {
      for (const key of cutLabels) {
        const cut = data.collected[key]
        if (cut && !cut.vessel) cut.vessel = undefined
      }
    }
    await batchStore.updateDistillingRun(props.batchId, props.runIndex, data)
  } finally {
    saving.value = false
  }
}

// Format date for display
const formatDate = (d?: Date | string) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="bg-brown/5 rounded-lg border border-brown/20 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold text-parchment font-[Cormorant_Garamond]">
          Run #{{ local.runNumber }}
        </span>
        <UBadge
          :color="local.runType === 'spirit' ? 'primary' : 'neutral'"
          variant="subtle"
          size="xs"
        >
          {{ local.runType || 'unset' }}
        </UBadge>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-parchment/50">{{ formatDate(local.date) }}</span>
        <UButton
          v-if="editing"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click="emit('delete', runIndex)"
        />
      </div>
    </div>

    <template v-if="editing">
      <!-- Editing: Run Type & Date -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <UFormField label="Run Type">
          <USelect v-model="local.runType" :items="['stripping', 'spirit']" placeholder="Select type" />
        </UFormField>
        <UFormField label="Date">
          <UInput v-model="dateString" type="date" />
        </UFormField>
      </div>

      <!-- Charge -->
      <div class="mb-4">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Charge (into still)</div>
        <div class="grid grid-cols-3 gap-3">
          <UFormField label="Volume">
            <UInput v-model.number="local.chargeVolume" type="number" placeholder="0" />
          </UFormField>
          <UFormField label="Unit">
            <USelect v-model="local.chargeVolumeUnit" :items="volumeUnits" />
          </UFormField>
          <UFormField label="ABV %">
            <UInput v-model.number="local.chargeAbv" type="number" step="0.1" placeholder="0" />
          </UFormField>
        </div>
      </div>

      <!-- Additions -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-parchment/60 uppercase tracking-wider">Additions</div>
          <UButton icon="i-lucide-plus" size="xs" variant="ghost" @click="addAddition">Add</UButton>
        </div>
        <div v-if="local.additions?.length" class="space-y-2">
          <div
            v-for="(addition, i) in local.additions"
            :key="i"
            class="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-2 rounded border border-brown/10 bg-brown/5"
          >
            <UFormField label="Label">
              <UInput v-model="addition.label" placeholder="Tails, Low wines..." size="sm" />
            </UFormField>
            <UFormField label="Source Vessel">
              <USelect v-model="addition.sourceVessel" :items="sourceVesselOptions" value-key="value" label-key="label" placeholder="Vessel" size="sm" />
            </UFormField>
            <UFormField label="Volume">
              <UInput v-model.number="addition.volume" type="number" placeholder="0" size="sm" />
            </UFormField>
            <UFormField label="ABV %">
              <UInput v-model.number="addition.abv" type="number" step="0.1" placeholder="0" size="sm" />
            </UFormField>
            <div class="flex justify-end">
              <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" @click="removeAddition(i)" />
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-parchment/50 italic">None</div>
      </div>

      <!-- Output (stripping runs) -->
      <div v-if="local.runType === 'stripping'" class="mb-4">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Output</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <UFormField label="Vessel">
            <USelect v-model="local.output!.vessel" :items="cutVesselOptions" value-key="value" label-key="label" placeholder="Vessel" />
          </UFormField>
          <UFormField label="Volume">
            <UInput v-model.number="local.output!.volume" type="number" placeholder="0" />
          </UFormField>
          <UFormField label="Unit">
            <USelect v-model="local.output!.volumeUnit" :items="volumeUnits" />
          </UFormField>
          <UFormField label="ABV %">
            <UInput v-model.number="local.output!.abv" type="number" step="0.1" placeholder="0" />
          </UFormField>
        </div>
      </div>

      <!-- Collected Cuts (spirit runs) -->
      <div v-if="local.runType === 'spirit'" class="mb-4">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Collected Cuts</div>
        <div class="space-y-2">
          <div v-for="cut in cutLabels" :key="cut" class="p-3 rounded border border-brown/10 bg-brown/5">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs font-semibold text-parchment/60 uppercase">{{ cutDisplayLabels[cut] || cut }}</div>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="local.collected![cut]!.disposed || local.collected![cut]!.vessel === 'disposed'"
                  class="rounded border-brown/30 bg-charcoal text-error-500 focus:ring-error-500/50"
                  @change="(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked
                    local.collected![cut]!.disposed = checked
                    if (checked) local.collected![cut]!.vessel = 'disposed'
                    else if (local.collected![cut]!.vessel === 'disposed') local.collected![cut]!.vessel = ''
                  }"
                />
                <span class="text-xs text-parchment/50">Disposed</span>
              </label>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <UFormField label="Vessel">
                <USelect
                  v-model="local.collected![cut]!.vessel"
                  :items="cutVesselOptions"
                  value-key="value"
                  label-key="label"
                  placeholder="Vessel"
                  :disabled="local.collected![cut]!.disposed"
                />
              </UFormField>
              <UFormField label="Volume">
                <UInput v-model.number="local.collected![cut]!.volume" type="number" placeholder="0" />
              </UFormField>
              <UFormField label="Unit">
                <USelect v-model="local.collected![cut]!.volumeUnit" :items="volumeUnits" />
              </UFormField>
              <UFormField label="ABV %">
                <UInput v-model.number="local.collected![cut]!.abv" type="number" step="0.1" placeholder="0" />
              </UFormField>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-calculated total -->
      <div v-if="calculatedTotal && local.runType" class="mb-4 p-3 rounded border border-copper/20 bg-copper/5">
        <div class="text-xs font-semibold text-copper uppercase mb-1">Calculated Total</div>
        <div class="flex gap-4 text-sm text-parchment">
          <span>{{ calculatedTotal.volume?.toFixed(2) }} {{ calculatedTotal.volumeUnit }}</span>
          <span>{{ calculatedTotal.abv }}% ABV</span>
          <span class="text-copper font-semibold">{{ calculatedTotal.proofGallons?.toFixed(4) }} PG</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="mb-4">
        <UFormField label="Notes">
          <UTextarea v-model="local.notes" placeholder="Run notes..." :rows="2" />
        </UFormField>
      </div>

      <!-- Save -->
      <div class="flex justify-end">
        <UButton @click="save" :loading="saving" size="sm">Save Run</UButton>
      </div>
    </template>

    <!-- Read-only display -->
    <template v-else>
      <!-- Charge -->
      <div class="mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Charge</div>
        <div class="text-sm text-parchment">
          <template v-if="run.chargeVolume">
            {{ run.chargeVolume }} {{ run.chargeVolumeUnit || 'gallon' }} @ {{ run.chargeAbv || 0 }}% ABV
            <span v-if="run.chargeSourceVessel" class="text-parchment/50">
              (from {{ getVesselName(run.chargeSourceVessel) }})
            </span>
          </template>
          <template v-else>Not recorded</template>
        </div>
      </div>

      <!-- Additions -->
      <div v-if="run.additions?.length" class="mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Additions</div>
        <div v-for="(a, i) in run.additions" :key="i" class="text-sm text-parchment/70">
          {{ a.label || 'Addition' }}: {{ a.volume }} {{ a.volumeUnit || 'gallon' }}
          @ {{ a.abv || 0 }}% ABV
          <span v-if="a.sourceVessel" class="text-parchment/50">(from {{ getVesselName(a.sourceVessel) }})</span>
        </div>
      </div>

      <!-- Output (stripping) -->
      <div v-if="run.runType === 'stripping' && run.output" class="mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Output</div>
        <div class="text-sm text-parchment">
          {{ run.output.volume }} {{ run.output.volumeUnit || 'gallon' }}
          @ {{ run.output.abv || 0 }}% ABV
          <span class="text-parchment/50">&#8594; {{ getVesselName(run.output.vessel) }}</span>
        </div>
      </div>

      <!-- Cuts (spirit) -->
      <div v-if="run.runType === 'spirit' && displayCuts.length" class="mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cuts</div>
        <div class="divide-y divide-brown/10">
          <div v-for="cut in displayCuts" :key="cut.key" class="flex items-center justify-between py-1.5 gap-2">
            <span class="text-xs font-medium text-parchment/60 uppercase w-20 shrink-0">{{ cut.label }}</span>
            <span class="text-sm truncate" :class="cut.data?.disposed || cut.data?.vessel === 'disposed' ? 'text-error-400' : 'text-parchment/50'">
              <template v-if="cut.data?.disposed || cut.data?.vessel === 'disposed'">
                <UIcon name="i-lucide-trash-2" class="inline-block mr-0.5 text-xs" /> Disposed
              </template>
              <template v-else>{{ getVesselName(cut.data?.vessel) }}</template>
            </span>
            <span class="text-sm text-parchment whitespace-nowrap">
              {{ cut.data?.volume || 0 }} {{ cut.data?.volumeUnit || 'gallon' }}
            </span>
            <span class="text-sm text-parchment/60 whitespace-nowrap">{{ cut.data?.abv || 0 }}% ABV</span>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div v-if="displayTotal" class="mb-3 p-2 rounded bg-copper/5 border border-copper/10">
        <div class="flex items-center justify-between text-sm">
          <span class="text-xs font-semibold text-copper uppercase">Total</span>
          <span class="text-parchment">
            {{ displayTotal.volume?.toFixed(2) }} {{ displayTotal.volumeUnit || 'gallon' }}
            @ {{ displayTotal.abv }}% ABV
          </span>
          <span v-if="displayTotal.proofGallons" class="text-copper font-semibold">
            {{ displayTotal.proofGallons?.toFixed(4) }} PG
          </span>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="run.notes" class="text-sm text-parchment/50 italic">{{ run.notes }}</div>
    </template>
  </div>
</template>
