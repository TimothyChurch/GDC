<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const productionsStore = useProductionStore();
const vesselStore = useVesselStore();
const bottleStore = useBottleStore();
const itemStore = useItemStore();
const recipeStore = useRecipeStore();
const batchStore = useBatchStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => productionsStore.production,
  async onSave(data) {
    data.productionCost = productionCost.value;
    data.bottleCost = data.quantity > 0 ? productionCost.value / data.quantity : 0;
    Object.assign(productionsStore.production, data);
    await productionsStore.updateProduction();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;
const currentStep = ref(1);

const vesselLabels = computed(() => {
  const vessels = vesselStore.vessels.filter(
    (v) => v.type.toLowerCase() === 'barrel' || v.type.toLowerCase() === 'tank'
  );
  return vessels.map((vessel) => {
    if (!vessel.contents || vessel.contents.length === 0) {
      return { _id: vessel._id, name: vessel.name + ' - empty' };
    }
    const recipeNames = vessel.contents.map((content: { batch: string }) => {
      const batch = batchStore.getBatchById(content.batch);
      const recipe = recipeStore.getRecipeById(batch?.recipe?.toString() as string);
      return recipe?.name || 'empty';
    });
    return { _id: vessel._id, name: vessel.name + ' - ' + recipeNames.join(', ') };
  });
});

const selectedVesselDetails = computed(() => {
  if (!localData.value.vessel?.length) return [] as { name: string; contents: string[]; volume?: number; volumeUnit?: string }[];
  return localData.value.vessel.reduce((acc: { name: string; contents: string[]; volume?: number; volumeUnit?: string }[], vid: any) => {
    const v = vesselStore.getVesselById(vid as unknown as string);
    if (!v) return acc;
    const contentsNames = v.contents?.map(c => {
      const batch = batchStore.getBatchById(c.batch);
      return batch?.recipe ? recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown' : 'Unknown';
    }) || [];
    acc.push({ name: v.name, contents: contentsNames, volume: v.current?.volume, volumeUnit: v.current?.volumeUnit });
    return acc;
  }, []);
});

const productionCost = computed(() => {
  let batchCost = 0;
  let barrelCost = 0;
  if (localData.value.vessel?.length > 0) {
    localData.value.vessel.forEach((vid: any) => {
      const v = vesselStore.getVesselById(vid as unknown as string);
      v?.contents?.forEach((c: { cost: number }) => (batchCost += c.cost || 0));
      barrelCost += v?.barrel?.cost || 0;
    });
  }
  const bottleCost = localData.value.bottling?.glassware
    ? (latestPrice(localData.value.bottling.glassware as unknown as string) as number) || 0
    : 0;
  const capCost = localData.value.bottling?.cap
    ? (latestPrice(localData.value.bottling.cap as unknown as string) as number) || 0
    : 0;
  const labelCost = localData.value.bottling?.label
    ? (latestPrice(localData.value.bottling.label as unknown as string) as number) || 0
    : 0;
  return batchCost + barrelCost + (bottleCost + capCost + labelCost) * (localData.value.quantity || 0);
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return localData.value.vessel?.length > 0;
    case 2: return !!localData.value.bottle && localData.value.quantity > 0;
    default: return true;
  }
});

const selectedBottleName = computed(() =>
  localData.value.bottle ? bottleStore.getBottleById(localData.value.bottle)?.name : ''
);

