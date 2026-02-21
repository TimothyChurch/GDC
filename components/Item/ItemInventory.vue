<script setup>
const route = useRoute();
const itemStore = useItemStore();
const inventoryStore = useInventoryStore();

const item = computed(() => itemStore.getItemById(route.params._id));
const inventories = computed(() =>
	inventoryStore.getInventoriesByItemId(route.params._id)
);

// Inventory Table
const inventoryTableColumns = [
	{ key: 'date', label: 'Date' },
	{ key: 'items', label: 'Quantity' },
	{ key: 'actions' },
];
// Update inventory
const inventoryButtonVisible = ref(true);
const inventoryQuantity = ref(0);
const inventoryDate = ref(new Date());
const addItemToInventory = () => {
	inventoryStore.inventory.items = {
		[item.value._id]: inventoryQuantity.value,
	};
	inventoryStore.inventory.date = inventoryDate.value;
	inventoryStore.updateInventory();
	inventoryButtonVisible.value = true;
};
</script>

<template>
	<UCard>
		<template #header>
			<div class="flex justify-between">
				<h1 class="font-bold text-xl">Inventory History</h1>
				<UButton
					v-if="inventoryButtonVisible"
					@click="inventoryButtonVisible = false"
					>Add to Inventory</UButton
				>
			</div>
		</template>
		<UTable
			:rows="inventories"
			:columns="inventoryTableColumns">
			<template #date-data="{ row }">
				{{ new Date(row.date).toLocaleDateString() }}
			</template>
			<template #items-data="{ row }">
				{{ row.items[item?._id] }} {{ item?.inventoryUnit }}
			</template>
		</UTable>
		<div
			v-if="!inventoryButtonVisible"
			class="flex gap-3">
			<SiteDatePicker v-model="inventoryDate" />
			<UFieldGroup>
				<UInput
					v-model="inventoryQuantity"
					type="number" />
				<UButton @click="addItemToInventory">Add</UButton>
			</UFieldGroup>
			<UButton
				@click="inventoryButtonVisible = true"
				color="red"
				>Cancel</UButton
			>
		</div>
	</UCard>
</template>
