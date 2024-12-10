<script setup>
definePageMeta({
	layout: 'admin',
});
</script>

<template>
	<div>
		<div class="flex flex-col gap-3">
			<h1>Production Table</h1>
			<TableProductions />
			<h1>Inventory Table</h1>
			<TableInventoryItems />
		</div>
	</div>
</template>
