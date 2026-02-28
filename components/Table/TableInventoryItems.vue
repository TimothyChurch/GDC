<script setup lang="ts">
const router = useRouter();
const itemStore = useItemStore();

const rows = computed(() => {
	return itemStore.items.map((item) => {
		return {
			_id: item._id,
			name: item.name,
			vendor: itemStore.getVendorName(item._id) || '—',
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
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'type', header: 'Type' },
	{ accessorKey: 'vendor', header: 'Vendor' },
	{ accessorKey: 'price', header: 'Price / Unit' },
	{ accessorKey: 'stock', header: 'Stock' },
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
				:data="paginatedRows"
				:columns="columns"
				:loading="itemStore.loading"
				@select="(_e: Event, row: any) => router.push(`/admin/items/${row.original._id}`)"
				:ui="{ tr: 'cursor-pointer' }">
				<template #empty>
					<BaseEmptyState icon="i-lucide-package" title="No inventory items found" />
				</template>
			</UTable>
		</div>
		<div class="flex flex-col sm:flex-row justify-between gap-2">
			<UFormField label="Results per Page">
				<USelect
					:items="[5, 10, 20, 100]"
					v-model="pageCount" />
			</UFormField>
			<div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model:page="page"
					:items-per-page="pageCount"
					:total="filteredRows.length" />
			</div>
		</div>
	</div>
</template>
