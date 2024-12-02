<script setup>
// Weight to ABV input variables
const weightToAbv = reactive({
  lbs: undefined,
  kg: undefined,
  abv: undefined,
});
// Weight to ABV computed variables
const weightToAbvGallons = computed(() => {
  return imperialWeightToVolume(weightToAbv.lbs, weightToAbv.abv).toFixed(2);
});
const weightToAbvLiters = computed(() => {
  return metricWeightToVolume(weightToAbv.kg, weightToAbv.abv).toFixed(2);
});
// Proofing down Input variables
const proofingDown = reactive({
  gallon: undefined,
  liter: undefined,
  initialAbv: undefined,
  targetAbv: undefined,
});
// Proofing down computed variables
const proofingDownVolumeGallons = computed(() => {
  return (
    (proofingDown.gallon * proofingDown.initialAbv) /
    proofingDown.targetAbv
  ).toFixed(2);
});
const proofingDownVolumeLiters = computed(() => {
  return (
    (proofingDown.liter * proofingDown.initialAbv) /
    proofingDown.targetAbv
  ).toFixed(2);
});
const proofingDownWaterNeededGallons = computed(() => {
  return (proofingDownVolumeGallons.value - proofingDown.gallon).toFixed(2);
});
const proofingDownWaterNeededLiters = computed(() => {
  return (proofingDownVolumeLiters.value - proofingDown.liter).toFixed(2);
});
const proofingDownRecommendedGallons = computed(() => {
  return (proofingDownWaterNeededGallons.value * 0.75).toFixed(2);
});
const proofingDownRecommendedLiters = computed(() => {
  return (proofingDownWaterNeededLiters.value * 0.75).toFixed(2);
});
// Step Proofing Input Variables
const stepProofing = reactive({
  initialAbv: undefined,
  waterAddedLiter: undefined,
  waterAddedGallon: undefined,
  newAbv: undefined,
  targetAbv: undefined,
});
// Step Proofing computed variables
const stepProofingCurrentVolumeGallons = computed(() => {
  return (
    -(stepProofing.waterAddedGallon * stepProofing.initialAbv) /
    (stepProofing.newAbv - stepProofing.initialAbv)
  ).toFixed(2);
});
const stepProofingCurrentVolumeLiters = computed(() => {
  return (
    -(stepProofing.waterAddedLiter * stepProofing.initialAbv) /
    (stepProofing.newAbv - stepProofing.initialAbv)
  ).toFixed(2);
});
const stepProofingTargetVolumeGallons = computed(() => {
  return (
    (stepProofingCurrentVolumeGallons.value * stepProofing.newAbv) /
    stepProofing.targetAbv
  ).toFixed(2);
});
const stepProofingTargetVolumeLiters = computed(() => {
  return (
    (stepProofingCurrentVolumeLiters.value * stepProofing.newAbv) /
    stepProofing.targetAbv
  ).toFixed(2);
});
const stepProofingWaterNeededGallons = computed(() => {
  return (
    stepProofingTargetVolumeGallons.value -
    stepProofingCurrentVolumeGallons.value
  ).toFixed(2);
});
const stepProofingWaterNeededLiters = computed(() => {
  return (
    stepProofingTargetVolumeLiters.value - stepProofingCurrentVolumeLiters.value
  ).toFixed(2);
});
const stepProofingRecommendedGallons = computed(() => {
  return (stepProofingWaterNeededGallons.value * 0.75).toFixed(2);
});
const stepProofingRecommendedLiters = computed(() => {
  return (stepProofingWaterNeededLiters.value * 0.75).toFixed(2);
});
</script>

