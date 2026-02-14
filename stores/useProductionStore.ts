import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Production } from '~/types';

export const useProductionStore = defineStore('productions', () => {
	const toast = useToast();

	// State
	const productions = ref<Production[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
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
		loading.value = true;
		try {
			const response = await $fetch('/api/production');
			productions.value = response as Production[];
		} catch (error) {
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			await getProductions();
			loaded.value = true;
		}
	};

	const getProductionById = async (id: string): Promise<void> => {
		try {
			const response = await $fetch(`/api/production/${id}`);
			production.value = response as Production;
		} catch (error) {
		}
	};

	const updateProduction = async (): Promise<void> => {
		saving.value = true;
		try {
			const isNew = !production.value._id;
			if (isNew) {
				const response = await $fetch('/api/production/create', {
					method: 'POST',
					body: production.value,
				});
				productions.value.push(response as Production);
			} else {
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
			}
			toast.add({ title: `Production ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetProduction();
		} catch (error: any) {
			toast.add({ title: 'Failed to save production', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const deleteProduction = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/production/${id}`, {
				method: 'DELETE',
			});
			productions.value = productions.value.filter(
				(p) => p._id !== id
			);
			toast.add({ title: 'Production deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete production', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
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
		loaded,
		loading,
		saving,
		ensureLoaded,
		getProductions,
		getProductionById,
		updateProduction,
		deleteProduction,
		resetProduction,
		getProductionsByDate,
	};
});
