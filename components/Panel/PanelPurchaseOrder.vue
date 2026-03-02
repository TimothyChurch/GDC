<script setup lang="ts">
import * as yup from 'yup';
import type { PurchaseOrderItem } from "~/types";

const emit = defineEmits<{ close: [boolean] }>();

const schema = yup.object({
  date: yup.string().required('Date is required'),
  vendor: yup.string().required('Vendor is required'),
  status: yup.string().required('Status is required'),
});

const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();

// Track the original status to detect "Delivered" transition
const originalStatus = purchaseOrderStore.purchaseOrder.status;

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => purchaseOrderStore.purchaseOrder,
  async onSave(data) {
    data.total = total.value;
    const statusChangedToDelivered =
      data.status === "Delivered" && originalStatus !== "Delivered";

    Object.assign(purchaseOrderStore.purchaseOrder, data);
    const result = await purchaseOrderStore.updatePurchaseOrder();

    // Update item purchase histories (existing behavior)
    result.items.forEach((item: PurchaseOrderItem) => {
      const foundItem = itemStore.items.find((i) => i._id === item.item);
      if (foundItem) {
        if (!foundItem.purchaseHistory?.includes(result._id)) {
          itemStore.item = foundItem;
          itemStore.item.purchaseHistory?.push(result._id);
          itemStore.updateItem();
        }
      }
    });

    // Auto-update inventory when PO is marked as Delivered
    if (statusChangedToDelivered) {
      await purchaseOrderStore.receivePurchaseOrder(result._id);
    }
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

/** Whether the user is switching status to Delivered for the first time */
const isMarkingDelivered = computed(
  () => localData.value.status === "Delivered" && originalStatus !== "Delivered",
);

const statusOptions = PO_STATUS_OPTIONS;

const subtotal = computed(() =>
  localData.value.items.reduce(
    (sum: number, item: PurchaseOrderItem) => sum + item.price * item.quantity,
    0,
  ),
);

const totalTax = computed(() => {
  const rate = localData.value.taxRate || 0;
  return localData.value.items.reduce((sum: number, item: PurchaseOrderItem) => {
    if (!item.taxable) return sum;
    return sum + item.price * item.quantity * rate;
  }, 0);
});

const total = computed(() => subtotal.value + totalTax.value + (localData.value.shipping || 0));

const newItem = ref({ item: "", quantity: 0, size: 0, sizeUnit: "", price: 0, taxable: false, brand: "" });

const addItem = () => {
  localData.value.items.push({
    ...newItem.value,
  } as unknown as PurchaseOrderItem);
  newItem.value = { item: "", quantity: 0, size: 0, sizeUnit: "", price: 0, taxable: false, brand: "" };
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
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Date" name="date">
            <SiteDatePicker v-model="localData.date" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Status" name="status">
              <USelect
                v-model="localData.status"
                :items="statusOptions"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Vendor" name="vendor">
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
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Tax Rate (%)" name="taxRate">
              <UInput
                :model-value="((localData.taxRate || 0) * 100).toFixed(2)"
                @update:model-value="(v: string) => localData.taxRate = parseFloat(v) / 100 || 0"
                type="number"
                step="0.01"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Shipping ($)" name="shipping">
              <UInput
                v-model.number="localData.shipping"
                type="number"
                step="0.01"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Inventory update notice when marking as Delivered -->
          <div
            v-if="isMarkingDelivered && localData.items.length > 0"
            class="flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
          >
            <UIcon name="i-lucide-package-check" class="text-green-400 shrink-0 mt-0.5" />
            <div class="text-xs text-parchment/70">
              <span class="font-semibold text-green-400">Inventory will be updated automatically</span>
              when this order is saved as Delivered. Stock levels for
              {{ localData.items.length }} item{{ localData.items.length !== 1 ? 's' : '' }}
              will be increased based on the order quantities.
            </div>
          </div>

          <UFormField label="Items">
            <div class="space-y-2">
              <div
                v-for="(item, index) in localData.items"
                :key="index"
                class="flex items-center justify-between gap-2 text-sm"
              >
                <div class="flex-1 min-w-0">
                  <span class="truncate block">{{
                    itemStore.items.find((i) => i._id === item.item)?.name
                  }}</span>
                  <span v-if="item.brand" class="text-xs text-parchment/40">{{ item.brand }}</span>
                </div>
                <span v-if="item.taxable" class="text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full shrink-0">TAX</span>
                <span class="text-parchment/60 shrink-0"
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
                <BaseItemSelect v-model="newItem.item" placeholder="Select item" />
                <UInput
                  v-model="newItem.brand"
                  placeholder="Brand (optional)"
                  class="w-full"
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
                <label class="flex items-center gap-2 text-sm text-parchment/70 cursor-pointer">
                  <USwitch v-model="newItem.taxable" size="sm" />
                  <span>Taxable</span>
                </label>
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

          <div class="space-y-1 text-sm">
            <div class="flex justify-between text-parchment/60">
              <span>Subtotal</span>
              <span>{{ Dollar.format(subtotal) }}</span>
            </div>
            <div v-if="totalTax > 0" class="flex justify-between text-parchment/60">
              <span>Tax ({{ ((localData.taxRate || 0) * 100).toFixed(2) }}%)</span>
              <span>{{ Dollar.format(totalTax) }}</span>
            </div>
            <div v-if="(localData.shipping || 0) > 0" class="flex justify-between text-parchment/60">
              <span>Shipping</span>
              <span>{{ Dollar.format(localData.shipping) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-parchment pt-1 border-t border-white/10">
              <span>Total</span>
              <span>{{ Dollar.format(total) }}</span>
            </div>
          </div>
        </div>
        <div
          class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
        >
          <UButton color="neutral" variant="outline" @click="cancel"
            >Cancel</UButton
          >
          <UButton type="submit" :loading="saving" :disabled="!isDirty">
            {{ isNew ? "Create" : isMarkingDelivered ? "Save & Update Inventory" : "Save" }}
          </UButton>
        </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
