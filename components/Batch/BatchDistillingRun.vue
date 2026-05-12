<script setup lang="ts">
import type { DistillingRun, DistillingAddition, DistillingCut } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'
import { convertUnitRatio } from '~/utils/conversions'

const props = withDefaults(defineProps<{
  run: DistillingRun
  runIndex: number
  batchId: string
  stageKey?: 'distilling' | 'strippingRun' | 'spiritRun'
}>(), {
  stageKey: 'distilling',
})

const emit = defineEmits<{
  delete: [runIndex: number]
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

// Per-run edit mode: each run has its own edit button
const runEditing = ref(false)

// A run is considered "has data" if it has output or collected cuts saved
const hasData = computed(() => {
  const r = props.run
  if (r.runType === 'stripping' && r.output?.volume && r.output.volume > 0) return true
  if (r.runType === 'spirit' && r.collected?.hearts?.volume && r.collected.hearts.volume > 0) return true
  if (r.total?.volume && r.total.volume > 0) return true
  return false
})

// Effective editing: only when user explicitly clicks the edit button
const isRunEditing = computed(() => runEditing.value)

// Collapse/expand logic
const globalExpanded = inject<Ref<boolean | null>>('distillingRunsGlobalExpanded', ref(null))
const localCollapsed = ref(true)

// When global expanded changes (from parent toggle), sync local state
watch(globalExpanded, (val) => {
  if (val === null) return
  localCollapsed.value = !val
}, { immediate: false })

// Effective collapsed state: never collapse while editing
const collapsed = computed(() => isRunEditing.value ? false : localCollapsed.value)

const toggleCollapsed = () => {
  if (isRunEditing.value) return
  localCollapsed.value = !localCollapsed.value
}

const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']

// Build local editable copy
const local = ref<DistillingRun>(structuredClone(toRaw(props.run)))

// Re-sync local when prop changes (e.g. after save)
watch(() => props.run, (newRun) => {
  local.value = structuredClone(toRaw(newRun))
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

// Auto-initialize the right structure on load and when run type changes
if (local.value.runType === 'spirit') ensureCollected()
if (local.value.runType === 'stripping') ensureOutput()

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
    await batchStore.updateRunByStageKey(props.stageKey, props.batchId, props.runIndex, data)
    // After save, exit run edit mode
    runEditing.value = false
  } finally {
    saving.value = false
  }
}

// Complete run: saves output, empties the still, adds actual distillation output to destination vessel
const completing = ref(false)
const completeRun = async () => {
  completing.value = true
  try {
    // Build save data
    const data = { ...local.value }
    if (calculatedTotal.value) {
      data.total = calculatedTotal.value
    }
    data.completed = true

    // Clean empty vessel strings
    if (data.output && !data.output.vessel) data.output.vessel = undefined
    if (data.collected) {
      for (const key of cutLabels) {
        const cut = data.collected[key]
        if (cut && !cut.vessel) cut.vessel = undefined
      }
    }

    // Get the stage vessel (the still)
    const batch = batchStore.items.find(b => b._id === props.batchId)
    const stillId = getStage(batch, props.stageKey)?.vessel

    if (stillId) {
      // Capture the batch's value from the still before emptying (proportional to batch cost)
      const still = vesselStore.getVesselById(stillId)
      const stillBatchEntry = still?.contents?.find(c => c.batch === props.batchId)
      const chargeValue = stillBatchEntry?.value || 0

      // Step 1: Empty the still of this batch's contents (distillation changed the liquid)
      if (still?.contents) {
        still.contents = still.contents.filter(c => c.batch !== props.batchId)
        vesselStore.vessel = still
        await vesselStore.updateVessel()
      }

      // Step 2: Add the actual distillation output to destination vessel(s), carrying forward the value
      if (data.runType === 'stripping' && data.output?.vessel && data.output.vessel !== 'disposed') {
        // Stripping: all value from the charge transfers to the output
        await vesselStore.addContents(data.output.vessel, {
          batch: props.batchId,
          volume: data.output.volume || 0,
          volumeUnit: data.output.volumeUnit || 'gallon',
          abv: data.output.abv || 0,
          value: chargeValue,
        })
      } else if (data.runType === 'spirit' && data.collected) {
        // Spirit: all value goes to hearts (the product); heads/tails have no value
        for (const key of cutLabels) {
          const cut = data.collected[key]
          if (!cut || !cut.vessel || cut.vessel === 'disposed' || cut.disposed) continue
          if ((cut.volume || 0) <= 0) continue
          await vesselStore.addContents(cut.vessel, {
            batch: props.batchId,
            volume: cut.volume || 0,
            volumeUnit: cut.volumeUnit || 'gallon',
            abv: cut.abv || 0,
            value: key === 'hearts' ? chargeValue : 0,
          })
        }
      }
    }

    await batchStore.updateRunByStageKey(props.stageKey, props.batchId, props.runIndex, data)
    runEditing.value = false
  } finally {
    completing.value = false
  }
}

// Can complete: run has output data (stripping: output vessel + volume, spirit: hearts volume)
const canComplete = computed(() => {
  if (props.run.completed) return false
  const r = local.value
  if (r.runType === 'stripping') {
    return (r.output?.volume || 0) > 0 && !!r.output?.vessel
  }
  if (r.runType === 'spirit') {
    return (r.collected?.hearts?.volume || 0) > 0
  }
  return false
})

// Cancel editing and revert local changes
const cancelEdit = () => {
  runEditing.value = false
  local.value = structuredClone(toRaw(props.run))
}

// Format date for display
const formatDate = (d?: Date | string) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Summary line for collapsed view
const summaryCharge = computed(() => {
  const r = props.run
  if (!r.chargeVolume) return ''
  return `${r.chargeVolume} ${r.chargeVolumeUnit || 'gal'} @ ${r.chargeAbv || 0}% ABV`
})

const summaryProofGallons = computed(() => {
  const total = displayTotal.value
  if (!total?.proofGallons) return ''
  return `${total.proofGallons.toFixed(2)} PG`
})
</script>

<template>
  <div class="bg-brown/5 rounded-lg border border-brown/20 overflow-hidden" :class="{ 'border-green-500/30': run.completed }">
    <!-- Collapsed summary row / Header -->
    <div
      class="flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-colors hover:bg-brown/10"
      :class="{ 'cursor-default': isRunEditing }"
      @click="toggleCollapsed"
    >
      <!-- Chevron indicator (hidden when editing) -->
      <UIcon
        v-if="!isRunEditing"
        :name="collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
        class="text-parchment/60 shrink-0 transition-transform duration-200"
      />

      <span class="text-sm font-bold text-parchment font-[Cormorant_Garamond] shrink-0">
        Run #{{ local.runNumber }}
      </span>
      <UBadge
        :color="local.runType === 'spirit' ? 'primary' : 'neutral'"
        variant="subtle"
        size="xs"
        class="shrink-0"
      >
        {{ local.runType || 'unset' }}
      </UBadge>
      <UBadge
        v-if="run.completed"
        color="success"
        variant="subtle"
        size="xs"
        class="shrink-0"
      >
        Complete
      </UBadge>

      <!-- Collapsed summary details -->
      <template v-if="collapsed">
        <span class="text-xs text-parchment/50 shrink-0">{{ formatDate(local.date) }}</span>
        <span v-if="summaryCharge" class="text-xs text-parchment/60 truncate hidden sm:inline">{{ summaryCharge }}</span>
        <span class="ml-auto" />
        <span v-if="summaryProofGallons" class="text-xs font-semibold text-copper shrink-0">{{ summaryProofGallons }}</span>
      </template>

      <!-- Expanded header details -->
      <template v-else>
        <span class="ml-auto" />
        <span class="text-xs text-parchment/50">{{ formatDate(local.date) }}</span>
        <!-- Edit button -->
        <UButton
          v-if="!isRunEditing"
          icon="i-lucide-pencil"
          variant="ghost"
          size="xs"
          @click.stop="runEditing = true"
        />
        <UButton
          v-if="isRunEditing"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click.stop="emit('delete', runIndex)"
        />
      </template>
    </div>

    <!-- Expanded content -->
    <div
      class="grid transition-[grid-template-rows] duration-200 ease-in-out"
      :class="collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
    >
      <div class="overflow-hidden">
        <div class="px-4 pb-4">

    <template v-if="isRunEditing">
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
            <NumberInputWithCalc v-model="local.chargeAbv" kind="abv" :step="0.1" placeholder="0" />
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
              <NumberInputWithCalc v-model="addition.abv" kind="abv" :step="0.1" placeholder="0" size="sm" />
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
            <NumberInputWithCalc v-model="local.output!.abv" kind="abv" :step="0.1" placeholder="0" />
          </UFormField>
        </div>
      </div>

      <!-- Collected Cuts (spirit runs) -->
      <div v-if="local.runType === 'spirit'" class="mb-4">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Collected Cuts</div>
        <div class="space-y-2">
          <div v-for="cut in cutLabels" :key="cut" class="p-3 rounded border border-brown/10 bg-brown/5">
            <template v-if="local.collected?.[cut]">
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
                <NumberInputWithCalc v-model="local.collected![cut]!.abv" kind="abv" :step="0.1" placeholder="0" />
              </UFormField>
            </div>
            </template>
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

      <!-- Action buttons -->
      <div class="flex items-center gap-2 justify-end">
        <!-- Cancel edit (for runs that already have data) -->
        <UButton
          v-if="hasData"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="cancelEdit"
        >
          Cancel
        </UButton>
        <UButton @click="save" :loading="saving" size="sm" variant="outline">Save Run</UButton>
        <UButton
          v-if="canComplete"
          @click="completeRun"
          :loading="completing"
          size="sm"
          color="success"
          icon="i-lucide-check"
        >
          Complete Run
        </UButton>
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
            <span v-if="run.chargeSourceVessels?.length" class="text-parchment/50">
              (from {{ run.chargeSourceVessels.map(id => getVesselName(id)).join(', ') }})
            </span>
            <span v-else-if="run.chargeSourceVessel" class="text-parchment/50">
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

        </div><!-- /px-4 pb-4 -->
      </div><!-- /overflow-hidden -->
    </div><!-- /grid transition -->
  </div><!-- /outer container -->
</template>
