import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Batch } from '~/types';
import type { ObjectId } from 'mongoose';

export const useBatchStore = defineStore('batches', () => {
	// State
	const batches = ref<Batch[]>([]);
	const batch = ref<Batch>({
		_id: undefined as unknown as ObjectId,
		recipe: undefined as unknown as ObjectId,
		recipeCost: undefined as unknown as number,
		status: {
			stage: '',
			vessel: '',
		},
		batchSize: undefined as unknown as number,
		batchSizeUnit: undefined as unknown as string,
		batchCost: undefined as unknown as number,
		brewing: {
			vessel: undefined as unknown as ObjectId,
			date: undefined as unknown as Date,
			notes: '',
		},
		fermenting: {
			vessel: undefined as unknown as ObjectId,
			notes: '',
		},
		distilling: {
			vessel: undefined as unknown as ObjectId,
			date: undefined as unknown as Date,
			additions: {
				tails: {
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
			},
			collected: {
				heads: {
					vessel: undefined as unknown as ObjectId,
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
				hearts: {
					vessel: undefined as unknown as ObjectId,
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
				tails: {
					vessel: undefined as unknown as ObjectId,
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
				total: {
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
			},
			notes: '',
		},
		barreled: {
			vessel: undefined as unknown as ObjectId,
			entry: {
				date: undefined as unknown as Date,
				volume: undefined as unknown as number,
				volumeUnit: '',
				abv: undefined as unknown as number,
			},
			exit: {
				date: undefined as unknown as Date,
				volume: undefined as unknown as number,
				volumeUnit: '',
				abv: undefined as unknown as number,
			},
		},
		bottled: {
			productionRecord: undefined as unknown as ObjectId,
		},
	});

	const upcomingBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Upcoming')
	);
	const brewingBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Brewing')
	);
	const fermentingBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Fermenting')
	);
	const distillingBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Distilling')
	);
	const storedBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Storage')
	);
	const barreledBatches = computed(() =>
		batches.value.filter((batch) => batch.status.stage === 'Barreled')
	);

	// Actions
	const getBatches = async (): Promise<void> => {
		const response = await $fetch('/api/batch');
		batches.value = response as Batch[];
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
			_id: undefined as unknown as ObjectId,
			recipe: undefined as unknown as ObjectId,
			recipeCost: undefined as unknown as number,
			status: {
				stage: '',
				vessel: '',
			},
			batchSize: undefined as unknown as number,
			batchSizeUnit: undefined as unknown as string,
			batchCost: undefined as unknown as number,
			brewing: {
				vessel: undefined as unknown as ObjectId,
				date: undefined as unknown as Date,
				notes: '',
			},
			fermenting: {
				vessel: undefined as unknown as ObjectId,
				notes: '',
			},
			distilling: {
				vessel: undefined as unknown as ObjectId,
				date: undefined as unknown as Date,
				additions: {
					tails: {
						volume: undefined as unknown as number,
						volumeUnit: '',
						abv: undefined as unknown as number,
					},
				},
				collected: {
					heads: {
						vessel: undefined as unknown as ObjectId,
						volume: undefined as unknown as number,
						volumeUnit: '',
						abv: undefined as unknown as number,
					},
					hearts: {
						vessel: undefined as unknown as ObjectId,
						volume: undefined as unknown as number,
						volumeUnit: '',
						abv: undefined as unknown as number,
					},
					tails: {
						vessel: undefined as unknown as ObjectId,
						volume: undefined as unknown as number,
						volumeUnit: '',
						abv: undefined as unknown as number,
					},
					total: {
						volume: undefined as unknown as number,
						volumeUnit: '',
						abv: undefined as unknown as number,
					},
				},
				notes: '',
			},
			barreled: {
				vessel: undefined as unknown as ObjectId,
				entry: {
					date: undefined as unknown as Date,
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
				exit: {
					date: undefined as unknown as Date,
					volume: undefined as unknown as number,
					volumeUnit: '',
					abv: undefined as unknown as number,
				},
			},
			bottled: {
				productionRecord: undefined as unknown as ObjectId,
			},
		};
	};

	// Getters
	const getBatchById = (id: string): Batch | undefined => {
		return batches.value.find((b) => b._id.toString() === id);
	};

	const getBatchByStatus = (status: string): Batch[] => {
		return batches.value.filter((b) => b.status?.stage === status);
	};

	const batchStages = () => {
		const statusOptions = [
			{ stage: 'Upcoming', vessel: '' },
			{ stage: 'Brewing', vessel: 'Mash Tun' },
			{ stage: 'Fermenting', vessel: 'Fermenter' },
			{ stage: 'Distilling', vessel: 'Still' },
			{ stage: 'Storage', vessel: 'Tank' },
			{ stage: 'Barrelled', vessel: 'Barrel' },
			{ stage: 'Bottled', vessel: '' },
		];
		batches.value.forEach((batch) => {
			if (
				batch.status?.stage &&
				!statusOptions.some((b) => b.stage === batch.status?.stage)
			) {
				statusOptions.push(batch.status);
			}
		});
		return statusOptions;
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
		updateBatch,
		deleteBatch,
		resetBatch,
		getBatchById,
		getBatchByStatus,
		batchStages,
	};
});
