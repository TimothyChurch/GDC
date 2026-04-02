<script setup lang="ts">
import { convertUnitRatio } from '~/utils/conversions'
import { calculateProofGallons } from '~/utils/proofGallons'

interface BarrelEntry {
  barrelId: string
  volume: number
  volumeUnit: string
}

interface BarrelFillResult {
  entryAbv: number
  waterAdded: number
  waterAddedUnit: string
  finalVolume: number
  finalVolumeUnit: string
  barrels: BarrelEntry[]
}

const props = defineProps<{
  batchId: string
  sourceVolume: number
  sourceVolumeUnit: string
  sourceAbv: number
}>()

const emit = defineEmits<{
  close: [value: BarrelFillResult | null]
}>()

const vesselStore = useVesselStore()

const volumeUnits = ['gallon', 'L']

// Entry proof / ABV
const entryAbv = ref(props.sourceAbv || 0)

// Water calculation
const waterNeeded = computed(() => {
  if (!entryAbv.value || !props.sourceAbv || entryAbv.value >= props.sourceAbv) return 0
  // V_final = V_initial * ABV_initial / ABV_target
  // Water = V_final - V_initial
  const finalVol = props.sourceVolume * props.sourceAbv / entryAbv.value
  return Math.max(0, finalVol - props.sourceVolume)
})

// Volume after proofing
const proovedVolume = computed(() => {
  if (!entryAbv.value || !props.sourceAbv) return props.sourceVolume
  if (entryAbv.value >= props.sourceAbv) return props.sourceVolume
  return props.sourceVolume * props.sourceAbv / entryAbv.value
})

const proovedProofGallons = computed(() => {
  if (!proovedVolume.value || !entryAbv.value) return 0
  return calculateProofGallons(proovedVolume.value, props.sourceVolumeUnit, entryAbv.value)
})

// Barrel entries
const barrels = ref<BarrelEntry[]>([
  { barrelId: '', volume: 0, volumeUnit: props.sourceVolumeUnit || 'gallon' },
])

const addBarrel = () => {
  barrels.value.push({ barrelId: '', volume: 0, volumeUnit: props.sourceVolumeUnit || 'gallon' })
}

const removeBarrel = (index: number) => {
  barrels.value.splice(index, 1)
}

// Available empty barrels (exclude already-selected ones)
const barrelOptions = computed(() => {
  const selected = new Set(barrels.value.map(b => b.barrelId).filter(Boolean))
  return vesselStore.emptyBarrels.map(v => {
    const cap = v.stats?.volume ? `${v.stats.volume} ${v.stats.volumeUnit || 'gal'}` : ''
    const size = v.barrel?.size ? `${v.barrel.size}` : ''
    const hint = [size, cap].filter(Boolean).join(' — ')
    return {
      label: hint ? `${v.name} (${hint})` : v.name,
      value: v._id,
      disabled: selected.has(v._id),
      capacity: v.stats?.volume || 0,
      capacityUnit: v.stats?.volumeUnit || 'gallon',
    }
  })
})

// Get capacity for a barrel
const getBarrelCapacity = (barrelId: string): number => {
  if (!barrelId) return 0
  const opt = barrelOptions.value.find(o => o.value === barrelId)
  if (!opt || !opt.capacity) return 0
  const barrel = barrels.value.find(b => b.barrelId === barrelId)
  return opt.capacity * convertUnitRatio(opt.capacityUnit, barrel?.volumeUnit || props.sourceVolumeUnit)
}

// Fill barrel to capacity shortcut
const fillBarrel = (index: number) => {
  const entry = barrels.value[index]
  if (!entry?.barrelId) return
  const cap = getBarrelCapacity(entry.barrelId)
  const remaining = availableVolume.value + (entry.volume || 0) // add back current barrel's alloc
  entry.volume = Math.min(cap, remaining)
}

// Total allocated volume across all barrels
const allocatedVolume = computed(() => {
  return barrels.value.reduce((sum, b) => {
    return sum + (b.volume || 0) * convertUnitRatio(b.volumeUnit, props.sourceVolumeUnit)
  }, 0)
})

// Available volume remaining
const availableVolume = computed(() => {
  return Math.max(0, proovedVolume.value - allocatedVolume.value)
})

// Allocation percentage
const allocationPercent = computed(() => {
  if (proovedVolume.value <= 0) return 0
  return Math.min(100, (allocatedVolume.value / proovedVolume.value) * 100)
})

// Validation
const canSubmit = computed(() => {
  if (barrels.value.length === 0) return false
  // Every barrel must be selected and have volume
  const allValid = barrels.value.every(b => b.barrelId && b.volume > 0)
  if (!allValid) return false
  // No duplicate barrels
  const ids = barrels.value.map(b => b.barrelId)
  if (new Set(ids).size !== ids.length) return false
  // Total allocated must not exceed available
  if (allocatedVolume.value > proovedVolume.value + 0.01) return false
  return true
})

