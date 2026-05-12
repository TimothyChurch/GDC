<script setup lang="ts">
import * as yup from 'yup';
import { EXTRACT_TYPES } from '../../types/interfaces/Item';
import { findGrainDefault } from '../../data/grainDefaults';
import { DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE } from '../../utils/grainBill';

const emit = defineEmits<{ close: [boolean] }>();

const itemStore = useItemStore();
const categories = useItemCategories();

const schema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string(),
  category: yup.string(),
  inventoryUnit: yup.string(),
  minStock: yup.number().min(0).nullable(),
  reorderPoint: yup.number().min(0).nullable(),
  usePerMonth: yup.number().min(0).nullable(),
  baseCostPrice: yup.number().min(0).nullable(),
  baseCostSize: yup.number().min(0).nullable(),
  baseCostUnit: yup.string(),
  ppg: yup.number().min(0).max(50).nullable(),
  displacement: yup.number().min(0).max(0.30).nullable(),
});

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => itemStore.item,
  draft: { key: 'PanelItem', id: () => itemStore.item._id },
  async onSave(data) {
    Object.assign(itemStore.item, data);
    await itemStore.updateItem();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const categoryItems = computed(() =>
  categories.value.map((c) => ({ label: c, value: c }))
);

const addType = (type: string) => {
  itemInventoryTypes.value.push(type);
  localData.value.type = type;
};

const isFermentableCategory = computed(
  () => localData.value.category === 'Base Ingredient',
);

const extractTypeOptions = EXTRACT_TYPES.map((t) => ({
  value: t,
  label: ({
    malted_grain: 'Malted Grain',
    raw_grain: 'Raw Grain',
    flaked_grain: 'Flaked Grain',
    specialty_grain: 'Specialty/Roasted Grain',
    sugar: 'Sugar / Molasses / Honey',
    extract_dry: 'Dry Malt Extract (DME)',
    extract_liquid: 'Liquid Malt Extract (LME)',
    adjunct: 'Adjunct (non-fermentable)',
  } as Record<string, string>)[t],
}));

const suggestedDefault = computed(() => findGrainDefault(localData.value.name || ''));

/** Default displacement (gal/lb) suggested for the current extractType.
 * Shown as the placeholder in the Displacement input so users see the
 * fallback value that will be used at calculation time when they leave it
 * blank. Returns null when no extractType is set. */
const suggestedDisplacement = computed(() => {
  const t = localData.value.extractType as keyof typeof DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE | undefined;
  if (!t) return null;
  return DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE[t] ?? null;
});

function applySuggestion() {
  const s = suggestedDefault.value;
  if (!s) return;
  localData.value.ppg = s.ppg;
  localData.value.extractType = s.extractType;
  localData.value.fermentable = true;
}

watch(
  () => localData.value.ppg,
  (ppg) => {
    if (ppg && ppg > 0 && localData.value.fermentable !== true) {
      localData.value.fermentable = true;
    }
  },
);
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
            {{ isNew ? "New Item" : "Edit Item" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Name" name="name">
              <UInput
                v-model="localData.name"
                placeholder="Item name"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Type" name="type">
                <USelectMenu
                  v-model="localData.type"
                  :items="itemInventoryTypes"
                  create-item
                  @create="addType"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Category" name="category">
                <USelect
                  v-model="localData.category"
                  :items="categoryItems"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Inventory Unit" name="inventoryUnit">
              <USelect
                v-model="localData.inventoryUnit"
                :items="allUnits"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Min Stock" name="minStock">
                <UInput v-model="localData.minStock" type="number" min="0" />
              </UFormField>
              <UFormField label="Reorder Point" name="reorderPoint">
                <UInput v-model="localData.reorderPoint" type="number" min="0" />
              </UFormField>
              <UFormField label="Use / Month" name="usePerMonth">
                <UInput v-model="localData.usePerMonth" type="number" min="0" />
              </UFormField>
            </div>
            <USeparator label="Base Cost" />
            <div class="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2">
              <UFormField label="Qty" name="baseCostSize">
                <UInput v-model="localData.baseCostSize" type="number" min="0" placeholder="50" />
              </UFormField>
              <span class="pb-2 text-sm text-parchment/60">of</span>
              <UFormField label="Unit" name="baseCostUnit">
                <USelect v-model="localData.baseCostUnit" :items="allUnits" placeholder="lb" class="w-full" />
              </UFormField>
              <span class="pb-2 text-sm text-parchment/60">for</span>
              <UFormField label="Price ($)" name="baseCostPrice">
                <UInput v-model="localData.baseCostPrice" type="number" min="0" step="0.01" placeholder="50.00" />
              </UFormField>
            </div>
            <p v-if="localData.baseCostSize && localData.baseCostUnit && localData.baseCostPrice" class="text-xs text-parchment/60">
              {{ localData.baseCostSize }} {{ localData.baseCostUnit }} for ${{ Number(localData.baseCostPrice).toFixed(2) }}
            </p>
            <UFormField label="Notes" name="notes">
              <UTextarea
                v-model="localData.notes"
                placeholder="Miscellaneous notes (e.g., average weight per unit, storage requirements)"
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <!-- Brewing Properties — fermentable items only -->
            <template v-if="isFermentableCategory">
              <USeparator label="Brewing Properties" />

              <div
                v-if="suggestedDefault && (!localData.ppg || !localData.extractType)"
                class="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-parchment/90 flex items-center justify-between gap-2"
              >
                <span>
                  Suggested: <b>{{ suggestedDefault.label }}</b> —
                  PPG {{ suggestedDefault.ppg }}
                </span>
                <UButton size="xs" variant="soft" color="warning" @click="applySuggestion">
                  Use
                </UButton>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="PPG" name="ppg" hint="Points per lb per gal">
                  <UInput
                    v-model.number="localData.ppg"
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    placeholder="e.g. 37"
                  />
                </UFormField>
                <UFormField label="Extract Type" name="extractType">
                  <USelect
                    v-model="localData.extractType"
                    :items="extractTypeOptions"
                    placeholder="Select type"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-medium text-parchment">Fermentable</div>
                    <div class="text-xs text-parchment/60">Include in grain-bill projections</div>
                  </div>
                  <USwitch v-model="localData.fermentable" />
                </div>
              </UFormField>
              <UFormField
                v-if="localData.fermentable"
                label="Displacement"
                name="displacement"
                hint="gal/lb"
                help="Volume displaced by 1 lb of this grain when wetted in mash. Affects proof-gallon calculations for grain-in batches. Leave blank to use the default for this extract type."
              >
                <UInput
                  v-model.number="localData.displacement"
                  type="number"
                  min="0"
                  max="0.30"
                  step="0.01"
                  :placeholder="suggestedDisplacement != null ? `default ${suggestedDisplacement.toFixed(2)}` : 'e.g. 0.10'"
                />
              </UFormField>
            </template>

            <USeparator />
            <UFormField>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-parchment">Track Inventory</div>
                  <div class="text-xs text-parchment/60">Enable stock tracking, counts, and low-stock alerts for this item</div>
                </div>
                <USwitch v-model="localData.trackInventory" />
              </div>
            </UFormField>
          </div>
          <div
            class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
          >
            <UButton color="neutral" variant="outline" @click="cancel"
              >Cancel</UButton
            >
            <UButton type="submit" :loading="saving" :disabled="!isDirty">
              {{ isNew ? "Create" : "Save" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
