<script setup>
const vesselStore = useVesselStore();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

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
		key: 'status',
		label: 'Status',
	},
	{
		key: 'contents',
		label: 'Contents',
	},
	{
		key: 'actions',
	},
];

const items = (row) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editVessel(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteVessel(row._id),
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
const deleteVessel = (row) => {
	vesselStore.deleteVessel(row._id);
};
</script>

<template>
	<div>
		<UTable
			:rows="vesselStore.vessels"
			:columns="columns">
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
	</div>
</template>
