<script setup lang="ts">
import { format } from "date-fns";

// Bottle Store
const bottleStore = useBottleStore();
if (bottleStore.bottles.length === 0) {
  bottleStore.getBottles();
}

// Invenory Store
const inventoryStore = useInventoryStore();

// Table Elements
const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "behindBar",
    label: "Behind Bar",
  },
  {
    key: "inOffice",
    label: "In Office",
  },
  {
    key: "total",
    label: "Total",
  },
];

bottleStore.bottles.forEach((bottle) => {
  if (
    !inventoryStore.inventory.items.find(
      (a) => a._id.toString() === bottle._id.toString()
    )
  ) {
    inventoryStore.inventory.items.push({
      _id: bottle._id,
      behindBar: 0,
      inOffice: 0,
      total: 0,
    });
  }
});

// Save Inventory
const saveInventory = () => {
  inventoryStore.inventory.items.forEach(
    (item) => (item.total = item.behindBar + item.inOffice)
  );
  inventoryStore.updateInventory();
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <UPopover :popper="{ placement: 'bottom-start' }">
      <UButton
        icon="i-heroicons-calendar-days-20-solid"
        :label="format(new Date(inventoryStore.inventory.date), 'd MMM, yyy')"
        @click="
          () =>
            (inventoryStore.inventory.date = new Date(
              inventoryStore.inventory.date
            ))
        "
      />

      <template #panel="{ close }">
        <DatePicker
          v-model="inventoryStore.inventory.date"
          is-required
          @close="close"
        />
      </template>
    </UPopover>
    <UTable :rows="inventoryStore.inventory.items" :columns="columns">
      <template #name-data="{ row }">
        {{ bottleStore.getName(row._id) }}
      </template>
      <template #behindBar-data="{ row }">
        <UInput type="number" v-model="row.behindBar" />
      </template>
      <template #inOffice-data="{ row }">
        <UInput type="number" v-model="row.inOffice" />
      </template>
      <template #total-data="{ row }">
        {{ row.behindBar + row.inOffice }}
      </template>
    </UTable>
    <UButton type="primary" class="flex" @click="saveInventory"
      >Save Inventory</UButton
    >
  </div>
</template>
