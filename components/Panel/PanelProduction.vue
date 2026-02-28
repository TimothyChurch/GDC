<script setup lang="ts">
import * as yup from 'yup';

const editSchema = yup.object({
  date: yup.string().required('Date is required'),
  bottle: yup.string().required('Bottle is required'),
  quantity: yup.number().positive('Must be positive').required('Quantity is required'),
});

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
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

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
      ttbTax: calculatedTtbTax.value,
      tabcTax: calculatedTabcTax.value,
      other: localData.value.costs?.other || 0,
    };
    data.productionCost = totalProductionCost.value;
    data.bottleCost =
      data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;

    Object.assign(productionsStore.production, data);
    await productionsStore.updateProduction();

    // Auto-adjust inventory for new productions only (not edits)
    if (isNewProduction && updateInventory.value) {
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
    batch: 0, barrel: 0, bottling: 0,
    labor: 0, ttbTax: 0, tabcTax: 0, other: 0,
  };
}

const isNew = !localData.value._id;
const currentStep = ref(1);
const updateInventory = ref(true);

// Use extracted composable for all cost calculations and vessel helpers
const {
  calculatedBatchCost,
  calculatedBarrelCost,
  calculatedBottlingCost,
  calculatedTtbTax,
  calculatedTabcTax,
  totalProductionCost,
  perBottleCost,
  costBreakdownLines,
  vesselLabels,
  selectedVesselDetails,
} = useProductionCosts({
  localData,
  vesselStore,
  bottleStore,
  batchStore,
  recipeStore,
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return localData.value.vessel?.length > 0;
    case 2: return !!localData.value.bottle && localData.value.quantity > 0;
    default: return true;
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
        ttbTax: calculatedTtbTax.value,
        tabcTax: calculatedTabcTax.value,
        other: data.costs?.other || 0,
      };
      data.productionCost = totalProductionCost.value;
      data.bottleCost = data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;

      Object.assign(productionsStore.production, data);
      const newId = await productionsStore.createAndReturnId(data);
      if (newId) {
        if (updateInventory.value) {
          await productionsStore.adjustInventoryForProduction({
            quantity: data.quantity,
            bottle: data.bottle,
            bottling: data.bottling,
          });
        }
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
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isBatchLinked && isNew ? "Record Bottling Run" : isNew ? "New Production" : "Edit Production" }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>

        <!-- Wizard Step Indicator (new only) -->
        <div v-if="isNew" class="px-4 py-3 border-b border-white/5">
          <div class="flex items-center gap-2">
            <template v-for="step in 4" :key="step">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"
                :class="currentStep === step ? 'bg-gold text-charcoal'
                  : currentStep > step ? 'bg-gold/30 text-gold'
                  : 'bg-brown/20 text-parchment/50'"
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

        <!-- EDIT MODE: wrapped in UForm for validation -->
        <UForm v-if="!isNew" :schema="editSchema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Production Date" name="date">
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
            <UFormField label="Bottle" name="bottle">
              <USelectMenu
                v-model="localData.bottle"
                :items="bottleStore.bottles"
                label-key="name"
                value-key="_id"
                searchable
              />
            </UFormField>
            <UFormField label="Glassware">
              <BaseItemSelect v-model="localData.bottling.glassware" filter-by-type="glass bottle" create-type="glass bottle" create-category="Bottling" />
            </UFormField>
            <UFormField label="Cap">
              <BaseItemSelect v-model="localData.bottling.cap" filter-by-type="bottle cap" create-type="bottle cap" create-category="Bottling" />
            </UFormField>
            <UFormField label="Label">
              <BaseItemSelect v-model="localData.bottling.label" filter-by-type="label" create-type="label" create-category="Bottling" />
            </UFormField>
            <UFormField label="Quantity" name="quantity">
              <UInput v-model="localData.quantity" type="number" />
            </UFormField>

            <!-- Cost Breakdown Section (Edit Mode) -->
            <ProductionCostBreakdown
              :local-data="localData"
              :calculated-batch-cost="calculatedBatchCost"
              :calculated-barrel-cost="calculatedBarrelCost"
              :calculated-bottling-cost="calculatedBottlingCost"
              :calculated-ttb-tax="calculatedTtbTax"
              :calculated-tabc-tax="calculatedTabcTax"
              :total-production-cost="totalProductionCost"
              :per-bottle-cost="perBottleCost"
            />
          </div>
          <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton type="submit" :loading="saving" :disabled="!isDirty">Save</UButton>
          </div>
        </UForm>

        <!-- WIZARD MODE: step-by-step (no UForm validation) -->
        <template v-else>
          <div class="flex-1 overflow-y-auto p-4">
            <ProductionWizard
              :current-step="currentStep"
              :local-data="localData"
              :vessel-labels="vesselLabels"
              :selected-vessel-details="selectedVesselDetails"
              :cost-breakdown-lines="costBreakdownLines"
              :calculated-batch-cost="calculatedBatchCost"
              :calculated-barrel-cost="calculatedBarrelCost"
              :calculated-bottling-cost="calculatedBottlingCost"
              :calculated-ttb-tax="calculatedTtbTax"
              :calculated-tabc-tax="calculatedTabcTax"
              :total-production-cost="totalProductionCost"
              :per-bottle-cost="perBottleCost"
              :update-inventory="updateInventory"
              :selected-bottle-name="selectedBottleName"
              @update:update-inventory="updateInventory = $event"
            />
          </div>

          <!-- Wizard Footer -->
          <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton v-if="currentStep > 1" variant="outline" @click="currentStep--">Back</UButton>
            <UButton v-if="currentStep < 4" @click="currentStep++" :disabled="!canProceed">Next</UButton>
            <UButton v-if="currentStep === 4" @click="wizardSave" :loading="saving">Create</UButton>
          </div>
        </template>
      </div>
    </template>
  </USlideover>
</template>
