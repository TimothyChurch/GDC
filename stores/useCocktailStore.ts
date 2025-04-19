import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Cocktail } from '~/types';
import type { ObjectId } from 'mongoose';

export const useCocktailStore = defineStore('cocktails', () => {
	// State
	const cocktails = ref<Cocktail[]>([]);
	const cocktail = ref<Cocktail>({
		_id: undefined as unknown as ObjectId,
		name: '',
		glassware: '',
		ingredients: [],
		cost: 0,
		price: 0,
		menu: '',
		description: '',
		directions: '',
	});
	// Getters

	// CRUD actions
	const getCocktails = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/cocktail');
			cocktails.value = response as Cocktail[];
		} catch (e) {
			console.error('Error fetching cocktails:', e);
		}
		sortCocktails();
	};
	getCocktails();

	const setCocktail = (id: string) => {
		const foundCocktail = cocktails.value.find((c) => c._id.toString() === id);
		if (foundCocktail) {
			cocktail.value = foundCocktail;
		} else {
			console.error(`Cocktail with ID ${id} not found.`);
		}
	};

	const updateCocktail = async (): Promise<void> => {
		if (!cocktail.value._id) {
			await $fetch('/api/cocktail/create', {
				method: 'POST',
				body: JSON.stringify(cocktail.value),
			});
		} else {
			await $fetch(`/api/cocktail/${cocktail.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(cocktail.value),
			});
		}
		getCocktails();
		resetCocktail();
	};

	const resetCocktail = (): void => {
		cocktail.value = {
			_id: undefined as unknown as ObjectId,
			name: '',
			glassware: '',
			ingredients: [],
			cost: 0,
			price: 0,
			menu: '',
			description: '',
			directions: '',
		};
	};

	const deleteCocktail = async (id: string): Promise<void> => {
		await $fetch(`/api/cocktail/${id}`, {
			method: 'DELETE',
		});
		await getCocktails();
	};

	const getCocktailById = (id: string): Cocktail | undefined => {
		return cocktails.value.find((c) => c._id.toString() === id);
	};

	const search = (searchTerm: string): Cocktail[] => {
		return cocktails.value.filter(
			(c) =>
				c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.menu.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	const sortCocktails = () => {
		cocktails.value.sort((a, b) => {
			const nameA = a.name.toUpperCase();
			const nameB = b.name.toUpperCase();
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
	};

	const cocktailCost = (cocktail: Cocktail | string): number => {
		return 0
	}

	return {
		cocktails,
		cocktail,
		getCocktails,
		setCocktail,
		updateCocktail,
		resetCocktail,
		deleteCocktail,
		getCocktailById,
		search,
	};
});