<template>
  <div class="flex justify-center">
    <div class="flex flex-col gap-3 justify-center px-auto p-3">
      <h1 class="self-center text-xl">Weight to ABV</h1>
      <div class="grid grid-cols-2 gap-3 justify-center">
        <UFormGroup label="Weight" class="gap-1 col-span-2">
          <div class="grid grid-cols-2 gap-2">
            <UInput
              type="number"
              v-model="weightToAbv.lbs"
              :min="0"
              :max="1000"
              @change="weightToAbv.kg = lbToKg(weightToAbv.lbs).toFixed(2)"
            >
              <template #trailing> lbs </template>
            </UInput>
            <UInput
              type="number"
              v-model="weightToAbv.kg"
              :min="0"
              :max="1000"
              @change="weightToAbv.lbs = kgToLb(weightToAbv.kg).toFixed(2)"
            >
              <template #trailing> kg </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="ABV" class="col-span-2">
          <UInput type="number" v-model="weightToAbv.abv" />
        </UFormGroup>
        <UFormGroup label="Volume" class="col-span-2">
          <div class="grid grid-cols-2 gap-2">
            <UInput type="number" v-model="weightToAbvGallons" disabled>
              <template #trailing> gal </template>
            </UInput>
            <UInput type="number" v-model="weightToAbvLiters" disabled>
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
      </div>
      <h1 class="self-center text-xl">Proofing Down</h1>
      <div class="grid grid-cols-1 gap-3 justify-center">
        <UFormGroup label="Volume" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="proofingDown.gallon"
              @change="
                proofingDown.liter = gallonToLiter(proofingDown.gallon).toFixed(
                  2
                )
              "
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="proofingDown.liter"
              @change="
                proofingDown.gallon = literToGallon(proofingDown.liter).toFixed(
                  2
                )
              "
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Initial ABV" class="col-span-1">
          <UInput type="number" v-model="proofingDown.initialAbv" />
        </UFormGroup>
        <UFormGroup label="Target ABV" class="col-span-1">
          <UInput type="number" v-model="proofingDown.targetAbv" />
        </UFormGroup>
        <UFormGroup label="Target Volume" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput type="number" v-model="proofingDownVolumeGallons" disabled>
              <template #trailing> gal </template>
            </UInput>
            <UInput type="number" v-model="proofingDownVolumeLiters" disabled>
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Water Needed" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="proofingDownWaterNeededGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="proofingDownWaterNeededLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Recommended Step" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="proofingDownRecommendedGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="proofingDownRecommendedLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
      </div>
      <h1 class="self-center text-xl">Stepped Proofing</h1>
      <div class="grid grid-cols-1 gap-3 justify-center">
        <UFormGroup label="Initial ABV" class="col-span-1">
          <UInput type="number" v-model="stepProofing.initialAbv" />
        </UFormGroup>
        <UFormGroup label="Water Added" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="stepProofing.waterAddedGallon"
              @change="
                stepProofing.waterAddedLiter = gallonToLiter(
                  stepProofing.waterAddedGallon
                ).toFixed(2)
              "
            >
              <template #trailing> gal </template>
            </UInput>

            <UInput
              type="number"
              v-model="stepProofing.waterAddedLiter"
              @change="
                stepProofing.waterAddedGallon = literToGallon(
                  stepProofing.waterAddedLiter
                ).toFixed(2)
              "
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="New ABV" class="col-span-1">
          <UInput type="number" v-model="stepProofing.newAbv" />
        </UFormGroup>
        <UFormGroup label="Target ABV" class="col-span-1">
          <UInput type="number" v-model="stepProofing.targetAbv" />
        </UFormGroup>
        <UFormGroup label="Current Volume" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="stepProofingCurrentVolumeGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="stepProofingCurrentVolumeLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Target Volume" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="stepProofingTargetVolumeGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="stepProofingTargetVolumeLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Water Needed" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="stepProofingWaterNeededGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="stepProofingWaterNeededLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
        <UFormGroup label="Recommended Step" class="col-span-1">
          <div class="grid grid-cols-2 gap-1">
            <UInput
              type="number"
              v-model="stepProofingRecommendedGallons"
              disabled
            >
              <template #trailing> gal </template>
            </UInput>
            <UInput
              type="number"
              v-model="stepProofingRecommendedLiters"
              disabled
            >
              <template #trailing> L </template>
            </UInput>
          </div>
        </UFormGroup>
      </div>
    </div>
  </div>
</template>
