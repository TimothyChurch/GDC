<script setup lang="ts">
import * as yup from 'yup';

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
});

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => itemStore.item,
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
