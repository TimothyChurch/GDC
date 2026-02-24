<script setup lang="ts">
/** Optional prefill data for batch-to-production flow */
export interface ProductionPrefill {
  batchId?: string
  vessels?: string[]
  date?: Date
}

const props = withDefaults(defineProps<{
  prefill?: ProductionPrefill
}>(), {
  prefill: undefined,
});

const emit = defineEmits<{ close: [string | boolean] }>();

const productionsStore = useProductionStore();
const vesselStore = useVesselStore();
const bottleStore = useBottleStore();
const itemStore = useItemStore();
const recipeStore = useRecipeStore();
const batchStore = useBatchStore();

// Track the batch ID for linking after creation
const linkedBatchId = ref(props.prefill?.batchId || '');
const isBatchLinked = computed(() => !!linkedBatchId.value);

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => productionsStore.production,
  async onSave(data) {
    const isNewProduction = !data._id;
    data.costs = {
      batch: calculatedBatchCost.value,
      barrel: calculatedBarrelCost.value,
      bottling: calculatedBottlingCost.value,
      labor: localData.value.costs?.labor || 0,
      taxes: localData.value.costs?.taxes || 0,
      other: localData.value.costs?.other || 0,
    };
    data.productionCost = totalProductionCost.value;
    data.bottleCost =
      data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;

    Object.assign(productionsStore.production, data);
    await productionsStore.updateProduction();

    // Auto-adjust inventory for new productions only (not edits)
    if (isNewProduction) {
      await productionsStore.adjustInventoryForProduction({
        quantity: data.quantity,
        bottle: data.bottle,
        bottling: data.bottling,
      });
    }
  },
  onClose: () => emit("close", true),
});

// Ensure costs object exists on localData
if (!localData.value.costs) {
  localData.value.costs = {
    batch: 0,
    barrel: 0,
    bottling: 0,
    labor: 0,
    taxes: 0,
    other: 0,
  };
}

const isNew = !localData.value._id;
const currentStep = ref(1);

const vesselLabels = computed(() => {
  const vessels = vesselStore.vessels.filter(
    (v) => v.type.toLowerCase() === "barrel" || v.type.toLowerCase() === "tank",
  );
  return vessels.map((vessel) => {
    if (!vessel.contents || vessel.contents.length === 0) {
      return { _id: vessel._id, name: vessel.name + " - empty" };
    }
    const recipeNames = vessel.contents.map((content: { batch: string }) => {
      const batch = batchStore.getBatchById(content.batch);
      const recipe = recipeStore.getRecipeById(
        batch?.recipe?.toString() as string,
      );
      return recipe?.name || "empty";
    });
    return {
      _id: vessel._id,
      name: vessel.name + " - " + recipeNames.join(", "),
    };
  });
});

const selectedVesselDetails = computed(() => {
  if (!localData.value.vessel?.length)
    return [] as {
      name: string;
      contents: string[];
      volume?: number;
      volumeUnit?: string;
    }[];
  return localData.value.vessel.reduce(
    (
      acc: {
        name: string;
        contents: string[];
        volume?: number;
        volumeUnit?: string;
      }[],
      vid: any,
    ) => {
      const v = vesselStore.getVesselById(vid as unknown as string);
      if (!v) return acc;
      const contentsNames =
        v.contents?.map((c) => {
          const batch = batchStore.getBatchById(c.batch);
          return batch?.recipe
            ? recipeStore.getRecipeById(batch.recipe)?.name || "Unknown"
            : "Unknown";
        }) || [];
      acc.push({
        name: v.name,
        contents: contentsNames,
        volume: v.current?.volume,
        volumeUnit: v.current?.volumeUnit,
      });
      return acc;
    },
    [],
  );
});

// --- Cost Breakdown Computeds ---

/** Batch cost: sum of all batch content costs from selected vessels */
const calculatedBatchCost = computed(() => {
  let total = 0;
  if (localData.value.vessel?.length > 0) {
    localData.value.vessel.forEach((vid: any) => {
      const v = vesselStore.getVesselById(vid as unknown as string);
      v?.contents?.forEach(
        (c: { cost: number }) => (total += c.cost || 0),
      );
    });
  }
  return total;
});