const submit = () => {
  const result: BarrelFillResult = {
    entryAbv: entryAbv.value,
    waterAdded: waterNeeded.value,
    waterAddedUnit: props.sourceVolumeUnit,
    finalVolume: proovedVolume.value,
    finalVolumeUnit: props.sourceVolumeUnit,
    barrels: barrels.value.filter(b => b.barrelId && b.volume > 0),
  }
  emit('close', result)
}

// Auto-fill first barrel when only one
const autoFillSingle = () => {
  if (barrels.value.length === 1 && barrels.value[0]?.barrelId && barrels.value[0]?.volume === 0) {
    fillBarrel(0)
  }
}
watch(() => barrels.value[0]?.barrelId, () => autoFillSingle())
watch(proovedVolume, () => autoFillSingle())

// Short unit label
const shortUnit = (unit: string) => unit.replace(/gallon/i, 'gal').replace(/liter/i, 'L')
</script>

<template>
  <UModal @close="emit('close', null)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-cylinder" class="text-amber size-5" />
        <span>Fill Barrels</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-5">
        <!-- Source info -->
        <div class="rounded-lg border border-brown/20 bg-brown/5 p-3">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Spirit from Storage</div>
          <div class="flex flex-wrap gap-4 text-sm text-parchment">
            <span>{{ sourceVolume.toFixed(1) }} {{ shortUnit(sourceVolumeUnit) }}</span>
            <span>{{ sourceAbv.toFixed(1) }}% ABV</span>
            <span class="text-purple-400 font-semibold">
              {{ calculateProofGallons(sourceVolume, sourceVolumeUnit, sourceAbv).toFixed(2) }} PG
            </span>
          </div>
        </div>

        <!-- Entry proof / proofing down -->
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Barrel Entry ABV</div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Target ABV %">
              <UInput
                v-model.number="entryAbv"
                type="number"
                :min="0"
                :max="sourceAbv"
                step="0.1"
                placeholder="62.5"
              />
            </UFormField>
            <div class="flex flex-col justify-end">
              <div v-if="waterNeeded > 0" class="text-sm text-cyan-400">
                <UIcon name="i-lucide-droplets" class="inline text-xs" />
                Add {{ waterNeeded.toFixed(1) }} {{ shortUnit(sourceVolumeUnit) }} water
              </div>
              <div v-else class="text-sm text-parchment/60">
                No proofing needed
              </div>
            </div>
          </div>
          <!-- Post-proof summary -->
          <div v-if="waterNeeded > 0" class="mt-2 text-xs text-parchment/50">
            After proofing: {{ proovedVolume.toFixed(1) }} {{ shortUnit(sourceVolumeUnit) }}
            @ {{ entryAbv.toFixed(1) }}% ABV
            ({{ proovedProofGallons.toFixed(2) }} PG)
          </div>
        </div>

        <!-- Barrel allocation -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs text-parchment/60 uppercase tracking-wider">Barrels</div>
            <UButton icon="i-lucide-plus" size="xs" variant="ghost" @click="addBarrel">Add Barrel</UButton>
          </div>

          <div class="space-y-2">
            <div
              v-for="(entry, i) in barrels"
              :key="i"
              class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-3 rounded-lg border border-brown/15 bg-brown/5"
            >
              <UFormField label="Barrel">
                <USelect
                  v-model="entry.barrelId"
                  :items="barrelOptions"
                  value-key="value"
                  label-key="label"
                  placeholder="Select barrel..."
                />
              </UFormField>
              <UFormField label="Volume">
                <UInput
                  v-model.number="entry.volume"
                  type="number"
                  :min="0"
                  step="0.1"
                  placeholder="0"
                  class="w-24"
                />
              </UFormField>
              <UFormField label="Unit">
                <USelect v-model="entry.volumeUnit" :items="volumeUnits" class="w-24" />
              </UFormField>
              <div class="flex items-end gap-1 pb-0.5">
                <UButton
                  v-if="entry.barrelId"
                  icon="i-lucide-maximize-2"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="fillBarrel(i)"
                  title="Fill to capacity"
                />
                <UButton
                  v-if="barrels.length > 1"
                  icon="i-lucide-x"
                  variant="ghost"
                  color="error"
                  size="xs"
                  @click="removeBarrel(i)"
                />
              </div>
            </div>
          </div>

          <!-- Allocation progress -->
          <div class="mt-3">
            <div class="w-full bg-brown/20 rounded-full h-2">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="allocatedVolume > proovedVolume + 0.01 ? 'bg-red-500' : 'bg-amber-500'"
                :style="{ width: `${allocationPercent}%` }"
              />
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span :class="allocatedVolume > proovedVolume + 0.01 ? 'text-red-400' : 'text-parchment/50'">
                {{ allocatedVolume.toFixed(1) }} {{ shortUnit(sourceVolumeUnit) }} allocated
              </span>
              <span class="text-parchment/60">
                {{ availableVolume.toFixed(1) }} {{ shortUnit(sourceVolumeUnit) }} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="emit('close', null)">Cancel</UButton>
        <UButton :disabled="!canSubmit" @click="submit">
          Fill {{ barrels.filter(b => b.barrelId).length }} {{ barrels.filter(b => b.barrelId).length === 1 ? 'Barrel' : 'Barrels' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
