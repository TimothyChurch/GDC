<script setup>
const inventoryStore = useInventoryStore();
if (!inventoryStore.inventory.items.length) {
  inventoryStore.getInventories();
}
const bottleStore = useBottleStore();
if (!bottleStore.bottles.length) {
  bottleStore.getBottles();
}

const updateBottleInventory = () => {
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
  inventoryStore.inventory.category = "Bottles";
};
</script>

<template>
  <div>
    <UFormGroup label="Type of Inventory" v-if="!inventoryStore.inventory.type">
      <div class="flex gap-3">
        <UButton @click="inventoryStore.inventory.type = 'Weekly'"
          >Weekly</UButton
        >
        <UButton @click="inventoryStore.inventory.type = 'End of Month'"
          >End of Month</UButton
        >
        <UButton @click="inventoryStore.inventory.type = 'Addition'"
          >Addition</UButton
        >
      </div>
    </UFormGroup>
    <UFormGroup
      label="Category"
      v-if="inventoryStore.inventory.type && !inventoryStore.inventory.category"
    >
      <div class="flex gap-3">
        <UButton @click="inventoryStore.inventory.category = 'Bottles'"
          >Bottles</UButton
        >
        <UButton @click="inventoryStore.inventory.category = 'Grains'"
          >Grains</UButton
        >
        <UButton @click="inventoryStore.inventory.category = 'Groceries'"
          >Groceries</UButton
        >
      </div>
    </UFormGroup>
    <FormInventoryBottle
      v-if="inventoryStore.inventory.category == 'Bottles'"
    />
  </div>
</template>
