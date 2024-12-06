<script setup>
const productionStore = useProductionStore();
</script>

<template>
	<div>
		<UTable :rows="productionStore.productions" />
	</div>
</template>
