<script setup>
definePageMeta({
	layout: 'admin',
});
const route = useRoute();

const batchStore = useBatchStore();

batchStore.batch = batchStore.getBatchById(route.params._id);
</script>

<template>
	<div>
		{{ batchStore.batch }}
	</div>
</template>
