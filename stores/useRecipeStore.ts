import type { ObjectId } from 'mongoose';
import type { Recipe } from '~/types';

export const useRecipeStore = defineStore('recipes', () => {
	// State
	const recipes = ref<Recipe[]>([]);
	const recipe = ref<Recipe>({
		_id: undefined as unknown as ObjectId,
		name: '',
		class: '',
		type: '',
		volume: 0,
		volumeUnit: '',
		items: [],
	});

	// CRUD actions
	const getRecipes = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/recipe');
			recipes.value = response as Recipe[];
		} catch (e) {
			console.error('Error fetching recipes:', e);
		}
	};

	const updateRecipe = async (): Promise<void> => {
		if (!recipe.value._id) {
			await $fetch('/api/recipe/create', {
				method: 'POST',
				body: JSON.stringify(recipe.value),
			});
		} else {
			await $fetch(`/api/recipe/${recipe.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(recipe.value),
			});
		}
		await getRecipes();
		resetRecipe();
	};

	const resetRecipe = (): void => {
		recipe.value = {
			_id: undefined as unknown as ObjectId,
			name: '',
			class: '',
			type: '',
			volume: 0,
			volumeUnit: '',
			items: [],
		};
	};

	const deleteRecipe = async (id: string): Promise<void> => {
		await $fetch(`/api/recipe/${id}`, {
			method: 'DELETE',
		});
		await getRecipes();
	};

	const getRecipeById = (id: string): Recipe | undefined => {
		return recipes.value.find((rec) => rec._id.toString() === id);
	};

	return {
		recipes,
		recipe,
		getRecipes,
		updateRecipe,
		deleteRecipe,
		getRecipeById,
		resetRecipe,
	};
});
