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
  { label: "Item", key: "item" },
  { label: "Quantity", key: "quantity" },
  { label: "Size", key: "size" },
  { label: "Price", key: "price" },
  { label: "Total", key: "total" },
  { key: "actions" },
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
// Submit Form
const submitForm = async () => {
  purchaseOrderStore.purchaseOrder.total = total.value.value;
  const data = await purchaseOrderStore.updatePurchaseOrder();
  data.items.forEach((item) => {
    itemStore.item = itemStore.items.find((i) => i._id === item.item) as Item
    itemStore.item.purchaseHistory.push(data._id);
    itemStore.updateItem();
  });
  toggleFormModal();
};
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3">
      <UFormGroup label="Date">
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
      </UFormGroup>
      <UFormGroup label="Status">
        <USelect
          :options="statusOptions"
          v-model="purchaseOrderStore.purchaseOrder.status"
          placeholder="Select status" />
      </UFormGroup>
      <UFormGroup label="Vendor">
        <USelect
          :options="contactStore.contacts"
          v-model="purchaseOrderStore.purchaseOrder.vendor"
          option-attribute="businessName"
          value-attribute="_id" />
      </UFormGroup>
    </div>
    <UTable
      :rows="purchaseOrderStore.purchaseOrder.items"
      :columns="itemsTableColumns">
      <template #item-data="{ row }">
        {{ itemStore.items.find((i) => i._id === row.item)?.name }}
      </template>
      <template #size-data="{ row }">
        {{ row.size }} {{ row.sizeUnit }}
      </template>
      <template #price-data="{ row }">
        {{ Dollar.format(row.price) }}
      </template>
      <template #total-data="{ row }">
        {{ Dollar.format(row.price * row.quantity) }}
      </template>
      <template #actions-data="{ row }">
        <UButton
          color="gray"
          icon="i-heroicons-trash-20-solid"
          @click="removeItem(row)"
          >Delete Item</UButton
        >
      </template>
    </UTable>
    <UDivider />
    <div class="flex gap-3 my-3 justify-start">
      <span> Total: {{ Dollar.format(total.value) }} </span>
      <UButton
        color="gray"
        icon="i-heroicons-plus-20-solid"
        @click="additionalItem = true"
        v-if="!additionalItem"
        >Add Item
      </UButton>
    </div>
    <div
      v-if="additionalItem"
      class="flex flex-wrap justify-between my-3 gap-3">
      <UFormGroup label="Item">
        <USelectMenu
          :options="itemStore.items"
          :search-input="{
            placeholder: 'Filter...',
            icon: 'i-lucide-search'
          }"
          v-model="newItem.item"
          option-attribute="name"
          value-attribute="_id" />
      </UFormGroup>
      <UFormGroup label="Quantity">
        <UInput v-model.number="newItem.quantity" />
      </UFormGroup>
      <UFormGroup label="Size">
        <UInput v-model.number="newItem.size" />
      </UFormGroup>
      <UFormGroup label="Size Unit">
        <USelect :options="allUnits" v-model="newItem.sizeUnit" />
      </UFormGroup>
      <UFormGroup label="Price">
        <UInput v-model.number="newItem.price" />
      </UFormGroup>
      <UButton color="gray" icon="i-heroicons-plus-20-solid" @click="addItem"
        >Add Item</UButton
      >
    </div>
    <UDivider />
    <div class="flex justify-center my-3">
      <UButton color="primary" :loading="purchaseOrderStore.saving" @click="submitForm"> Submit </UButton>
    </div>
  </div>
</template>
