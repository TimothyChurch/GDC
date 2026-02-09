import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Production } from '~/types';

export const useProductionStore = defineStore('productions', () => {
	// State
	const productions = ref<Production[]>([]);
	const production = ref<Production>({
		_id: '',
		date: new Date(),
		vessel: [],
		bottle: '',
		bottling: {
			glassware: '',
			cap: '',
			label: '',
		},
		quantity: 0,
		productionCost: 0,
		bottleCost: 0,
	});

	// Actions
	const getProductions = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/production');
			productions.value = response as Production[];
		} catch (error) {
			console.error('Error fetching productions:', error);
		}
	};
	getProductions();

	const getProductionById = async (id: string): Promise<void> => {
		try {
			const response = await $fetch(`/api/production/${id}`);
			production.value = response as Production;
		} catch (error) {
			console.error('Error fetching production:', error);
		}
	};

	const createProduction = async (): Promise<void> => {};

	const updateProduction = async (): Promise<void> => {
		if (!production.value._id) {
			try {
				const response = await $fetch('/api/production/create', {
					method: 'POST',
					body: production.value,
				});
				productions.value.push(response as Production);
				resetProduction();
			} catch (error) {
				console.error('Error creating production:', error);
			}
		} else {
			try {
				const response = await $fetch(
					`/api/production/${production.value._id}`,
					{
						method: 'PUT',
						body: production.value,
					}
				);
				const index = productions.value.findIndex(
					(p) => p._id === production.value._id
				);
				if (index !== -1) {
					productions.value[index] = response as Production;
				}
				resetProduction();
			} catch (error) {
				console.error('Error updating production:', error);
			}
		}
	};

	const deleteProduction = async (id: string): Promise<void> => {
		try {
			await $fetch(`/api/production/${id}`, {
				method: 'DELETE',
			});
			productions.value = productions.value.filter(
				(p) => p._id !== id
			);
		} catch (error) {
			console.error('Error deleting production:', error);
		}
	};

	const resetProduction = (): void => {
		production.value = {
			_id: '',
			date: new Date(),
			vessel: [],
			bottle: '',
			bottling: {
				glassware: '',
				cap: '',
				label: '',
			},
			quantity: 0,
			productionCost: 0,
			bottleCost: 0,
		};
	};

	// Getters
	const getProductionsByDate = (date: Date): Production[] => {
		return productions.value.filter(
			(p) => new Date(p.date).toDateString() === date.toDateString()
		);
	};

	return {
		productions,
		production,
		getProductions,
		getProductionById,
		createProduction,
		updateProduction,
		deleteProduction,
		resetProduction,
		getProductionsByDate,
	};
});
