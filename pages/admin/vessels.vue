<script setup>
definePageMeta({
	layout: 'admin',
});
const vesselStore = useVesselStore();
</script>

<template>
	<div>
		<TableVessels />
	</div>
</template>
