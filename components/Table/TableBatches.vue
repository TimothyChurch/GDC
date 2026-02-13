<script setup>
const router = useRouter();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();
const { confirm } = useDeleteConfirm();

const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
	if (!search.value) return batchStore.batches;
	const q = search.value.toLowerCase();
	return batchStore.batches.filter((batch) => {
		const recipeName = recipeStore.getRecipeById(batch.recipe)?.name?.toLowerCase() || '';
		const status = batch.status?.toLowerCase() || '';
		return recipeName.includes(q) || status.includes(q);
	});
});

const rows = computed(() => {
	return filteredData.value.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});

const columns = [
	{ key: 'recipe', label: 'Recipe', sortable: true },
	{ key: 'batchCost', label: 'Batch Costs', sortable: true },
	{ key: 'status', label: 'Status', sortable: true },
	{ key: 'actions' },
];
const items = (row) => [
	[
		{
			label: 'Details',
			click: () => router.push(`/admin/batch/${row._id}`),
		},
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
const addItem = () => {
	batchStore.resetBatch();
	formSelection.value = 'FormBatch';
	toggleFormModal();
};
const editItem = (row) => {
	batchStore.batch = row;
	formSelection.value = 'FormBatch';
	toggleFormModal();
};
const deleteItem = async (row) => {
	const confirmed = await confirm('Batch', recipeStore.getRecipeById(row.recipe)?.name);
	if (confirmed) {
		batchStore.deleteBatch(row._id.toString());
	}
};
</script>

<template>
	<div>
		<UInput v-model="search" placeholder="Search batches..." class="mb-2" />
		<div class="overflow-x-auto">
			<UTable
				:rows="rows"
				:columns="columns"
				:loading="batchStore.loading">
				<template #empty-state>
					<div class="flex flex-col items-center justify-center py-6 gap-3">
						<span class="text-sm text-gray-500">No batches found</span>
					</div>
				</template>
				<template #recipe-data="{ row }">
					{{ recipeStore.getRecipeById(row.recipe)?.name }}
				</template>
				<template #batchCost-data="{ row }">
					{{ Dollar.format(row.batchCost) }}
				</template>
				<template #actions-header>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-plus-20-solid"
						@click="addItem()" />
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
		</div>
		<div class="flex flex-col sm:flex-row justify-between gap-2">
			<UFormGroup label="Results per Page">
				<USelect
					:options="[5, 10, 20, 100]"
					v-model="pageCount" />
			</UFormGroup>
			<div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="filteredData.length" />
			</div>
		</div>
	</div>
</template>
