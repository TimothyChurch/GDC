<script setup lang="ts">
import type { Inventory } from "~/types";

const inventoryStore = useInventoryStore();

const columns = [
  {
    key: "year",
    label: "Year",
  },
  {
    key: "month",
    label: "Month",
  },
  {
    key: "day",
    label: "Day",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "actions",
  },
];
const items = (row: Inventory) => [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editItem(row),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteItem(row),
    },
  ],
];

const expand = ref({
  openedRows: [],
  row: {},
});

// CRUD Functions

const addItem = () => {
  inventoryStore.resetInventory();
  formSelection.value = "FormInventoryBase";
  toggleFormModal();
};
const editItem = (row: Inventory) => {
  inventoryStore.inventory = row;
  formSelection.value = "FormInventoryBase";
  toggleFormModal();
};
const deleteItem = (row: Inventory) => {
  inventoryStore.deleteInventory(row._id.toString());
};
</script>

<template>
  <div>
    <UTable
      :rows="inventoryStore.inventories"
      :columns="columns"
      v-model:expand="expand"
    >
      <template #expand="{ row }">
        <UTable :rows="row.items" />
      </template>
      <template #actions-header>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-20-solid"
          @click="addItem()"
        />
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>
