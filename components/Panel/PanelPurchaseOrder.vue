<script setup lang="ts">
import type { PurchaseOrderItem } from "~/types";

const emit = defineEmits<{ close: [boolean] }>();

const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => purchaseOrderStore.purchaseOrder,
  async onSave(data) {
    data.total = total.value;
    Object.assign(purchaseOrderStore.purchaseOrder, data);
    const result = await purchaseOrderStore.updatePurchaseOrder();
    // Update item purchase histories
    result.items.forEach((item: PurchaseOrderItem) => {
      const foundItem = itemStore.items.find((i) => i._id === item.item);
      if (foundItem) {
        itemStore.item = foundItem;
        itemStore.item.purchaseHistory.push(result._id);
        itemStore.updateItem();
      }
    });
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const statusOptions = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const total = computed(() => {
  return localData.value.items.reduce(
    (sum: number, item: PurchaseOrderItem) => sum + item.price * item.quantity,
    0,
  );
});

const newItem = ref({ item: "", quantity: 0, size: 0, sizeUnit: "", price: 0 });

const addItem = () => {
  localData.value.items.push({
    ...newItem.value,
  } as unknown as PurchaseOrderItem);
  newItem.value = { item: "", quantity: 0, size: 0, sizeUnit: "", price: 0 };
};

const removeItem = (index: number) => {
  localData.value.items.splice(index, 1);
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
            {{ isNew ? "New Purchase Order" : "Edit Purchase Order" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Date">
            <SiteDatePicker v-model="localData.date" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Status">
              <USelect
                v-model="localData.status"
                :items="statusOptions"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Vendor">
              <USelect
                v-model="localData.vendor"
                :items="
                  contactStore.contacts.map((c) => ({
                    label: c.businessName || `${c.firstName} ${c.lastName}`,
                    value: c._id,
                  }))
                "
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Items">
            <div class="space-y-2">
              <div
                v-for="(item, index) in localData.items"
                :key="index"
                class="flex items-center justify-between gap-2 text-sm"
              >
                <span class="flex-1 truncate">{{
                  itemStore.items.find((i) => i._id === item.item)?.name
                }}</span>
                <span class="text-parchment/60"
                  >{{ item.quantity }} x {{ Dollar.format(item.price) }}</span
                >
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="removeItem(index)"
                />
              </div>
              <div class="space-y-2 border border-white/10 rounded p-2">
                <USelectMenu
                  v-model="newItem.item"
                  :items="
                    itemStore.items.map((i) => ({
                      label: i.name,
                      value: i._id,
                    }))
                  "
                  value-key="value"
                  placeholder="Select item"
                  searchable
                />
                <div class="grid grid-cols-4 gap-2">
                  <UInput
                    v-model.number="newItem.quantity"
                    type="number"
                    placeholder="Qty"
                  />
                  <UInput
                    v-model.number="newItem.size"
                    type="number"
                    placeholder="Size"
                  />
                  <USelect
                    v-model="newItem.sizeUnit"
                    :items="allUnits"
                    placeholder="Unit"
                  />
                  <UInput
                    v-model.number="newItem.price"
                    type="number"
                    placeholder="Price"
                  />
                </div>
                <UButton
                  @click="addItem"
                  icon="i-lucide-plus"
                  size="sm"
                  variant="outline"
                  class="w-full"
                  >Add Item</UButton
                >
              </div>
            </div>
          </UFormField>

          <UFormField label="Total">
            <span class="text-lg font-bold">{{ Dollar.format(total) }}</span>
          </UFormField>
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
