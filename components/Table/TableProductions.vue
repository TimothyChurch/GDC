<script setup>
// Access needed stores
const productionsStore = useProductionStore();
const vesselStore = useVesselStore();
const bottlestore = useBottleStore();
const { confirm } = useDeleteConfirm();
// Columns for table data
const columns = [
	{ key: 'date', label: 'Date', sortable: true },
	{ key: 'vessel', label: 'Vessel' },
	{ key: 'bottle', label: 'Bottle' },
	{ key: 'quantity', label: 'Quantity' },
	{ key: 'productionCost', label: 'Production Cost' },
	{ key: 'bottleCost', label: 'Bottle Cost' },
	{ key: 'actions', label: 'Actions' },
];
// Table search and pagination
const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
	if (!search.value) return productionsStore.productions;
	const q = search.value.toLowerCase();
	return productionsStore.productions.filter((p) => {
		const bottleName = bottlestore.getName(p.bottle)?.toLowerCase() || '';
		return bottleName.includes(q);
	});
});

const rows = computed(() => {
	return filteredData.value.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});
// Action buttons
const items = (row) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editItem(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteItem(row),
		},
	],
];
// Actions
const newItem = () => {
	formSelection.value = 'FormProduction';
	toggleFormModal();
};

const editItem = (row) => {
	productionsStore.production = row;
	formSelection.value = 'FormProduction';
	toggleFormModal();
};

const deleteItem = async (row) => {
	const confirmed = await confirm('Production', bottlestore.getName(row.bottle));
	if (confirmed) {
		await productionsStore.deleteProduction(row._id);
	}
};
</script>

<template>
	<div>
		<UInput v-model="search" placeholder="Search productions..." class="mb-2" />
		<UTable
			:rows="rows"
			:columns="columns"
			:loading="productionsStore.loading">
			<template #empty-state>
				<div class="flex flex-col items-center justify-center py-6 gap-3">
					<span class="text-sm text-gray-500">No productions found</span>
				</div>
			</template>
			<template #date-data="{ row }">
				{{
					new Date(row.date).toLocaleString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})
				}}
			</template>
			<template #vessel-data="{ row }">
				{{
					vesselStore.vessels
						.filter((vessel) => row.vessel.includes(vessel._id))
						.map((vessel) => vessel.name)
						.join(', ')
				}}
			</template>
			<template #bottle-data="{ row }">
				{{ bottlestore.getName(row.bottle) }}
			</template>
			<template #productionCost-data="{ row }">
				{{ Dollar.format(row.productionCost) }}
			</template>
			<template #bottleCost-data="{ row }">
				{{ Dollar.format(row.bottleCost) }}
			</template>
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="newItem" />
			</template>
			<template #actions-data="{ row }">
				<UDropdown :items="items(row)">
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-ellipsis-horizontal-20-solid" />
				</UDropdown>
			</template>
		</UTable>
		<div class="flex justify-between">
			<UFormGroup label="Results per Page">
				<USelect
					:options="[5, 10, 20, 100]"
					v-model="pageCount" />
			</UFormGroup>
			<div
				class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="filteredData.length" />
			</div>
		</div>
	</div>
</template>