const wizardSave = async () => {
  await save();
};
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Production' : 'Edit Production' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>

        <!-- Wizard Step Indicator (new only) -->
        <div v-if="isNew" class="px-4 py-3 border-b border-white/5">
          <div class="flex items-center gap-2">
            <template v-for="step in 3" :key="step">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"
                :class="currentStep === step
                  ? 'bg-gold text-charcoal'
                  : currentStep > step
                    ? 'bg-gold/30 text-gold'
                    : 'bg-brown/20 text-parchment/50'"
              >
                {{ step }}
              </div>
              <div
                v-if="step < 3"
                class="flex-1 h-0.5 rounded-full"
                :class="currentStep > step ? 'bg-gold/30' : 'bg-brown/20'"
              />
            </template>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-[10px] text-parchment/60">Source</span>
            <span class="text-[10px] text-parchment/60">Product</span>
            <span class="text-[10px] text-parchment/60">Review</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- EDIT MODE: all fields at once -->
          <template v-if="!isNew">
            <UFormField label="Production Date">
              <SiteDatePicker v-model="localData.date" />
            </UFormField>
            <UFormField label="Vessels">
              <USelectMenu
                v-model="localData.vessel"
                :options="vesselLabels"
                option-attribute="name"
                value-attribute="_id"
                multiple
                searchable
              />
            </UFormField>
            <UFormField label="Bottle">
              <USelectMenu
                v-model="localData.bottle"
                :options="bottleStore.bottles"
                option-attribute="name"
                value-attribute="_id"
                searchable
              />
            </UFormField>
            <UFormField label="Glassware">
              <USelectMenu
                v-model="localData.bottling.glassware"
                :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'glass bottle')"
                option-attribute="name"
                value-attribute="_id"
              />
            </UFormField>
            <UFormField label="Cap">
              <USelect
                v-model="localData.bottling.cap"
                :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'bottle cap')"
                option-attribute="name"
                value-attribute="_id"
              />
            </UFormField>
            <UFormField label="Label">
              <USelectMenu
                v-model="localData.bottling.label"
                :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'label')"
                option-attribute="name"
                value-attribute="_id"
              />
            </UFormField>
            <UFormField label="Quantity">
              <UInput v-model="localData.quantity" type="number" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Production Cost">
                <span class="text-sm">{{ Dollar.format(productionCost) }}</span>
              </UFormField>
              <UFormField label="Per Bottle">
                <span class="text-sm">{{ Dollar.format(localData.quantity > 0 ? productionCost / localData.quantity : 0) }}</span>
              </UFormField>
            </div>
          </template>

          <!-- WIZARD MODE: step-by-step -->
          <template v-else>
            <!-- Step 1: Source -->
            <div v-if="currentStep === 1" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">Select Source Vessels</h3>
              <UFormField label="Production Date">
                <SiteDatePicker v-model="localData.date" />
              </UFormField>
              <UFormField label="Vessels">
                <USelectMenu
                  v-model="localData.vessel"
                  :options="vesselLabels"
                  option-attribute="name"
                  value-attribute="_id"
                  multiple
                  searchable
                />
              </UFormField>
              <div v-if="selectedVesselDetails.length > 0" class="space-y-2">
                <div
                  v-for="(v, i) in selectedVesselDetails"
                  :key="i"
                  class="bg-brown/10 rounded-lg border border-brown/20 p-3"
                >
                  <div class="text-xs font-medium text-parchment/70">{{ v.name }}</div>
                  <div class="text-xs text-parchment/60">
                    {{ v.contents?.join(', ') }} - {{ v.volume }} {{ v.volumeUnit }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Product -->
            <div v-if="currentStep === 2" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">Select Product</h3>
              <UFormField label="Bottle">
                <USelectMenu
                  v-model="localData.bottle"
                  :options="bottleStore.bottles"
                  option-attribute="name"
                  value-attribute="_id"
                  searchable
                />
              </UFormField>
              <UFormField label="Glassware">
                <USelectMenu
                  v-model="localData.bottling.glassware"
                  :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'glass bottle')"
                  option-attribute="name"
                  value-attribute="_id"
                />
              </UFormField>
              <UFormField label="Cap">
                <USelect
                  v-model="localData.bottling.cap"
                  :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'bottle cap')"
                  option-attribute="name"
                  value-attribute="_id"
                />
              </UFormField>
              <UFormField label="Label">
                <USelectMenu
                  v-model="localData.bottling.label"
                  :options="itemStore.items.filter((i) => i.type?.toLowerCase() === 'label')"
                  option-attribute="name"
                  value-attribute="_id"
                />
              </UFormField>
              <UFormField label="Quantity">
                <UInput v-model="localData.quantity" type="number" />
              </UFormField>
            </div>

            <!-- Step 3: Review -->
            <div v-if="currentStep === 3" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">Review Production</h3>
              <div class="bg-brown/10 rounded-lg border border-brown/20 p-4 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Date</span>
                  <span class="text-parchment">{{ localData.date ? new Date(localData.date).toLocaleDateString() : 'Not set' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Vessels</span>
                  <span class="text-parchment">{{ selectedVesselDetails.map(v => v.name).join(', ') || 'None' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Bottle</span>
                  <span class="text-parchment">{{ selectedBottleName || 'None' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Quantity</span>
                  <span class="text-parchment">{{ localData.quantity }}</span>
                </div>
                <div class="border-t border-brown/20 pt-3 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-parchment/50">Production Cost</span>
                    <span class="text-parchment font-semibold">{{ Dollar.format(productionCost) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-parchment/50">Per Bottle</span>
                    <span class="text-parchment font-semibold">{{ Dollar.format(localData.quantity > 0 ? productionCost / localData.quantity : 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <template v-if="!isNew">
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton @click="save" :loading="saving" :disabled="!isDirty">Save</UButton>
          </template>
          <template v-else>
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton
              v-if="currentStep > 1"
              variant="outline"
              @click="currentStep--"
            >
              Back
            </UButton>
            <UButton
              v-if="currentStep < 3"
              @click="currentStep++"
              :disabled="!canProceed"
            >
              Next
            </UButton>
            <UButton
              v-if="currentStep === 3"
              @click="wizardSave"
              :loading="saving"
            >
              Create
            </UButton>
          </template>
        </div>
      </div>
    </template>
  </USlideover>
</template>
