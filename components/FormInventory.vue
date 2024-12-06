<script setup lang="ts">
import { format } from 'date-fns';
// Access Needed Pinia Store
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();
// Define Filter State
const allItems = computed(() => itemStore.items.concat(bottleStore.bottles));
const filter = ref('');
const filteredItems = computed(() => {
	return allItems.value.filter((item) => {
		const test1 = item.name.toLowerCase().includes(filter.value.toLowerCase());
		const test2 = item.type
			? item?.type.toLowerCase().includes(filter.value.toLowerCase())
			: false;
		return test1 || test2;
	});
});
// Define Table Component
const columns = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'type', label: 'Type', sortable: true },
	{ key: 'brand', label: 'Brand' },
	{ key: 'amount', label: 'Amount' },
];
</script>

<template>
	<div>
		<SiteDatePicker v-model="inventoryStore.inventory.date" />
		<UInput
			v-model="filter"
			placeholder="Filter items..." />
		<UTable
			:rows="filteredItems"
			:columns="columns">
			<template #amount-data="{ row }">
				<UInput v-model="inventoryStore.inventory.items[row._id]">
					<template #trailing>
						{{ row.inventoryUnit }}
					</template>
				</UInput>
			</template>
			<template #type-data="{ row }">
				<div v-if="row.abv">Bottle</div>
				<div v-else>{{ row.type }}</div>
			</template>
		</UTable>
		<UButton @click="inventoryStore.updateInventory()"
			>Update Inventory</UButton
		>
	</div>
</template>
