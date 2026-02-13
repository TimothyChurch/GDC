<script setup>
const vesselStore = useVesselStore();
const { confirm } = useDeleteConfirm();

const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
	if (!search.value) return vesselStore.vessels;
	const q = search.value.toLowerCase();
	return vesselStore.vessels.filter((v) => {
		return v.name?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q);
	});
});

const rows = computed(() => {
	return filteredData.value.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});

const columns = [
	{
		key: 'name',
		label: 'Name',
		sortable: true,
	},
	{
		key: 'type',
		label: 'Type',
		sortable: true,
	},
	{
		key: 'current',
		label: 'Current',
	},
	{
		key: 'actions',
	},
];

const items = (row) => [
	[
		{
			label: 'Empty Vessel',
			click: () => vesselStore.emptyVessel(row._id),
		},
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editVessel(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteVessel(row),
		},
	],
];

const addVessel = () => {
	vesselStore.resetVessel();
	formSelection.value = 'FormVessel';
	toggleFormModal();
};
const editVessel = (row) => {
	vesselStore.vessel = row;
	formSelection.value = 'FormVessel';
	toggleFormModal();
};
const deleteVessel = async (row) => {
	const confirmed = await confirm('Vessel', row.name);
	if (confirmed) {
		vesselStore.deleteVessel(row._id);
	}
};
</script>

<template>
	<div>
		<UInput v-model="search" placeholder="Search vessels..." class="mb-2" />
		<UTable
			:rows="rows"
			:columns="columns"
			:loading="vesselStore.loading">
			<template #empty-state>
				<div class="flex flex-col items-center justify-center py-6 gap-3">
					<span class="text-sm text-gray-500">No vessels found</span>
				</div>
			</template>
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="addVessel()" />
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
			<div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="filteredData.length" />
			</div>
		</div>
	</div>
</template>
