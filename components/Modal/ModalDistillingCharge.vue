<script setup lang="ts">
import type { DistillingAddition, MashingStage } from '~/types'
import { convertUnitRatio } from '~/utils/conversions'
import { calcGrainDisplacement, getEffectiveLiquidVolume, type ExtractType } from '~/utils/grainBill'

interface VesselCharge {
  vesselId: string
  volume: number
  volumeUnit: string
}

interface ChargeResult {
  stillId: string
  chargeVolume: number
  chargeVolumeUnit: string
  chargeAbv: number
  chargeSourceVessel: string
  chargeSourceVessels: string[]
  chargePerVessel: VesselCharge[]
  runType: 'stripping' | 'spirit'
  additions: DistillingAddition[]
}

const props = defineProps<{
  batchId: string
  sourceVesselId?: string
  defaultRunType?: 'stripping' | 'spirit'
  isFirstRun?: boolean
  forceRunType?: boolean
}>()

const emit = defineEmits<{
  close: [value: ChargeResult | null]
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const itemStore = useItemStore()

// Form state
const stillId = ref('')
const chargeVolumeUnit = ref('gallon')
const runType = ref<'stripping' | 'spirit'>(props.defaultRunType || 'stripping')
const additions = ref<DistillingAddition[]>([])

// ─── Grain-in context ─────────────────────────────────────────────────────
// When the batch is grain-in AND we're charging into a stripping run, the
// fermenter's bulk volume includes grain displacement. Show the operator a
// hint with the effective (liquid) volume next to each source so they
// understand the PG math reflected on the Transfer record.
const batch = computed(() => batchStore.items.find(b => b._id === props.batchId))
const recipe = computed(() => {
  const b = batch.value
  if (!b?.recipe) return null
  return recipeStore.getRecipeById(b.recipe as any) || null
})
const effectiveGrainIn = computed<boolean>(() => {
  const b = batch.value
  const batchOverride = (b?.stages?.mashing as MashingStage | undefined)?.grainIn
  if (typeof batchOverride === 'boolean') return batchOverride
  return !!recipe.value?.grainIn
})
const totalGrainDisplacementGal = computed(() => {
  const r = recipe.value
  if (!r?.items?.length) return 0
  const lookup = new Map<string, any>()
  for (const it of itemStore.items as any[]) {
    lookup.set(String(it._id), {
      extractType: it.extractType as ExtractType | undefined,
      fermentable: it.fermentable,
      displacement: it.displacement,
    })
  }
  return calcGrainDisplacement(
    r.items.map((i: any) => ({ _id: String(i._id), amount: i.amount, unit: i.unit })),
    lookup,
  )
})
const totalBatchBulkGal = computed(() => {
  let sum = 0
  for (const v of vesselStore.items as any[]) {
    for (const c of (v.contents || [])) {
      if (String(c.batch) === String(props.batchId)) sum += Number(c.volume) || 0
    }
  }
  return sum
})
/** True when grain-in correction is meaningful for the current charge: batch
 * is grain-in, recipe has fermentable items with displacement, AND we're
 * charging into a stripping run (post-stripping is already pure liquid). */
const grainInCorrectionActive = computed(() => {
  return (
    effectiveGrainIn.value
    && totalGrainDisplacementGal.value > 0
    && runType.value === 'stripping'
  )
})
/** Effective liquid volume (gal, in chargeVolumeUnit) for a per-vessel entry,
 *  pro-rated by the vessel's share of total batch bulk. */
const effectiveVolumeForVessel = (vesselId: string, enteredVolInUnit: number): number => {
  if (!grainInCorrectionActive.value || enteredVolInUnit <= 0) return enteredVolInUnit
  // Convert entered volume → gallons → apply correction → back to display unit
  const ratioToGal = convertUnitRatio(chargeVolumeUnit.value, 'gallon')
  const enteredGal = enteredVolInUnit * ratioToGal
  const baseBulkGal = totalBatchBulkGal.value > 0 ? totalBatchBulkGal.value : enteredGal
  const share = Math.min(1, enteredGal / baseBulkGal)
  const lineDisplacementGal = totalGrainDisplacementGal.value * share
  const effGal = getEffectiveLiquidVolume(enteredGal, lineDisplacementGal, true)
  return effGal / ratioToGal // back to display unit
}

// Per-vessel charge volumes (vesselId -> volume in chargeVolumeUnit)
const vesselVolumes = ref<Record<string, number | undefined>>({})

const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']

// Source-vessel discovery (filtered by batch presence + run-type compatibility) lives in a composable.
const batchIdRef = computed(() => props.batchId)
const explicitSourceVesselIdRef = computed(() => props.sourceVesselId)
const { sourceVesselOptions } = useSourceVesselOptions(batchIdRef, runType, {
  explicitSourceVesselId: explicitSourceVesselIdRef,
})
type SourceVesselOption = (typeof sourceVesselOptions.value)[number]

// Which vessels are enabled (have a volume > 0 entered)
const enabledVesselIds = computed(() =>
  sourceVesselOptions.value
    .filter((v) => (vesselVolumes.value[v.id] || 0) > 0)
    .map((v) => v.id)
)

// Available volume for a vessel converted to chargeVolumeUnit
const availableInUnit = (vessel: SourceVesselOption) =>
  vessel.availableVolume * convertUnitRatio(vessel.availableVolumeUnit, chargeVolumeUnit.value)

// Still options (with capacity hints) live in a composable.
const { stillOptions } = useStillOptions()

// Total charge volume (sum of all per-vessel inputs)
const totalChargeVolume = computed(() => {
  return sourceVesselOptions.value.reduce((sum, v) => {
    return sum + (vesselVolumes.value[v.id] || 0)
  }, 0)
})

// Weighted-average ABV across vessels with volume entered
const chargeAbv = computed(() => {
  const entries = sourceVesselOptions.value
    .filter((v) => (vesselVolumes.value[v.id] || 0) > 0)
    .map((v) => ({
      volume: vesselVolumes.value[v.id]!,
      abv: v.abv,
    }))
  if (entries.length === 0) return 0
  const totalVol = entries.reduce((s, e) => s + e.volume, 0)
  if (totalVol === 0) return 0
  return entries.reduce((s, e) => s + e.abv * e.volume, 0) / totalVol
})

// Fill max for a single vessel
const fillVesselMax = (vessel: SourceVesselOption) => {
  vesselVolumes.value[vessel.id] = Math.floor(availableInUnit(vessel) * 100) / 100
}

// Fill max for all vessels
const fillAllMax = () => {
  for (const v of sourceVesselOptions.value) {
    fillVesselMax(v)
  }
}

// Clear a vessel's volume
const clearVessel = (vesselId: string) => {
  vesselVolumes.value[vesselId] = undefined
}

// All vessel options for addition sources (stills, tanks, barrels)
const additionVesselOptions = computed(() => [
  ...vesselStore.stills.map((v) => ({ label: `${v.name} (Still)`, value: v._id })),
  ...vesselStore.tanks.map((v) => ({ label: `${v.name} (Tank)`, value: v._id })),
  ...vesselStore.barrels.map((v) => ({ label: `${v.name} (Barrel)`, value: v._id })),
])

// Addition management
const addAddition = () => {
  additions.value.push({
    label: '',
    sourceVessel: '',
    volume: undefined,
    volumeUnit: 'gallon',
    abv: undefined,
  })
}

const removeAddition = (index: number) => {
  additions.value.splice(index, 1)
}

// Auto-fill the default source vessel if provided
if (props.sourceVesselId && sourceVesselOptions.value.some((v) => v.id === props.sourceVesselId)) {
  const vessel = sourceVesselOptions.value.find((v) => v.id === props.sourceVesselId)!
  vesselVolumes.value[vessel.id] = Math.floor(availableInUnit(vessel) * 100) / 100
}

// Validation: submit enabled when still selected AND (total charge > 0 OR any addition has volume > 0)
const canSubmit = computed(() => {
  if (!stillId.value) return false
  const hasCharge = totalChargeVolume.value > 0
  const hasAddition = additions.value.some((a) => (a.volume || 0) > 0)
  return hasCharge || hasAddition
})

const submit = () => {
  const perVessel: VesselCharge[] = sourceVesselOptions.value
    .filter((v) => (vesselVolumes.value[v.id] || 0) > 0)
    .map((v) => ({
      vesselId: v.id,
      volume: vesselVolumes.value[v.id]!,
      volumeUnit: chargeVolumeUnit.value,
    }))

  const vesselIds = perVessel.map((p) => p.vesselId)

  const result: ChargeResult = {
    stillId: stillId.value,
    chargeVolume: totalChargeVolume.value,
    chargeVolumeUnit: chargeVolumeUnit.value,
    chargeAbv: chargeAbv.value,
    chargeSourceVessel: vesselIds[0] || '',
    chargeSourceVessels: vesselIds,
    chargePerVessel: perVessel,
    runType: runType.value,
    additions: additions.value.filter((a) => (a.volume || 0) > 0),
  }
  emit('close', result)
}
</script>

<template>
  <UModal @close="emit('close', null)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-flask-conical" class="text-copper size-5" />
        <span>{{ isFirstRun ? 'Charge Still & Begin Distilling' : 'Charge Still' }}</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-5">
        <!-- Volume Unit selector (shared across all vessel inputs) -->
        <div class="flex items-center justify-between">
          <div class="text-xs text-parchment/60 uppercase tracking-wider">Volume Unit</div>
          <USelect v-model="chargeVolumeUnit" :items="volumeUnits" class="w-28" size="sm" />
        </div>

        <!-- Source Vessels with per-vessel volume inputs -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs text-parchment/60 uppercase tracking-wider">Charge from Vessels</div>
            <UButton
              v-if="sourceVesselOptions.length > 1"
              variant="link"
              size="xs"
              class="text-copper hover:text-gold"
              @click="fillAllMax"
            >
              Fill All Max
            </UButton>
          </div>
          <div v-if="sourceVesselOptions.length === 0" class="text-xs text-parchment/60 italic">
            No vessels contain this batch
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="vessel in sourceVesselOptions"
              :key="vessel.id"
              :class="[
                'rounded-lg border p-3 transition-all',
                (vesselVolumes[vessel.id] || 0) > 0
                  ? 'border-copper/40 bg-copper/10'
                  : 'border-brown/20 bg-brown/5',
              ]"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm text-parchment font-medium">{{ vessel.name }}</span>
                <span class="text-xs text-parchment/50">
                  {{ availableInUnit(vessel).toFixed(1) }} {{ chargeVolumeUnit }} @ {{ vessel.abv.toFixed(1) }}%
                </span>
              </div>
              <div class="flex items-center gap-2">
                <UInput
                  :model-value="vesselVolumes[vessel.id]"
                  @update:model-value="vesselVolumes[vessel.id] = $event as number | undefined"
                  type="number"
                  :max="availableInUnit(vessel)"
                  placeholder="0"
                  step="0.1"
                  size="sm"
                  class="flex-1"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  class="text-parchment/50 shrink-0"
                  @click="fillVesselMax(vessel)"
                >
                  Max
                </UButton>
                <UButton
                  v-if="(vesselVolumes[vessel.id] || 0) > 0"
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-x"
                  class="shrink-0"
                  @click="clearVessel(vessel.id)"
                />
              </div>
              <!-- Per-vessel progress bar -->
              <div v-if="availableInUnit(vessel) > 0 && (vesselVolumes[vessel.id] || 0) > 0" class="mt-1.5">
                <div class="w-full bg-brown/20 rounded-full h-1">
                  <div
                    class="bg-copper rounded-full h-1 transition-all"
                    :style="{ width: `${Math.min(100, ((vesselVolumes[vessel.id] || 0) / availableInUnit(vessel)) * 100)}%` }"
                  />
                </div>
              </div>
              <!-- Grain-in correction hint -->
              <div
                v-if="grainInCorrectionActive && (vesselVolumes[vessel.id] || 0) > 0"
                class="mt-1.5 text-xs text-parchment/60 italic"
              >
                ~{{ effectiveVolumeForVessel(vessel.id, vesselVolumes[vessel.id] || 0).toFixed(2) }}
                {{ chargeVolumeUnit }} effective (grain displacement subtracted)
              </div>
            </div>
          </div>

          <!-- Total charge summary -->
          <div v-if="totalChargeVolume > 0" class="mt-3 rounded-lg border border-copper/30 bg-copper/5 px-3 py-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-parchment/60 uppercase tracking-wider">Total Charge</span>
              <span class="text-sm font-semibold text-copper">
                {{ totalChargeVolume.toFixed(1) }} {{ chargeVolumeUnit }}
                <span v-if="chargeAbv > 0" class="text-parchment/60 font-normal">@ {{ chargeAbv.toFixed(1) }}% ABV</span>
              </span>
            </div>
            <div v-if="enabledVesselIds.length > 1" class="text-xs text-parchment/50 mt-0.5">
              from {{ enabledVesselIds.length }} vessels
            </div>
            <div
              v-if="grainInCorrectionActive"
              class="text-xs text-amber-300/80 mt-1 flex items-start gap-1"
            >
              <UIcon name="i-lucide-info" class="mt-0.5 shrink-0" />
              <span>
                Volume includes grain displacement. PG is computed from effective
                liquid volume on the Transfer record.
              </span>
            </div>
          </div>
        </div>

        <!-- Still -->
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Still</div>
          <USelect
            v-model="stillId"
            :items="stillOptions"
            value-key="value"
            label-key="label"
            placeholder="Select still..."
          />
        </div>

        <!-- Additions -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs text-parchment/60 uppercase tracking-wider">Additions (optional)</div>
            <UButton icon="i-lucide-plus" size="xs" variant="ghost" @click="addAddition">Add</UButton>
          </div>
          <div v-if="additions.length" class="space-y-2">
            <div
              v-for="(addition, i) in additions"
              :key="i"
              class="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-2 rounded border border-brown/10 bg-brown/5"
            >
              <UFormField label="Label">
                <UInput v-model="addition.label" placeholder="Tails, Low wines..." size="sm" />
              </UFormField>
              <UFormField label="Source Vessel">
                <USelect
                  v-model="addition.sourceVessel"
                  :items="additionVesselOptions"
                  value-key="value"
                  label-key="label"
                  placeholder="Vessel"
                  size="sm"
                />
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

        <!-- Run Type -->
        <div v-if="!forceRunType">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Run Type</div>
          <div class="flex gap-2">
            <UButton
              :variant="runType === 'stripping' ? 'solid' : 'outline'"
              :color="runType === 'stripping' ? 'primary' : 'neutral'"
              size="sm"
              @click="runType = 'stripping'"
            >
              Stripping
            </UButton>
            <UButton
              :variant="runType === 'spirit' ? 'solid' : 'outline'"
              :color="runType === 'spirit' ? 'primary' : 'neutral'"
              size="sm"
              @click="runType = 'spirit'"
            >
              Spirit
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="emit('close', null)">Cancel</UButton>
        <UButton :disabled="!canSubmit" @click="submit">
          {{ isFirstRun ? 'Begin Distilling' : 'Charge Still' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
