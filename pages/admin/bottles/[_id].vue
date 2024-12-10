<script setup>
definePageMeta({
	layout: 'admin',
});
const bottleStore = useBottleStore();
const route = useRoute();
bottleStore.selectBottle(route.params._id);

const editBottle = () => {
	formSelection.value = 'FormBottle';
	toggleFormModal();
};
</script>

<template>
	<div>
		<h1>{{ bottleStore.bottle.name }}</h1>
		<h2>Testing</h2>
		{{ bottleStore.bottle }}
		<UButton @click="editBottle">Edit Bottle</UButton>
	</div>
</template>
