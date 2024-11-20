<script setup>
definePageMeta({
  layout: "admin",
});

const bottleStore = useBottleStore();
bottleStore.getBottles();

const inventoryStore = useInventoryStore();
inventoryStore.getInventories();
</script>

<template>
  <UContainer>
    <FormBottleInventory />
    <TableInventory />
    <FormBottleAdd />
  </UContainer>
</template>
