<script setup lang="ts">
import { format } from 'date-fns';
// Access Needed Pinia Store
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();
// Define Filter State
const allItems = computed(() => {
	return [...itemStore.items, ...bottleStore.bottles];
});
const searchFilter = ref('');
const typeFilter = ref('');
const filteredItems = computed(() => {
	const filtered = ref(allItems.value);
	if (typeFilter.value != '') {
		filtered.value = filteredItems.value.filter(
			(item) => item.type === typeFilter.value
		);
	}
	return filtered.value.filter((item) =>
		item.name.toLowerCase().includes(searchFilter.value.toLowerCase())
	);
});
// Define Table Component
const columns = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'type', label: 'Type', sortable: true },
	{ key: 'amount', label: 'Amount' },
];
</script>

<template>
	<div>
		<SiteDatePicker v-model="inventoryStore.inventory.date" />
		<UInput
			v-model="searchFilter"
			placeholder="Filter items..." />
		<UTable
			:rows="filteredItems"
			:columns="columns">
			<template #type-header>
				<USelect
					v-model="typeFilter"
					:options="itemInventoryTypes()"
					placeholder="Filter by type" />
			</template>
			<template #amount-data="{ row }">
				<UInput v-model="inventoryStore.inventory.items[row._id.toString()]">
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
