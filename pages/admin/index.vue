<script setup>
definePageMeta({
	layout: 'admin',
});
</script>

<template>
	<div class="flex flex-col gap-3 flex-grow mx-auto">
		<DashboardUpcoming />
		<DashboardBrewing />
		<DashboardFermenters />
		<DashboardDistilling />
	</div>
</template>
