<script setup>
const { batch, recipe } = defineProps(['batch', 'recipe']);
</script>

<template>
	<UCard>
		<template #header>
			<div class="flex justify-between">
				<h1>Batch Details</h1>
				<p>{{ batch?.status }}</p>
			</div>
		</template>
		<p>Recipe: {{ recipe?.name }}</p>
		<p>Class: {{ recipe?.class }}</p>
		<p>Type: {{ recipe?.type }}</p>
	</UCard>
</template>
