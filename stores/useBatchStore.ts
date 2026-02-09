import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Batch, Recipe } from '~/types';

export const useBatchStore = defineStore('batches', () => {
	// State
	const batches = ref<Batch[]>([]);
	const batch = ref<Batch>({
		_id: '',
		recipe: '',
		recipeCost: undefined as unknown as number,
		status: 'Upcoming',
		batchSize: undefined as unknown as number,
		batchSizeUnit: 'gallon',
		batchCost: undefined,
		brewing: {
			vessel: undefined,
			date: undefined,
			notes: '',
		},
		fermenting: {
			vessel: undefined,
			readings: [],
			notes: '',
		},
		distilling: {
			vessel: undefined,
			date: undefined,
			additions: {
				tails: {
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
			},
			collected: {
				heads: {
					vessel: undefined,
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
				hearts: {
					vessel: undefined,
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
				tails: {
					vessel: undefined,
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
				total: {
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
			},
			notes: '',
		},
		barreled: {
			vessel: undefined,
			entry: {
				date: undefined,
				volume: undefined,
				volumeUnit: '',
				abv: undefined,
			},
			exit: {
				date: undefined,
				volume: undefined,
				volumeUnit: '',
				abv: undefined,
			},
		},
		bottled: {
			productionRecord: undefined,
		},
	});

	const upcomingBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Upcoming')
	);
	const brewingBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Brewing')
	);
	const fermentingBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Fermenting')
	);
	const distillingBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Distilling')
	);
	const storedBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Storage')
	);
	const barreledBatches = computed(() =>
		batches.value.filter((batch) => batch.status == 'Barreled')
	);

	// Actions
	const getBatches = async (): Promise<void> => {
		const response = await $fetch('/api/batch');
		batches.value = response as Batch[];
	};
	getBatches();

	const setBatch = (id: string): void => {
		batch.value = batches.value.find(
			(batch) => batch._id === id
		) as Batch;
	};

	const updateBatch = async (): Promise<void> => {
		if (!batch.value._id) {
			await $fetch('/api/batch/create', {
				method: 'POST',
				body: JSON.stringify(batch.value),
			});
		} else {
			await $fetch(`/api/batch/${batch.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(batch.value),
			});
		}
		await getBatches();
		resetBatch();
	};

	const deleteBatch = async (id: string): Promise<void> => {
		await $fetch(`/api/batch/${id}`, {
			method: 'DELETE',
		});
		await getBatches();
	};

	const resetBatch = (): void => {
		batch.value = {
			_id: '',
			recipe: '',
			recipeCost: undefined as unknown as number,
			status: 'Upcoming',
			batchSize: undefined as unknown as number,
			batchSizeUnit: 'gallon',
			batchCost: undefined,
			brewing: {
				vessel: undefined,
				date: undefined,
				notes: '',
			},
			fermenting: {
				vessel: undefined,
				readings: [],
				notes: '',
			},
			distilling: {
				vessel: undefined,
				date: undefined,
				additions: {
					tails: {
						volume: undefined,
						volumeUnit: '',
						abv: undefined,
					},
				},
				collected: {
					heads: {
						vessel: undefined,
						volume: undefined,
						volumeUnit: '',
						abv: undefined,
					},
					hearts: {
						vessel: undefined,
						volume: undefined,
						volumeUnit: '',
						abv: undefined,
					},
					tails: {
						vessel: undefined,
						volume: undefined,
						volumeUnit: '',
						abv: undefined,
					},
					total: {
						volume: undefined,
						volumeUnit: '',
						abv: undefined,
					},
				},
				notes: '',
			},
			barreled: {
				vessel: undefined,
				entry: {
					date: undefined,
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
				exit: {
					date: undefined,
					volume: undefined,
					volumeUnit: '',
					abv: undefined,
				},
			},
			bottled: {
				productionRecord: undefined,
			},
		};
	};

	// Getters
	const getBatchById = (id: string): Batch | undefined => {
		return batches.value.find((b) => b._id === id);
	};

	const getBatchByStatus = (status: string): Batch[] => {
		return batches.value.filter((b) => b.status === status);
	};

	const batchStages = () => {
		return [
			'Upcoming',
			'Brewing',
			'Fermenting',
			'Distilling',
			'Storage',
			'Barrelled',
			'Bottled',
		];
	};

	const getRecipeNameByBatchId = (id: string): string | undefined => {
		const recipeStore = useRecipeStore();
		const batch = getBatchById(id);
		if (batch && batch.recipe) {
			const recipe = recipeStore.getRecipeById(batch.recipe) as Recipe;
			return recipe?.name;
		}
	};

	return {
		batches,
		batch,
		upcomingBatches,
		brewingBatches,
		fermentingBatches,
		distillingBatches,
		storedBatches,
		barreledBatches,
		getBatches,
		setBatch,
		updateBatch,
		deleteBatch,
		resetBatch,
		getBatchById,
		getBatchByStatus,
		batchStages,
		getRecipeNameByBatchId,
	};
});
