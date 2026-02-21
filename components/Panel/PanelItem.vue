<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const itemStore = useItemStore();
const contactStore = useContactStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => itemStore.item,
  async onSave(data) {
    Object.assign(itemStore.item, data);
    await itemStore.updateItem();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

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
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="localData.name"
              placeholder="Item name"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Brand">
              <UInput v-model="localData.brand" placeholder="Brand" />
            </UFormField>
            <UFormField label="Type">
              <USelectMenu
                v-model="localData.type"
                :items="itemInventoryTypes"
                create-item
                @create="addType"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Vendor">
            <USelectMenu
              v-model="localData.vendor"
              :items="contactStore.getVendors()"
              label-key="businessName"
              value-key="_id"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Inventory Unit">
            <USelect
              v-model="localData.inventoryUnit"
              :items="allUnits"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Purchase Size">
              <UInput v-model="localData.purchaseSize" type="number" />
            </UFormField>
            <UFormField label="Size Unit">
              <USelect
                v-model="localData.purchaseSizeUnit"
                :items="allUnits"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Purchase Price">
              <UInput v-model="localData.purchasePrice" type="number" step="0.01" />
            </UFormField>
          </div>
        </div>
        <div
          class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
        >
          <UButton color="neutral" variant="outline" @click="cancel"
            >Cancel</UButton
          >
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? "Create" : "Save" }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
