import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { useRecipeStore } from '~/stores/useRecipeStore.ts';

describe('useRecipeStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('initializes with empty recipes array', () => {
		const store = useRecipeStore();
		expect(store.recipes).toEqual([]);
	});

	it('initializes with empty recipe object', () => {
		const store = useRecipeStore();
		expect(store.recipe).toEqual({
			_id: undefined,
			name: '',
			class: '',
			type: '',
			volume: 0,
			volumeUnit: '',
			items: [],
		});
	});

	it('getRecipes fetches recipes and updates state', async () => {
		const store = useRecipeStore();
		const mockRecipes = [{ _id: '1', name: 'Test Recipe' }];

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			json: () => Promise.resolve(mockRecipes),
		} as any);

		await store.getRecipes();
		expect(store.recipes).toEqual(mockRecipes);
	});

	it('updateRecipe creates a new recipe when _id is not set', async () => {
		const store = useRecipeStore();
		const newRecipe = {
			name: 'New Recipe',
			class: 'Test',
			type: 'Test',
			volume: 10,
			volumeUnit: 'L',
			items: [],
		};
		store.recipe = newRecipe as any;

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			json: () => Promise.resolve({}),
		} as any);

		await store.updateRecipe();
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/recipe/create',
			expect.any(Object)
		);
	});

	it('updateRecipe updates an existing recipe when _id is set', async () => {
		const store = useRecipeStore();
		const existingRecipe = {
			_id: '1',
			name: 'Existing Recipe',
			class: 'Test',
			type: 'Test',
			volume: 10,
			volumeUnit: 'L',
			items: [],
		};
		store.recipe = existingRecipe as any;

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			json: () => Promise.resolve({}),
		} as any);

		await store.updateRecipe();
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/recipe/1',
			expect.any(Object)
		);
	});

	it('deleteRecipe calls API and updates recipes', async () => {
		const store = useRecipeStore();
		const recipeId = '1';

		vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			json: () => Promise.resolve({}),
		} as any);

		await store.deleteRecipe(recipeId);
		expect(global.fetch).toHaveBeenCalledWith(
			`/api/recipe/${recipeId}`,
			expect.any(Object)
		);
	});

	it('getRecipeById returns the correct recipe', () => {
		const store = useRecipeStore();
		const mockRecipes = [
			{ _id: '1', name: 'Recipe 1' },
			{ _id: '2', name: 'Recipe 2' },
		];
		store.recipes = mockRecipes as any;

		const result = store.getRecipeById('2');
		expect(result).toEqual({ _id: '2', name: 'Recipe 2' });
	});

	it('resetRecipe resets the recipe object', () => {
		const store = useRecipeStore();
		store.recipe = { _id: '1', name: 'Test Recipe' } as any;

		store.resetRecipe();
		expect(store.recipe).toEqual({
			_id: undefined,
			name: '',
			class: '',
			type: '',
			volume: 0,
			volumeUnit: '',
			items: [],
		});
	});
});
