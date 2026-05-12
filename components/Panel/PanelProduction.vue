<script setup lang="ts">
import * as yup from 'yup';
import type { TransferInput } from '~/types/interfaces/Transfer';

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
const transferStore = useTransferStore();
const toast = useToast();

// Track the batch ID for linking after creation
const linkedBatchId = ref(props.prefill?.batchId || '');
const isBatchLinked = computed(() => !!linkedBatchId.value);

const { localData, isDirty, saving, save, cancel, draftRestoredAt, discardDraft } = useFormPanel({
  source: () => productionsStore.production,
  draft: {
    key: 'PanelProduction',
    id: () => productionsStore.production._id || (props.prefill?.batchId ? `batch-${props.prefill.batchId}` : null),
  },
  async onSave(data) {
    const isNewProduction = !data._id;
    // Snapshot the pre-save state for delta-based inventory adjustment on edits.
    // (Tech-debt #73: previously only the create path adjusted inventory.)
    const originalForEdit = !isNewProduction
      ? {
          quantity: productionsStore.production.quantity || 0,
          bottle: productionsStore.production.bottle,
          bottling: productionsStore.production.bottling
            ? { ...productionsStore.production.bottling }
            : undefined,
        }
      : null;

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

    if (isNewProduction && updateInventory.value) {
      await productionsStore.adjustInventoryForProduction({
        quantity: data.quantity,
        bottle: data.bottle,
        bottling: data.bottling,
      });
    } else if (originalForEdit && updateInventory.value) {
      // Apply the delta between old and new on edit.
      await productionsStore.adjustInventoryForProductionEdit(originalForEdit, {
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
  linkedBatchId,
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

/**
 * Phase 7.1/7.2 — drain ALL vessels containing the linked batch via a single
 * tax_paid_withdrawal transfer (atomic), then create the Production record,
 * then adjust inventory. Replaces the previous direct vessel.contents mutation
 * which had been silently no-op'd by Phase 4's vessel-PUT guard.
 *
 * `data.vessel[]` (the user-selected list) is preserved on the Production doc
 * for display, but the engine sources from every vessel actually holding the
 * batch — if a barrel was forgotten in the wizard, this fixes Bug 5.1.
 */
function findVesselSlotsForBatch(batchId: string) {
  const slots: { vesselId: string; volume: number; proof: number; abv: number; volumeUnit: string; value: number }[] = [];
  for (const v of vesselStore.items) {
    const slot = (v.contents || []).find((c: any) => String(c.batch) === batchId);
    if (slot && slot.volume > 0) {
      const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
      slots.push({
        vesselId: v._id,
        volume: slot.volume,
        proof,
        abv: slot.abv ?? proof / 2,
        volumeUnit: slot.volumeUnit || 'gallon',
        value: slot.value || 0,
      });
    }
  }
  return slots;
}

async function drainBatchVesselsForBottling(batchId: string): Promise<{ totalVolume: number; weightedProof: number } | null> {
  const slots = findVesselSlotsForBatch(batchId);
  if (slots.length === 0) {
    return { totalVolume: 0, weightedProof: 0 };
  }
  const totalVolume = slots.reduce((s, x) => s + x.volume, 0);
  const totalPG = slots.reduce((s, x) => s + (x.volume * x.proof) / 100, 0);
  const weightedProof = totalVolume > 0 ? (totalPG * 100) / totalVolume : 0;

  const batch = batchStore.getBatchById(batchId);
  const fromStage = batch?.currentStage || null;

  const input: TransferInput = {
    type: 'tax_paid_withdrawal',
    batch: batchId,
    fromStage,
    toStage: 'Bottled',
    sources: slots.map((s) => ({ vessel: s.vesselId, volume: s.volume, proof: s.proof })),
    destinations: [{ vessel: null, volume: totalVolume, proof: weightedProof }],
    loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
    ttbAccount: { from: null, to: 'tax_paid' },
    notes: `Bottling withdrawal: production record pending`,
  };
  const result = await transferStore.create(input);
  if (!result) return null;
  return { totalVolume, weightedProof };
}

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

      // Override user-selected vessels with EVERY vessel holding the batch
      // (defensive — fixes Bug 5.1 if a barrel was missed in the wizard).
      const allBatchVessels = findVesselSlotsForBatch(linkedBatchId.value).map((s) => s.vesselId);
      if (allBatchVessels.length > 0) {
        data.vessel = allBatchVessels as any;
      }

      // 1. Atomic drain via the transfer engine.
      const drain = await drainBatchVesselsForBottling(linkedBatchId.value);
      if (!drain) {
        // Toast already shown by useTransferStore.create
        saving.value = false;
        return;
      }

      // 2. Create the Production record.
      Object.assign(productionsStore.production, data);
      const newId = await productionsStore.createAndReturnId(data);
      if (!newId) {
        toast.add({
          title: 'Production record failed',
          description: 'Vessels were drained but the production document was not saved. Reverse the most recent transfer or recreate the production manually.',
          color: 'error',
          icon: 'i-lucide-alert-triangle',
          duration: 12000,
        });
        saving.value = false;
        return;
      }

      // 3. Inventory side-effects.
      if (updateInventory.value) {
        await productionsStore.adjustInventoryForProduction({
          quantity: data.quantity,
          bottle: data.bottle,
          bottling: data.bottling,
        });
      }

      // 4. Record the production link on the batch's Bottled stage.
      await batchStore.updateStageData(linkedBatchId.value, 'Bottled', {
        productionRecord: newId,
      }, 'Linked production record');

      emit("close", newId);
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

        <div
          v-if="draftRestoredAt"
          class="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300"
        >
          <UIcon name="i-lucide-archive-restore" class="shrink-0" />
          <span class="flex-1">Draft restored from a previous session.</span>
          <UButton size="xs" variant="ghost" color="neutral" class="text-amber-300 hover:text-amber-200" @click="discardDraft">
            Discard
          </UButton>
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
                :items="bottleStore.bottles.map(b => ({ label: b.name, value: b._id }))"
                value-key="value"
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
              :selected-bottle-name="selectedBottleName ?? ''"
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
