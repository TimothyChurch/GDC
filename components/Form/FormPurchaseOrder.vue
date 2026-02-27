<script setup lang="ts">
import type { PurchaseOrderItem, Item } from "~/types";
const contactStore = useContactStore();
const itemStore = useItemStore();
const purchaseOrderStore = usePurchaseOrderStore();
import { format } from "date-fns";

const additionalItem = ref(false);
const newItem = ref({
  item: "",
  status: "",
  quantity: 0,
  size: 0,
  sizeUnit: "",
  price: 0,
});
const addItem = () => {
  purchaseOrderStore.purchaseOrder.items.push(
    newItem.value as unknown as PurchaseOrderItem
  );
  newItem.value = {
    item: "",
    status: "",
    quantity: 0,
    size: 0,
    sizeUnit: "",
    price: 0,
  };
  additionalItem.value = false;
};

// Items Table

const itemsTableColumns = [
  { accessorKey: "item", header: "Item" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "size", header: "Size" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "total", header: "Total" },
  { accessorKey: "actions", header: "" },
];
const total = computed(() => {
  const runningTotal = ref(0);
  if (purchaseOrderStore.purchaseOrder.items.length > 0) {
    purchaseOrderStore.purchaseOrder.items.forEach(
      (item) => (runningTotal.value += item.price * item.quantity)
    );
  }
  return runningTotal;
});
// Items Table Actions

const removeItem = (item: PurchaseOrderItem) => {
  purchaseOrderStore.purchaseOrder.items.splice(
    purchaseOrderStore.purchaseOrder.items.indexOf(item),
    1
  );
};
const statusOptions = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Track original status to detect "Delivered" transition
const originalStatus = purchaseOrderStore.purchaseOrder.status;

// Submit Form
const submitForm = async () => {
  const statusChangedToDelivered =
    purchaseOrderStore.purchaseOrder.status === "Delivered" && originalStatus !== "Delivered";

  purchaseOrderStore.purchaseOrder.total = total.value.value;
  const data = await purchaseOrderStore.updatePurchaseOrder();
  data.items.forEach((item) => {
    const foundItem = itemStore.items.find((i) => i._id === item.item) as Item;
    if (foundItem && !foundItem.purchaseHistory?.includes(data._id)) {
      itemStore.item = foundItem;
      itemStore.item.purchaseHistory?.push(data._id);
      itemStore.updateItem();
    }
  });

  // Auto-update inventory when PO is marked as Delivered
  if (statusChangedToDelivered) {
    await purchaseOrderStore.receivePurchaseOrder(data._id);
  }
};
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3">
      <UFormField label="Date">
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton
            icon="i-heroicons-calendar-days-20-solid"
            :label="
              format(
                new Date(purchaseOrderStore.purchaseOrder.date),
                'd MMM, yyy'
              )
            "
            @click="
              () =>
                (purchaseOrderStore.purchaseOrder.date = new Date(
                  purchaseOrderStore.purchaseOrder.date
                ))
            " />

          <template #panel="{ close }">
            <DatePicker
              v-model="purchaseOrderStore.purchaseOrder.date"
              is-required
              @close="close" />
          </template>
        </UPopover>
      </UFormField>
      <UFormField label="Status">
        <USelect
          :items="statusOptions"
          v-model="purchaseOrderStore.purchaseOrder.status"
          placeholder="Select status" />
      </UFormField>
      <UFormField label="Vendor">
        <USelect
          :items="contactStore.contacts"
          v-model="purchaseOrderStore.purchaseOrder.vendor"
          label-key="businessName"
          value-key="_id" />
      </UFormField>
    </div>
    <UTable
      :data="purchaseOrderStore.purchaseOrder.items"
      :columns="itemsTableColumns">
      <template #item-cell="{ row }">
        {{ itemStore.items.find((i) => i._id === row.original.item)?.name }}
      </template>
      <template #size-cell="{ row }">
        {{ row.original.size }} {{ row.original.sizeUnit }}
      </template>
      <template #price-cell="{ row }">
        {{ Dollar.format(row.original.price) }}
      </template>
      <template #total-cell="{ row }">
        {{ Dollar.format(row.original.price * row.original.quantity) }}
      </template>
      <template #actions-cell="{ row }">
        <UButton
          color="neutral"
          icon="i-heroicons-trash-20-solid"
          @click="removeItem(row.original)"
          >Delete Item</UButton
        >
      </template>
    </UTable>
    <USeparator />
    <div class="flex gap-3 my-3 justify-start">
      <span> Total: {{ Dollar.format(total.value) }} </span>
      <UButton
        color="neutral"
        icon="i-heroicons-plus-20-solid"
        @click="additionalItem = true"
        v-if="!additionalItem"
        >Add Item
      </UButton>
    </div>
    <div
      v-if="additionalItem"
      class="flex flex-wrap justify-between my-3 gap-3">
      <UFormField label="Item">
        <BaseItemSelect v-model="newItem.item" />
      </UFormField>
      <UFormField label="Quantity">
        <UInput v-model.number="newItem.quantity" />
      </UFormField>
      <UFormField label="Size">
        <UInput v-model.number="newItem.size" />
      </UFormField>
      <UFormField label="Size Unit">
        <USelect :items="allUnits" v-model="newItem.sizeUnit" />
      </UFormField>
      <UFormField label="Price">
        <UInput v-model.number="newItem.price" />
      </UFormField>
      <UButton color="neutral" icon="i-heroicons-plus-20-solid" @click="addItem"
        >Add Item</UButton
      >
    </div>
    <USeparator />
    <div class="flex justify-center my-3">
      <UButton color="primary" :loading="purchaseOrderStore.saving" @click="submitForm"> Submit </UButton>
    </div>
  </div>
</template>
