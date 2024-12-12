<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const props = defineProps(['batchId']);

const batch = computed(() => batchStore.getBatchById(props.batchId));
</script>

<template>
	<UCard>
		<template #header>
			{{ recipeStore.getRecipeById(batch?.recipe)?.name }}
		</template>
		<div>Batch info will go here</div>
	</UCard>
</template>
