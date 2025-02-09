<script setup lang="ts">
import { ref } from 'vue';
import type { Cocktail } from '~/types';

const cocktailStore = useCocktailStore();
const isModalOpen = ref(false);
const editingCocktail = ref<Cocktail | null>(null);

const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'glassware', label: 'Glassware' },
	{ key: 'price', label: 'Price' },
	{ key: 'menu', label: 'Menu' },
	{ key: 'actions', label: 'Actions' },
];

const openModal = (cocktail: Cocktail | null = null) => {
	if (cocktail) {
		cocktailStore.cocktail = cocktail;
	}
	isModalOpen.value = true;
};

const closeModal = () => {
	editingCocktail.value = null;
	isModalOpen.value = false;
};

const handleSave = () => {
	cocktailStore.getCocktails();
	closeModal();
};

const handleDelete = async (cocktail: Cocktail) => {
	if (confirm(`Are you sure you want to delete ${cocktail.name}?`)) {
		await cocktailStore.deleteCocktail(cocktail._id.toString());
		cocktailStore.getCocktails();
	}
};

onMounted(() => {
	cocktailStore.getCocktails();
});
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold mb-4">Cocktail Management</h1>
		<UButton
			class="mb-4"
			color="primary"
			@click="openModal()">
			Add New Cocktail
		</UButton>
		<UTable
			:columns="columns"
			:rows="cocktailStore.cocktails">
			<template #price-data="{ row }">
				{{ Dollar.format(row.price) }}
			</template>
			<template #actions-data="{ row }">
				<UButton
					color="primary"
					variant="soft"
					icon="i-heroicons-pencil-square"
					class="mr-2"
					@click="openModal(row)" />
				<UButton
					color="red"
					variant="soft"
					icon="i-heroicons-trash"
					@click="handleDelete(row)" />
			</template>
		</UTable>

		<UModal v-model="isModalOpen">
			<UCard>
				<template #header>
					<h3 class="text-xl font-semibold">
						{{ editingCocktail ? 'Edit Cocktail' : 'Add New Cocktail' }}
					</h3>
				</template>
				<FormCocktail
					:edit-mode="!!editingCocktail"
					:cocktail-id="editingCocktail?._id"
					@save="handleSave"
					@cancel="closeModal" />
			</UCard>
		</UModal>
	</div>
</template>
