<script setup lang="ts">
const itemStore = useItemStore();
const contactStore = useContactStore();

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "vendor", label: "Vendor" },
  { key: "price", label: "Price / Unit" },
  { key: "stock", label: "Stock" },
];
</script>

<template>
  <div>
    <UTable :rows="itemStore.items" :columns="columns">
      <template #vendor-data="{ row }">
        <div v-if="contactStore.getContactById(row.vendor)?.firstName">
          <span
            >{{ contactStore.getContactById(row.vendor)?.firstName }}
            {{ contactStore.getContactById(row.vendor)?.lastName }}</span
          >
        </div>
        <div v-else>
          <span>{{
            contactStore.getContactById(row.vendor)?.businessName
          }}</span>
        </div>
      </template>
      <template #price-data="{ row }">
        <span>Price will go here</span></template
      >
    </UTable>
  </div>
</template>
