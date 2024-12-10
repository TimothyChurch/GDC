<script setup>
const items = () => [
	[
		{
			label: 'Contact',
			click: () => {
				formSelection.value = 'FormContact';
				toggleFormModal();
			},
		},
		{
			label: 'Item',
			click: () => {
				formSelection.value = 'FormItem';
				toggleFormModal();
			},
		},
		{
			label: 'Recipe',
			click: () => {
				formSelection.value = 'FormRecipe';
				toggleFormModal();
			},
		},
		{
			label: 'Batch',
			click: () => {
				formSelection.value = 'FormBatch';
				toggleFormModal();
			},
		},
		{
			label: 'Vessel',
			click: () => {
				formSelection.value = 'FormVessel';
				toggleFormModal();
			},
		},
		{
			label: 'Inventory',
			click: () => {
				formSelection.value = 'FormInventory';
				toggleFormModal();
			},
		},
		{
			label: 'Purchase Order',
			click: () => {
				formSelection.value = 'FormPurchaseOrder';
				toggleFormModal();
			},
		},
		{
			label: 'Inventory',
			click: () => {
				formSelection.value = 'FormInventory';
				toggleFormModal();
			},
		},
	],
];
</script>

<template>
	<div class="flex justify-between p-3 h-14">
		<div>Profile Area</div>
		<AdminSearch />
		<div name="Right Nav">
			<UDropdown :items="items()">
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-circle"
					size="xl" />
			</UDropdown>
			<UButton
				color="gray"
				variant="ghost"
				icon="i-heroicons-calculator"
				@click="toggleCalculatorModal" />
		</div>
	</div>
</template>
