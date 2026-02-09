<script setup>
const route = useRoute();
const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();
const inventoryStore = useInventoryStore();

const bottle = computed(() => bottleStore.getBottleById(route.params._id));
const recipe = computed(() => recipeStore.getRecipeById(bottle.value?.recipe));
const inventory = computed(() =>
  inventoryStore.getInventoriesByItem(bottle.value?._id),
);

const editBottle = () => {
  bottleStore.bottle = bottle.value;
  formSelection.value = "FormBottle";
  toggleFormModal();
};

const addInventory = ref(false);

const updateInventory = () => {
  inventoryStore.inventory.item = bottle.value?._id;
  inventoryStore.updateInventory();
  addInventory.value = false;
};
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <h1 class="text-xl font-bold">{{ bottle?.name }}</h1>

          <UButton
            icon="i-heroicons-pencil"
            variant="ghost"
            color="black"
            @click="editBottle"
          />
        </div>
      </template>
      <div class="flex justify-between">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Details</h2>
          </template>
          <p>{{ recipe?.name }}</p>
          <h1>Class: {{ recipe?.class }}</h1>
          <h1>Type: {{ recipe?.type }}</h1>
          <h1>ABV: {{ bottle?.abv }}%</h1>
        </UCard>
        <UCard class="mt-4">
          <template #header>
            <div class="flex justify-between">
              <h2 class="text-lg font-semibold">Inventory</h2>
              <UButton
                icon="i-heroicons-plus-circle"
                size="lg"
                color="black"
                @click="addInventory = true"
                variant="ghost"
              />
            </div>
          </template>
          <div v-if="addInventory" class="flex flex-col align-center gap-2">
            <SiteDatePicker v-model="inventoryStore.inventory.date" />
            <UInput
              v-model="inventoryStore.inventory.quantity"
              type="number"
              placeholder="Quantity"
              class="mb-2"
            />
            <UButtonGroup>
              <UButton @click="updateInventory()">Add</UButton>

              <UButton color="black" @click="addInventory = false"
                >Cancel</UButton
              >
            </UButtonGroup>
          </div>
          <div v-for="inv in inventory" :key="inv._id" class="mt-2">
            <div class="flex justify-between gap-2">
              <p>{{ new Date(inv.date).toLocaleDateString() }}</p>
              <p>Quantity: {{ inv.quantity }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>
