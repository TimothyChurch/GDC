<script setup lang="ts">
const router = useRouter();
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

const page = ref(1);
const pageCount = ref(10);

const paginatedRows = computed(() => {
	return filteredRows.value.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});

const columns = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'type', label: 'Type', sortable: true },
	{ key: 'vendor', label: 'Vendor', sortable: true },
	{ key: 'price', label: 'Price / Unit' },
	{ key: 'stock', label: 'Stock' },
];
</script>

<template>
	<div>
		<UFieldGroup>
			<UInput
				v-model="filterSearch"
				placeholder="Search..." />
			<UButton
				color="neutral"
				@click="filterSearch = ''">
				X
			</UButton>
		</UFieldGroup>
		<div class="overflow-x-auto">
			<UTable
				:rows="paginatedRows"
				:columns="columns"
				:loading="itemStore.loading"
				@select="(_e: Event, row: any) => router.push(`/admin/items/${row.original._id}`)"
				:ui="{ tr: 'cursor-pointer' }">
				<template #empty-state>
					<div class="flex flex-col items-center justify-center py-6 gap-3">
						<span class="text-sm text-gray-500">No inventory items found</span>
					</div>
				</template>
			</UTable>
		</div>
		<div class="flex flex-col sm:flex-row justify-between gap-2">
			<UFormField label="Results per Page">
				<USelect
					:options="[5, 10, 20, 100]"
					v-model="pageCount" />
			</UFormField>
			<div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="filteredRows.length" />
			</div>
		</div>
	</div>
</template>
