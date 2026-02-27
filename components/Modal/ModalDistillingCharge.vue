<script setup lang="ts">
import type { DistillingAddition } from '~/types'
import { convertUnitRatio } from '~/utils/conversions'

interface ChargeResult {
  stillId: string
  chargeVolume: number
  chargeVolumeUnit: string
  chargeAbv: number
  chargeSourceVessel: string
  runType: 'stripping' | 'spirit'
  additions: DistillingAddition[]
}

const props = defineProps<{
  batchId: string
  sourceVesselId?: string
  defaultRunType?: 'stripping' | 'spirit'
  isFirstRun?: boolean
}>()

const emit = defineEmits<{
  close: [value: ChargeResult | null]
}>()

const vesselStore = useVesselStore()

// Form state
const sourceVessel = ref(props.sourceVesselId || '')
const stillId = ref('')
const chargeVolume = ref<number | undefined>(undefined)
const chargeVolumeUnit = ref('gallon')
const runType = ref<'stripping' | 'spirit'>(props.defaultRunType || 'stripping')
const additions = ref<DistillingAddition[]>([])

const volumeUnits = ['gallon', 'L', 'mL', 'fl oz']

// Vessels containing this batch
const sourceVesselOptions = computed(() => {
  return vesselStore.vessels
    .filter((v) => v.contents?.some((c) => c.batch === props.batchId && c.volume > 0.001))
    .map((v) => {
      const entry = v.contents!.find((c) => c.batch === props.batchId)!
      return {
        label: `${v.name} (${entry.volume.toFixed(1)} ${entry.volumeUnit} @ ${entry.abv.toFixed(1)}%)`,
        value: v._id,
      }
    })
})

// Still options with capacity hints (convert current to vessel's stats unit)
const stillOptions = computed(() => {
  return vesselStore.stills.map((v) => {
    const statsUnit = v.stats?.volumeUnit || 'gal'
    const currentVol = (v.current?.volume || 0) * convertUnitRatio(v.current?.volumeUnit || statsUnit, statsUnit)
    const capacity = v.stats?.volume || 0
    const hint = capacity > 0
      ? `${currentVol.toFixed(1)}/${capacity.toFixed(0)} ${statsUnit}`
      : currentVol > 0
        ? `${currentVol.toFixed(1)} ${statsUnit} in use`
        : 'empty'
    return {
      label: `${v.name} (${hint})`,
      value: v._id,
    }
  })
})

// Remaining volume from selected source vessel for this batch, converted to chargeVolumeUnit
const remainingVolume = computed(() => {
  if (!sourceVessel.value) return 0
  const v = vesselStore.getVesselById(sourceVessel.value)
  if (!v?.contents) return 0
  const entry = v.contents.find((c) => c.batch === props.batchId)
  if (!entry) return 0
  return entry.volume * convertUnitRatio(entry.volumeUnit, chargeVolumeUnit.value)
})

const remainingAbv = computed(() => {
  if (!sourceVessel.value) return 0
  const v = vesselStore.getVesselById(sourceVessel.value)
  if (!v?.contents) return 0
  const entry = v.contents.find((c) => c.batch === props.batchId)
  return entry?.abv || 0
})

// Charge progress as percentage of remaining
const chargePercent = computed(() => {
  if (!remainingVolume.value || !chargeVolume.value) return 0
  return Math.min(100, (chargeVolume.value / remainingVolume.value) * 100)
})

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

// Validation: submit enabled when still selected AND (chargeVolume > 0 OR any addition has volume > 0)
const canSubmit = computed(() => {
  if (!stillId.value) return false
  const hasCharge = (chargeVolume.value || 0) > 0
  const hasAddition = additions.value.some((a) => (a.volume || 0) > 0)
  return hasCharge || hasAddition
})

const submit = () => {
  const result: ChargeResult = {
    stillId: stillId.value,
    chargeVolume: chargeVolume.value || 0,
    chargeVolumeUnit: chargeVolumeUnit.value,
    chargeAbv: remainingAbv.value,
    chargeSourceVessel: sourceVessel.value,
    runType: runType.value,
    additions: additions.value.filter((a) => (a.volume || 0) > 0),
  }
  emit('close', result)
}

// Fill max volume shortcut
const fillMax = () => {
  chargeVolume.value = Math.floor(remainingVolume.value * 100) / 100
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
        <!-- Source Vessel -->
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Source Vessel</div>
          <USelect
            v-model="sourceVessel"
            :items="sourceVesselOptions"
            value-key="value"
            label-key="label"
            placeholder="Select source vessel..."
          />
          <div v-if="sourceVessel && remainingVolume > 0" class="mt-1 text-xs text-parchment/50">
            {{ remainingVolume.toFixed(1) }} {{ chargeVolumeUnit }} remaining @ {{ remainingAbv.toFixed(1) }}% ABV
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

        <!-- Charge Volume -->
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Charge Volume</div>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-1">
              <UInput
                v-model.number="chargeVolume"
                type="number"
                :max="remainingVolume"
                placeholder="0"
                step="0.1"
              />
            </div>
            <div class="col-span-1">
              <USelect v-model="chargeVolumeUnit" :items="volumeUnits" />
            </div>
            <div class="col-span-1 flex items-center">
              <UButton
                size="xs"
                variant="ghost"
                class="text-parchment/50"
                @click="fillMax"
                :disabled="!sourceVessel || remainingVolume <= 0"
              >
                Fill Max
              </UButton>
            </div>
          </div>
          <!-- Progress bar -->
          <div v-if="remainingVolume > 0" class="mt-2">
            <div class="w-full bg-brown/20 rounded-full h-1.5">
              <div
                class="bg-copper rounded-full h-1.5 transition-all"
                :style="{ width: `${chargePercent}%` }"
              />
            </div>
            <div class="flex justify-between text-xs text-parchment/40 mt-0.5">
              <span>{{ chargeVolume || 0 }} {{ chargeVolumeUnit }}</span>
              <span>{{ remainingVolume.toFixed(1) }} available</span>
            </div>
          </div>
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
        <div>
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