/** Barrel cost: sum of barrel costs from selected vessels */
const calculatedBarrelCost = computed(() => {
  let total = 0;
  if (localData.value.vessel?.length > 0) {
    localData.value.vessel.forEach((vid: any) => {
      const v = vesselStore.getVesselById(vid as unknown as string);
      total += v?.barrel?.cost || 0;
    });
  }
  return total;
});

/** Bottling materials cost: (glass + cap + label) * quantity */
const calculatedBottlingCost = computed(() => {
  const glassCost = localData.value.bottling?.glassware
    ? (latestPrice(
        localData.value.bottling.glassware as unknown as string,
      ) as number) || 0
    : 0;
  const capCost = localData.value.bottling?.cap
    ? (latestPrice(
        localData.value.bottling.cap as unknown as string,
      ) as number) || 0
    : 0;
  const labelCost = localData.value.bottling?.label
    ? (latestPrice(
        localData.value.bottling.label as unknown as string,
      ) as number) || 0
    : 0;
  return (glassCost + capCost + labelCost) * (localData.value.quantity || 0);
});

/** Total production cost: all cost categories summed */
const totalProductionCost = computed(() => {
  return (
    calculatedBatchCost.value +
    calculatedBarrelCost.value +
    calculatedBottlingCost.value +
    (localData.value.costs?.labor || 0) +
    (localData.value.costs?.taxes || 0) +
    (localData.value.costs?.other || 0)
  );
});

/** Per-bottle cost */
const perBottleCost = computed(() => {
  return localData.value.quantity > 0
    ? totalProductionCost.value / localData.value.quantity
    : 0;
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return localData.value.vessel?.length > 0;
    case 2:
      return !!localData.value.bottle && localData.value.quantity > 0;
    default:
      return true;
  }
});

const selectedBottleName = computed(() =>
  localData.value.bottle
    ? bottleStore.getBottleById(localData.value.bottle)?.name
    : "",
);

/** Resolved batch name for the linked batch context banner */
const linkedBatchRecipeName = computed(() => {
  if (!linkedBatchId.value) return '';
  return batchStore.getRecipeNameByBatchId(linkedBatchId.value) || 'Batch';
});

const wizardSave = async () => {
  // For batch-linked new productions, handle save directly to avoid
  // useFormPanel's onClose double-emitting after our custom onSave emit
  if (linkedBatchId.value && !localData.value._id) {
    saving.value = true;
    try {
      const data = localData.value;
      data.costs = {
        batch: calculatedBatchCost.value,
        barrel: calculatedBarrelCost.value,
        bottling: calculatedBottlingCost.value,
        labor: data.costs?.labor || 0,
        taxes: data.costs?.taxes || 0,
        other: data.costs?.other || 0,
      };
      data.productionCost = totalProductionCost.value;
      data.bottleCost = data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;

      Object.assign(productionsStore.production, data);
      const newId = await productionsStore.createAndReturnId(data);
      if (newId) {
        // Auto-adjust inventory for the new production
        await productionsStore.adjustInventoryForProduction({
          quantity: data.quantity,
          bottle: data.bottle,
          bottling: data.bottling,
        });

        await batchStore.updateStageData(linkedBatchId.value, 'Bottled', {
          productionRecord: newId,
        }, 'Linked production record');
        emit("close", newId);
      }
    } finally {
      saving.value = false;
    }
    return;
  }
  await save();
};

