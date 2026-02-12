<script setup lang="ts">
const itemStore = useItemStore();
const contactStore = useContactStore();

const rows = computed(() => {
	return itemStore.items.map((item) => {
		return {
			_id: item._id,
			name: item.name,
			vendor: contactStore.getContactById(item.vendor?.toString())
				?.businessName,
			price: `${Dollar.format(latestPrice(item) as number)} / ${
				item.inventoryUnit
			}`,
			stock: currentStock(item),
		};
	});
});

const filterSearch = ref('');

const filteredRows = computed(() => {
	if (filterSearch.value === '') {
		return rows.value;
	} else {
		return rows.value.filter((row) => {
			return row.name.toLowerCase().includes(filterSearch.value.toLowerCase());
		});
	}
});

const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'type', label: 'Type' },
	{ key: 'vendor', label: 'Vendor' },
	{ key: 'price', label: 'Price / Unit' },
	{ key: 'stock', label: 'Stock' },
];
</script>

<template>
	<div>
		<UButtonGroup>
			<UInput
				v-model="filterSearch"
				placeholder="Search..." />
			<UButton
				color="gray"
				@click="filterSearch = ''">
				X
			</UButton>
		</UButtonGroup>
		<UTable
			:rows="filteredRows"
			:columns="columns"
			:loading="itemStore.loading">
			<template #empty-state>
				<div class="flex flex-col items-center justify-center py-6 gap-3">
					<span class="text-sm text-gray-500">No inventory items found</span>
				</div>
			</template>
		</UTable>
	</div>
</template>
