import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Batch, Recipe } from '~/types';

export const useBatchStore = defineStore('batches', () => {
	const toast = useToast();

	// State
	const batches = ref<Batch[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
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
		loading.value = true;
		try {
			const response = await $fetch('/api/batch');
			batches.value = response as Batch[];
		} catch (e) {
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			await getBatches();
			loaded.value = true;
		}
	};

	const setBatch = (id: string): void => {
		batch.value = batches.value.find(
			(batch) => batch._id === id
		) as Batch;
	};

	const updateBatch = async (): Promise<void> => {
		saving.value = true;
		try {
			const isNew = !batch.value._id;
			if (isNew) {
				const response = await $fetch('/api/batch/create', {
					method: 'POST',
					body: JSON.stringify(batch.value),
				});
				batches.value.push(response as Batch);
			} else {
				const response = await $fetch(`/api/batch/${batch.value._id}`, {
					method: 'PUT',
					body: JSON.stringify(batch.value),
				});
				const index = batches.value.findIndex((b) => b._id === batch.value._id);
				if (index !== -1) {
					batches.value[index] = response as Batch;
				}
			}
			toast.add({ title: `Batch ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetBatch();
		} catch (error: any) {
			toast.add({ title: 'Failed to save batch', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const deleteBatch = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/batch/${id}`, {
				method: 'DELETE',
			});
			batches.value = batches.value.filter((b) => b._id !== id);
			toast.add({ title: 'Batch deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete batch', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
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

	const startBrewing = async (batchId: string, vesselId: string): Promise<void> => {
		const vesselStore = useVesselStore();
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;

		target.status = 'Brewing';
		target.brewing = {
			...target.brewing,
			vessel: vesselId,
			date: new Date(),
		};
		batch.value = target;
		await updateBatch();

		// Add batch contents to the mash tun
		await vesselStore.addContents(vesselId, {
			batch: batchId,
			volume: target.batchSize || 0,
			volumeUnit: target.batchSizeUnit || 'gallon',
			abv: 0,
			value: target.batchCost || 0,
		});
	};

	const advanceBatchStatus = async (batchId: string, newStatus: string, stageData?: { vessel?: string; date?: Date }): Promise<void> => {
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;

		target.status = newStatus;

		const statusFieldMap: Record<string, string> = {
			Brewing: 'brewing',
			Fermenting: 'fermenting',
			Distilling: 'distilling',
			Storage: 'storage',
			Barreled: 'barreled',
			Bottled: 'bottled',
		};

		const stageKey = statusFieldMap[newStatus];
		if (stageKey && stageData) {
			const stage = (target as any)[stageKey];
			if (stage) {
				if (stageData.vessel !== undefined) stage.vessel = stageData.vessel;
				if (stageData.date !== undefined) stage.date = stageData.date;
			}
		}

		batch.value = target;
		await updateBatch();
	};

	// Getters
	const getBatchById = (id: string): Batch | undefined => {
		return batches.value.find((b) => b._id === id);
	};

	const getBatchByStatus = (status: string): Batch[] => {
		return batches.value.filter((b) => b.status === status);
	};

	const batchStages = () => {
		return BATCH_STAGES.map((s) => s.name);
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
		loaded,
		loading,
		saving,
		upcomingBatches,
		brewingBatches,
		fermentingBatches,
		distillingBatches,
		storedBatches,
		barreledBatches,
		ensureLoaded,
		getBatches,
		setBatch,
		updateBatch,
		deleteBatch,
		resetBatch,
		getBatchById,
		getBatchByStatus,
		batchStages,
		getRecipeNameByBatchId,
		startBrewing,
		advanceBatchStatus,
	};
});
