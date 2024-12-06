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
			<h1>Vessel Table</h1>
			<TableVessels />
			<h1>Batch Table</h1>
			<TableBatches />
		</div>
	</div>
</template>
