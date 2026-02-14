<script setup>
const {
  initialWeight,
  initialVolume,
  initialAbv,
  targetAbv,
  currentVolume,
  waterNeeded,
  steps,
  removeStep,
  clear,
} = useProofingCalculator();

const addStep = () => {
  steps.push({ volume: 0, unit: 'L', abv: 0 });
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-6 space-y-6">
    <!-- Initial Values -->
    <div>
      <h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Initial Values</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Initial Weight">
          <div class="grid grid-cols-2 gap-2">
            <UInput v-model="initialWeight.weight" type="number" min="0" />
            <USelect v-model="initialWeight.unit" :items="['kg', 'lb']" />
          </div>
        </UFormField>
        <UFormField label="Initial ABV">
          <UInput v-model="initialAbv" type="number" min="0" max="100">
            <template #trailing>%</template>
          </UInput>
          <span class="text-xs text-parchment/60 mt-0.5">Proof: {{ (initialAbv * 2).toFixed(0) }}</span>
        </UFormField>
      </div>
    </div>

    <!-- Computed Initial Volume -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="Initial Volume">
        <div class="text-sm text-parchment/80 bg-brown/15 rounded-lg px-3 py-2 border border-brown/20">
          <template v-if="initialVolume.unit === 'L'">
            {{ (initialVolume.volume * convertUnitRatio('L', 'gallon')).toFixed(2) }} gal /
            {{ initialVolume.volume }} {{ initialVolume.unit }}
          </template>
          <template v-else-if="initialVolume.unit === 'gal'">
            {{ initialVolume.volume }} {{ initialVolume.unit }} /
            {{ (initialVolume.volume * convertUnitRatio('gallon', 'L')).toFixed(2) }} L
          </template>
        </div>
      </UFormField>
      <UFormField label="Target ABV">
        <UInput v-model="targetAbv" type="number" min="0" max="100">
          <template #trailing>%</template>
        </UInput>
        <span v-if="targetAbv" class="text-xs text-parchment/60 mt-0.5">Proof: {{ (targetAbv * 2).toFixed(0) }}</span>
      </UFormField>
    </div>

    <!-- Steps -->
    <div v-if="steps.length > 0">
      <h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Water Additions</h3>
      <div class="space-y-3">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="bg-brown/10 rounded-lg border border-brown/20 p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-parchment/50">Step {{ index + 1 }}</span>
            <UButton
              icon="i-lucide-x"
              size="xs"
              variant="ghost"
              color="error"
              @click="removeStep(index)"
              aria-label="Remove step"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="Water Added">
              <div class="grid grid-cols-2 gap-2">
                <UInput v-model="step.volume" type="number" min="0" />
                <USelect v-model="step.unit" :items="['L', 'gallon']" />
              </div>
            </UFormField>
            <UFormField label="New ABV">
              <UInput v-model="step.abv" type="number" min="0" max="100">
                <template #trailing>%</template>
              </UInput>
              <span v-if="step.abv" class="text-xs text-parchment/60 mt-0.5">Proof: {{ (step.abv * 2).toFixed(0) }}</span>
            </UFormField>
          </div>
          <div class="text-xs text-parchment/60 mt-2">
            Cumulative volume: {{ currentVolume.volume }} {{ currentVolume.unit }}
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="bg-brown/10 rounded-lg border border-brown/20 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-3">Results</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div class="text-xs text-parchment/60 mb-1">Current Volume</div>
          <div class="text-sm text-parchment/80">
            {{ currentVolume.volume }} {{ currentVolume.unit }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Recommended Water</div>
          <div v-if="waterNeeded" class="text-sm text-parchment/80">
            <template v-if="waterNeeded.unit === 'L'">
              {{ (waterNeeded.volume * convertUnitRatio('L', 'gallon')).toFixed(2) }} gal /
              {{ waterNeeded.volume }} {{ waterNeeded.unit }}
            </template>
            <template v-else-if="waterNeeded.unit === 'gal'">
              {{ waterNeeded.volume }} {{ waterNeeded.unit }} /
              {{ (waterNeeded.volume * convertUnitRatio('gallon', 'L')).toFixed(2) }} L
            </template>
          </div>
          <div v-else class="text-sm text-parchment/50">Set target ABV to calculate</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton variant="outline" @click="clear" icon="i-lucide-trash-2">Clear All</UButton>
      <UButton @click="addStep" icon="i-lucide-plus">Add Step</UButton>
    </div>
  </div>
</template>
