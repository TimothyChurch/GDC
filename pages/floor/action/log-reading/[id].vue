<script setup lang="ts">
import { sortByDateAsc } from '~/utils/helpers'

definePageMeta({ layout: 'floor', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const batchId = computed(() => route.params.id as string)
const batch = computed(() => batchStore.getBatchById(batchId.value))
const recipeName = computed(() =>
  batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe as unknown as string)?.name : null
)

const lastReading = computed(() => {
  const readings = (batch.value?.stages?.fermenting as any)?.readings || []
  if (readings.length === 0) return null
  return sortByDateAsc(readings).slice(-1)[0]
})

type Field = 'gravity' | 'temperature' | 'pH'
const activeField = ref<Field>('gravity')

const gravity = ref<number | null>(null)
const temperature = ref<number | null>(null)
const pH = ref<number | null>(null)
const temperatureUnit = ref<'F' | 'C'>('F')

const padValue = computed({
  get() {
    if (activeField.value === 'gravity') return gravity.value
    if (activeField.value === 'temperature') return temperature.value
    return pH.value
  },
  set(v: number | null) {
    if (activeField.value === 'gravity') gravity.value = v
    else if (activeField.value === 'temperature') temperature.value = v
    else pH.value = v
  },
})

const padUnit = computed(() => {
  if (activeField.value === 'gravity') return 'SG'
  if (activeField.value === 'temperature') return `°${temperatureUnit.value}`
  return 'pH'
})

const padPlaceholder = computed(() => {
  if (activeField.value === 'gravity') return '1.050'
  if (activeField.value === 'temperature') return '72'
  return '4.5'
})

const canSubmit = computed(() =>
  gravity.value !== null || temperature.value !== null || pH.value !== null
)

const saving = ref(false)
async function submit() {
  if (!batch.value || !canSubmit.value) return
  saving.value = true
  try {
    const reading = {
      date: new Date(),
      gravity: gravity.value ?? undefined,
      temperature: temperature.value ?? undefined,
      temperatureUnit: temperature.value !== null ? temperatureUnit.value : undefined,
      pH: pH.value ?? undefined,
      notes: '',
    }
    const existing = (batch.value.stages?.fermenting as any)?.readings || []
    const readings = [...existing, reading]
    const details = [
      reading.gravity != null ? `SG ${reading.gravity}` : null,
      reading.temperature != null ? `${reading.temperature}°${temperatureUnit.value}` : null,
      reading.pH != null ? `pH ${reading.pH}` : null,
    ].filter(Boolean).join(', ')
    await batchStore.updateStageData(
      batch.value._id,
      'Fermenting',
      { readings },
      `Reading from /floor: ${details}`
    )
    toast.add({
      title: 'Reading saved',
      description: details,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    router.back()
  } catch (err: unknown) {
    toast.add({
      title: 'Failed to save reading',
      description: getErrorMessage(err),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}

const fieldButtons: { key: Field; label: string; icon: string }[] = [
  { key: 'gravity', label: 'Gravity', icon: 'i-lucide-droplet' },
  { key: 'temperature', label: 'Temp', icon: 'i-lucide-thermometer' },
  { key: 'pH', label: 'pH', icon: 'i-lucide-flask-conical' },
]
</script>

<template>
  <div v-if="!batch" class="py-12 text-center text-parchment/50">
    <UIcon name="i-lucide-loader-2" class="text-3xl animate-spin mx-auto mb-2" />
    <p>Loading batch…</p>
  </div>

  <div v-else class="space-y-4 pb-32">
    <!-- Batch header -->
    <div class="bg-charcoal rounded-xl border border-yellow-500/20 p-4">
      <div class="text-xs uppercase tracking-wider text-parchment/50 mb-1">Logging reading for</div>
      <div class="text-xl font-bold text-parchment font-[Cormorant_Garamond] truncate">
        {{ recipeName || 'Batch' }}
      </div>
      <div v-if="lastReading" class="mt-2 text-xs text-parchment/50 tabular-nums">
        Last: {{ lastReading.gravity ? `SG ${lastReading.gravity}` : '' }}
        {{ lastReading.temperature ? `· ${lastReading.temperature}°${lastReading.temperatureUnit || 'F'}` : '' }}
        {{ lastReading.pH ? `· pH ${lastReading.pH}` : '' }}
        — {{ new Date(lastReading.date).toLocaleDateString() }}
      </div>
    </div>

    <!-- Field selector -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="f in fieldButtons"
        :key="f.key"
        type="button"
        :class="[
          'flex flex-col items-center justify-center gap-1 py-3 rounded-lg border transition-colors min-h-[64px]',
          activeField === f.key
            ? 'bg-gold/15 border-gold/30 text-gold'
            : 'bg-charcoal border-brown/30 text-parchment/60 active:bg-brown/20',
        ]"
        @click="activeField = f.key"
      >
        <UIcon :name="f.icon" class="text-xl" />
        <span class="text-xs font-medium">{{ f.label }}</span>
        <span
          v-if="f.key === 'gravity' && gravity !== null"
          class="text-[10px] text-parchment/50 tabular-nums"
        >
          {{ gravity }}
        </span>
        <span
          v-if="f.key === 'temperature' && temperature !== null"
          class="text-[10px] text-parchment/50 tabular-nums"
        >
          {{ temperature }}°{{ temperatureUnit }}
        </span>
        <span
          v-if="f.key === 'pH' && pH !== null"
          class="text-[10px] text-parchment/50 tabular-nums"
        >
          {{ pH }}
        </span>
      </button>
    </div>

    <!-- Temperature unit toggle, only when temperature field is active -->
    <div v-if="activeField === 'temperature'" class="flex items-center justify-center gap-2">
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium min-h-[40px]',
          temperatureUnit === 'F' ? 'bg-gold/15 text-gold' : 'bg-brown/15 text-parchment/60',
        ]"
        @click="temperatureUnit = 'F'"
      >
        °F
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium min-h-[40px]',
          temperatureUnit === 'C' ? 'bg-gold/15 text-gold' : 'bg-brown/15 text-parchment/60',
        ]"
        @click="temperatureUnit = 'C'"
      >
        °C
      </button>
    </div>

    <!-- Number pad -->
    <FloorNumberPad
      v-model="padValue"
      :unit="padUnit"
      :placeholder="padPlaceholder"
    />

    <!-- Submit (sticky thumb-zone bottom) -->
    <div class="fixed bottom-0 left-0 right-0 p-4 border-t border-brown/30 bg-espresso/95 backdrop-blur">
      <div class="max-w-3xl mx-auto">
        <button
          type="button"
          :class="[
            'w-full h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors',
            canSubmit
              ? 'bg-gold text-charcoal active:bg-gold/90'
              : 'bg-brown/15 text-parchment/30 cursor-not-allowed',
          ]"
          :disabled="!canSubmit || saving"
          @click="submit"
        >
          <UIcon v-if="saving" name="i-lucide-loader-2" class="animate-spin text-xl" />
          <UIcon v-else name="i-lucide-check" class="text-xl" />
          {{ saving ? 'Saving…' : 'Save Reading' }}
        </button>
      </div>
    </div>
  </div>
</template>
