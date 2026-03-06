<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const schema = yup.object({
  date: yup.string().required('Date is required'),
  item: yup.string().required('Item is required'),
  quantity: yup.number().min(0, 'Quantity cannot be negative').required('Quantity is required'),
});

const inventoryStore = useInventoryStore();
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const vesselStore = useVesselStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => inventoryStore.inventory,
  async onSave(data) {
    Object.assign(inventoryStore.inventory, data);
    await inventoryStore.updateInventory();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const itemOptions = computed(() => {
  const bottles = bottleStore.bottles.map((b) => ({ label: b.name, value: b._id }));
  const items = itemStore.items.map((i) => ({ label: i.name, value: i._id }));
  return [...bottles, ...items];
});

const vesselOptions = computed(() =>
  vesselStore.vessels.map((v) => ({ label: v.name, value: v._id })),
);

// Look up the selected Item's packaging info
const selectedItem = computed(() => {
  if (!localData.value.item) return null;
  return itemStore.items.find((i) => i._id === localData.value.item) || null;
});

// Auto-populate unitSize/unitSizeUnit from Item defaults when item changes
watch(() => localData.value.item, (newItemId, oldItemId) => {
  if (!newItemId || newItemId === oldItemId) return;
  const item = itemStore.items.find((i) => i._id === newItemId);
  if (item?.unitSize && item.unitSize > 0) {
    localData.value.unitSize = item.unitSize;
  }
  localData.value.unitSizeUnit = item?.inventoryUnit || '';
});

// Computed total for package mode display
const packageTotal = computed(() => {
  if (!localData.value.unitSize || localData.value.unitSize <= 0) return 0;
  return (localData.value.quantity || 0) * localData.value.unitSize;
});
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Inventory Record' : 'Edit Inventory Record' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Date" name="date">
              <SiteDatePicker v-model="localData.date" />
            </UFormField>
            <UFormField label="Item" name="item">
              <USelectMenu
                v-model="localData.item"
                :items="itemOptions"
                value-key="value"
                label-key="label"
                placeholder="Select an item"
                searchable
              />
            </UFormField>

            <UFormField label="Quantity" name="quantity">
              <UInput v-model.number="localData.quantity" type="number" placeholder="Quantity" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Per-Unit Size">
                <UInput
                  :model-value="localData.unitSize"
                  @update:model-value="localData.unitSize = Number($event)"
                  type="number"
                  placeholder="e.g. 50"
                />
              </UFormField>
              <UFormField label="Unit">
                <USelect v-model="localData.unitSizeUnit" :items="allUnits" placeholder="Select unit" />
              </UFormField>
            </div>
            <div v-if="localData.unitSize && localData.unitSize > 0" class="text-sm text-parchment/70">
              Total: <span class="text-lg font-bold text-gold">{{ packageTotal.toLocaleString() }} {{ localData.unitSizeUnit || '' }}</span>
            </div>

            <UFormField label="Location">
              <USelectMenu
                v-model="localData.location"
                :items="vesselOptions"
                value-key="value"
                label-key="label"
                placeholder="Select a vessel (optional)"
                searchable
              />
            </UFormField>
          </div>
          <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton type="submit" :loading="saving" :disabled="!isDirty">
              {{ isNew ? 'Create' : 'Save' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
