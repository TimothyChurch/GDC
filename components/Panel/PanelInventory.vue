<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

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
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Date">
            <SiteDatePicker v-model="localData.date" />
          </UFormField>
          <UFormField label="Item">
            <USelectMenu
              v-model="localData.item"
              :items="itemOptions"
              value-key="value"
              label-key="label"
              placeholder="Select an item"
              searchable
            />
          </UFormField>
          <UFormField label="Quantity">
            <UInput v-model.number="localData.quantity" type="number" placeholder="Quantity" />
          </UFormField>
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
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? 'Create' : 'Save' }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
