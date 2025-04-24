<script setup>
const {
  initialWeight,
  initialVolume,
  initialAbv,
  targetAbv,
  waterNeeded,
  steps,
} = useProofingCalculator();
</script>

<template>
  <div class="flex flex-col justify-center gap-3 p-3">
    <div class="grid grid-cols-2 gap-3">
      <UFormField label="Initial Weight">
        <div class="grid grid-cols-2 gap-2">
          <UInput v-model="initialWeight.weight" type="number" />
          <div class="flex-grow">
            <USelect v-model="initialWeight.unit" :items="['kg', 'lb']" />
          </div>
        </div>
      </UFormField>
      <UFormField label="Initial ABV">
        <UInput v-model="initialAbv" type="number">
          <template #trailing>%</template>
        </UInput>
      </UFormField>
    </div>
    <div class="grid grid-cols-2 gap-2 justify-around">
      <UFormField label="Initial Volume">
        <div v-if="initialVolume.unit === 'L'" class="text-center">
          {{ initialVolume.volume * convertUnitRatio("L", "gallon") }} gal /
          {{ initialVolume.volume }} {{ initialVolume.unit }}
        </div>
        <div v-else-if="initialVolume.unit === 'gal'" class="text-center">
          {{ initialVolume.volume }} {{ initialVolume.unit }} /
          {{
            (initialVolume.volume * convertUnitRatio("gallon", "L")).toFixed(2)
          }}
          L
        </div>
      </UFormField>
      <UFormField label="Target ABV">
        <UInput v-model="targetAbv" type="number">
          <template #trailing>%</template>
        </UInput>
      </UFormField>
    </div>
    <div v-for="step in steps" class="grid grid-cols-2 gap-2">
      <UFormField label="Water Added">
        <div class="grid grid-cols-2 gap-2">
          <UInput v-model="step.volume" type="number" />
          <USelect v-model="step.unit" :options="['L', 'gallon']" />
        </div>
      </UFormField>
      <UFormField label="New ABV">
        <UInput v-model="step.abv" type="number">
          <template #trailing>%</template>
        </UInput>
      </UFormField>
    </div>
    <div class="flex gap-2 justify-evenly">
      <UFormField label="Recommended Water">
        <div v-if="waterNeeded?.unit === 'L'">
          {{ waterNeeded?.volume * convertUnitRatio("L", "gallon") }} gal /
          {{ waterNeeded?.volume }} {{ waterNeeded?.unit }}
        </div>
        <div v-else-if="waterNeeded?.unit === 'gal'">
          {{ waterNeeded?.volume }} {{ waterNeeded?.unit }} /
          {{
            (waterNeeded?.volume * convertUnitRatio("gallon", "L")).toFixed(2)
          }}
          L
        </div>
      </UFormField>
      <UFormField label="Add Water">
        <UButton
          @click="
            steps.push({
              volume: 0,
              unit: 'L',
              abv: 0,
            })
          "
          >Add Water</UButton
        >
      </UFormField>
    </div>
  </div>
</template>
