<script setup>
// Bottle Store
const bottleStore = useBottleStore();
bottleStore.getBottles();
// Invenory Store
const inventoryStore = useInventoryStore();
// Date
const now = new Date();
// Inventory Object
const inventoryData = reactive({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  day: now.getDate(),
  items: {},
});
// Save Inventory
const saveInventory = () => {
  inventoryStore.addInventory(inventoryData);
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-3">
      <UFormGroup label="Year">
        <UInput v-model="inventoryData.year" label="Year" />
      </UFormGroup>
      <UFormGroup label="Month">
        <UInput v-model="inventoryData.month" label="Month" />
      </UFormGroup>
      <UFormGroup label="Day">
        <UInput v-model="inventoryData.day" label="Day" />
      </UFormGroup>
    </div>
    <div class="grid grid-cols-8 gap-3">
      <div v-for="bottle in bottleStore.bottles" :key="bottle._id">
        <UFormGroup :name="bottle._id" :label="bottle.name">
          <UInput v-model="inventoryData.items[bottle._id]" />
        </UFormGroup>
      </div>
    </div>
    <UButton type="primary" class="flex" @click="saveInventory"
      >Save Inventory</UButton
    >
  </div>
</template>