/** Cost breakdown line items for display */
const costBreakdownLines = computed(() => [
  { label: "Batch / Spirit", value: calculatedBatchCost.value, auto: true },
  { label: "Barrel", value: calculatedBarrelCost.value, auto: true },
  { label: "Bottling Materials", value: calculatedBottlingCost.value, auto: true },
  { label: "Labor", value: localData.value.costs?.labor || 0, auto: false },
  { label: "Taxes", value: localData.value.costs?.taxes || 0, auto: false },
  { label: "Other", value: localData.value.costs?.other || 0, auto: false },
]);
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-white/10"
        >
          <h2
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
            {{ isBatchLinked && isNew ? "Record Bottling Run" : isNew ? "New Production" : "Edit Production" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>

        <!-- Wizard Step Indicator (new only) -->
        <div v-if="isNew" class="px-4 py-3 border-b border-white/5">
          <div class="flex items-center gap-2">
            <template v-for="step in 4" :key="step">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"
                :class="
                  currentStep === step
                    ? 'bg-gold text-charcoal'
                    : currentStep > step
                      ? 'bg-gold/30 text-gold'
                      : 'bg-brown/20 text-parchment/50'
                "
              >
                {{ step }}
              </div>
              <div
                v-if="step < 4"
                class="flex-1 h-0.5 rounded-full"
                :class="currentStep > step ? 'bg-gold/30' : 'bg-brown/20'"
              />
            </template>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-[10px] text-parchment/60">Source</span>
            <span class="text-[10px] text-parchment/60">Product</span>
            <span class="text-[10px] text-parchment/60">Costs</span>
            <span class="text-[10px] text-parchment/60">Review</span>
          </div>
        </div>

        <!-- Batch context banner (shown when opened from batch advance) -->
        <div
          v-if="isBatchLinked && isNew"
          class="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
        >
          <UIcon name="i-lucide-link" class="text-green-400 shrink-0" />
          <span class="text-xs text-parchment/70">
            Recording bottling run for
            <span class="font-semibold text-green-400">{{ linkedBatchRecipeName }}</span>
            &mdash; this production will be linked to the batch automatically.
          </span>
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
                :items="vesselLabels"
                label-key="name"
                value-key="_id"
                multiple
                searchable
              />
            </UFormField>
            <UFormField label="Bottle">
              <USelectMenu
                v-model="localData.bottle"
                :items="bottleStore.bottles"
                label-key="name"
                value-key="_id"
                searchable
              />
            </UFormField>
            <UFormField label="Glassware">
              <USelectMenu
                v-model="localData.bottling.glassware"
                :items="
                  itemStore.items.filter(
                    (i) => i.type?.toLowerCase() === 'glass bottle',
                  )
                "
                label-key="name"
                value-key="_id"
              />
            </UFormField>
            <UFormField label="Cap">
              <USelect
                v-model="localData.bottling.cap"
                :items="
                  itemStore.items.filter(
                    (i) => i.type?.toLowerCase() === 'bottle cap',
                  )
                "
                label-key="name"
                value-key="_id"
              />
            </UFormField>
            <UFormField label="Label">
              <USelectMenu
                v-model="localData.bottling.label"
                :items="
                  itemStore.items.filter(
                    (i) => i.type?.toLowerCase() === 'label',
                  )
                "
                label-key="name"
                value-key="_id"
              />
            </UFormField>
            <UFormField label="Quantity">
              <UInput v-model="localData.quantity" type="number" />
            </UFormField>

            <!-- Cost Breakdown Section (Edit Mode) -->
            <div class="border-t border-brown/20 pt-4">
              <h3 class="text-sm font-semibold text-parchment/70 mb-3">
                Cost Breakdown
              </h3>
              <div class="space-y-3">
                <!-- Auto-calculated costs (read-only) -->
                <div class="grid grid-cols-2 gap-3">
                  <UFormField label="Batch / Spirit">
                    <div class="flex items-center gap-2">
                      <UInput
                        :model-value="calculatedBatchCost.toFixed(2)"
                        disabled
                        icon="i-lucide-lock"
                        class="flex-1"
                      />
                    </div>
                    <template #hint>
                      <span class="text-[10px] text-parchment/50">Auto-calculated from vessels</span>
                    </template>
                  </UFormField>
                  <UFormField label="Barrel">
                    <UInput
                      :model-value="calculatedBarrelCost.toFixed(2)"
                      disabled
                      icon="i-lucide-lock"
                    />
                    <template #hint>
                      <span class="text-[10px] text-parchment/50">Auto-calculated from barrels</span>
                    </template>
                  </UFormField>
                </div>
                <UFormField label="Bottling Materials">
                  <UInput
                    :model-value="calculatedBottlingCost.toFixed(2)"
                    disabled
                    icon="i-lucide-lock"
                  />
                  <template #hint>
                    <span class="text-[10px] text-parchment/50">Glass + cap + label per unit x quantity</span>
                  </template>
                </UFormField>

                <!-- Manual cost entries -->
                <div class="grid grid-cols-3 gap-3">
                  <UFormField label="Labor">
                    <UInput
                      v-model="localData.costs!.labor"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </UFormField>
                  <UFormField label="Taxes">
                    <UInput
                      v-model="localData.costs!.taxes"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </UFormField>
                  <UFormField label="Other">
                    <UInput
                      v-model="localData.costs!.other"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </UFormField>
                </div>

                <!-- Totals -->
                <div
                  class="bg-brown/10 rounded-lg border border-brown/20 p-3 space-y-2"
                >
                  <div class="flex justify-between text-sm">
                    <span class="text-parchment/50">Total Production Cost</span>
                    <span class="text-parchment font-semibold">{{
                      Dollar.format(totalProductionCost)
                    }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-parchment/50">Cost Per Bottle</span>
                    <span class="text-parchment font-semibold">{{
                      Dollar.format(perBottleCost)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- WIZARD MODE: step-by-step -->
          <template v-else>
            <!-- Step 1: Source -->
            <div v-if="currentStep === 1" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">
                Select Source Vessels
              </h3>
              <UFormField label="Production Date">
                <SiteDatePicker v-model="localData.date" />
              </UFormField>
              <UFormField label="Vessels">
                <USelectMenu
                  v-model="localData.vessel"
                  :items="vesselLabels"
                  label-key="name"
                  value-key="_id"
                  multiple
                  searchable
                  class="w-full"
                />
              </UFormField>
              <div v-if="selectedVesselDetails.length > 0" class="space-y-2">
                <div
                  v-for="(v, i) in selectedVesselDetails"
                  :key="i"
                  class="bg-brown/10 rounded-lg border border-brown/20 p-3"
                >
                  <div class="text-xs font-medium text-parchment/70">
                    {{ v.name }}
                  </div>
                  <div class="text-xs text-parchment/60">
                    {{ v.contents?.join(", ") }} - {{ v.volume }}
                    {{ v.volumeUnit }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Product -->
            <div v-if="currentStep === 2" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">
                Select Product
              </h3>
              <UFormField label="Bottle">
                <USelectMenu
                  v-model="localData.bottle"
                  :items="bottleStore.bottles"
                  label-key="name"
                  value-key="_id"
                  searchable
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Glassware">
                <USelectMenu
                  v-model="localData.bottling.glassware"
                  :items="
                    itemStore.items.filter(
                      (i) => i.type?.toLowerCase() === 'glass bottle',
                    )
                  "
                  label-key="name"
                  value-key="_id"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Cap">
                <USelect
                  v-model="localData.bottling.cap"
                  :items="
                    itemStore.items.filter(
                      (i) => i.type?.toLowerCase() === 'bottle cap',
                    )
                  "
                  label-key="name"
                  value-key="_id"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Label">
                <USelectMenu
                  v-model="localData.bottling.label"
                  :items="
                    itemStore.items.filter(
                      (i) => i.type?.toLowerCase() === 'label',
                    )
                  "
                  label-key="name"
                  value-key="_id"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Quantity">
                <UInput v-model="localData.quantity" type="number" />
              </UFormField>
            </div>

            <!-- Step 3: Costs -->
            <div v-if="currentStep === 3" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">
                Production Costs
              </h3>
              <p class="text-xs text-parchment/50">
                Batch, barrel, and bottling material costs are calculated automatically. Enter any additional costs below.
              </p>

              <!-- Auto-calculated costs (read-only display) -->
              <div class="space-y-2">
                <div
                  class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-flask-conical" class="text-parchment/50 w-4 h-4" />
                    <span class="text-parchment/70">Batch / Spirit</span>
                  </div>
                  <span class="text-parchment font-medium">{{
                    Dollar.format(calculatedBatchCost)
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-cylinder" class="text-parchment/50 w-4 h-4" />
                    <span class="text-parchment/70">Barrel</span>
                  </div>
                  <span class="text-parchment font-medium">{{
                    Dollar.format(calculatedBarrelCost)
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-package" class="text-parchment/50 w-4 h-4" />
                    <span class="text-parchment/70">Bottling Materials</span>
                  </div>
                  <span class="text-parchment font-medium">{{
                    Dollar.format(calculatedBottlingCost)
                  }}</span>
                </div>
              </div>

              <USeparator />

              <!-- Manual cost entries -->
              <div class="space-y-3">
                <UFormField label="Labor Cost">
                  <UInput
                    v-model="localData.costs!.labor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    icon="i-lucide-hard-hat"
                  />
                </UFormField>
                <UFormField label="Excise Taxes">
                  <UInput
                    v-model="localData.costs!.taxes"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    icon="i-lucide-landmark"
                  />
                </UFormField>
                <UFormField label="Other Costs">
                  <UInput
                    v-model="localData.costs!.other"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    icon="i-lucide-ellipsis"
                  />
                </UFormField>
              </div>
            </div>

            <!-- Step 4: Review -->
            <div v-if="currentStep === 4" class="space-y-4">
              <h3 class="text-sm font-semibold text-parchment/70">
                Review Production
              </h3>
              <div
                class="bg-brown/10 rounded-lg border border-brown/20 p-4 space-y-3"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Date</span>
                  <span class="text-parchment">{{
                    localData.date
                      ? new Date(localData.date).toLocaleDateString()
                      : "Not set"
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Vessels</span>
                  <span class="text-parchment">{{
                    selectedVesselDetails.map((v) => v.name).join(", ") ||
                    "None"
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Bottle</span>
                  <span class="text-parchment">{{
                    selectedBottleName || "None"
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-parchment/50">Quantity</span>
                  <span class="text-parchment">{{ localData.quantity }}</span>
                </div>

                <!-- Cost Breakdown -->
                <div class="border-t border-brown/20 pt-3 space-y-2">
                  <div class="text-xs font-semibold text-parchment/60 uppercase tracking-wide mb-1">
                    Cost Breakdown
                  </div>
                  <template v-for="line in costBreakdownLines" :key="line.label">
                    <div
                      v-if="line.value > 0"
                      class="flex justify-between text-sm"
                    >
                      <span class="text-parchment/50">{{ line.label }}</span>
                      <span class="text-parchment">{{
                        Dollar.format(line.value)
                      }}</span>
                    </div>
                  </template>

                  <div class="border-t border-brown/20 pt-2 mt-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-parchment/50 font-semibold">Total Production Cost</span>
                      <span class="text-parchment font-bold">{{
                        Dollar.format(totalProductionCost)
                      }}</span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                      <span class="text-parchment/50">Cost Per Bottle</span>
                      <span class="text-parchment font-semibold">{{
                        Dollar.format(perBottleCost)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
        >
          <template v-if="!isNew">
            <UButton color="neutral" variant="outline" @click="cancel"
              >Cancel</UButton
            >
            <UButton @click="save" :loading="saving" :disabled="!isDirty"
              >Save</UButton
            >
          </template>
          <template v-else>
            <UButton color="neutral" variant="outline" @click="cancel"
              >Cancel</UButton
            >
            <UButton
              v-if="currentStep > 1"
              variant="outline"
              @click="currentStep--"
            >
              Back
            </UButton>
            <UButton
              v-if="currentStep < 4"
              @click="currentStep++"
              :disabled="!canProceed"
            >
              Next
            </UButton>
            <UButton
              v-if="currentStep === 4"
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
