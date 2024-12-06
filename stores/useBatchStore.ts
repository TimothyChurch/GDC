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
		cost: undefined as unknown as number,
		batchSize: undefined as unknown as number,
		batchSizeUnit: '',
		brewDate: new Date(),
		fermenter: '',
		distillDate: new Date(),
		prevTails: {
			volume: undefined as unknown as number,
			volumeUnit: '',
			abv: undefined as unknown as number,
		},
		collected: {
			heads: {
				volume: undefined as unknown as number,
				volumeUnit: '',
				abv: undefined as unknown as number,
			},
			hearts: {
				volume: undefined as unknown as number,
				volumeUnit: '',
				abv: undefined as unknown as number,
			},
			tails: {
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
	});

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
			cost: undefined as unknown as number,
			batchSize: 0,
			batchSizeUnit: '',
			brewDate: new Date(),
			fermenter: '',
			distillDate: new Date(),
			prevTails: {
				volume: 0,
				volumeUnit: '',
				abv: 0,
			},
			collected: {
				heads: { volume: 0, volumeUnit: '', abv: 0 },
				hearts: { volume: 0, volumeUnit: '', abv: 0 },
				tails: { volume: 0, volumeUnit: '', abv: 0 },
				total: { volume: 0, volumeUnit: '', abv: 0 },
			},
		};
	};

	// Getters
	const getBatchById = (id: string): Batch | undefined => {
		return batches.value.find((b) => b._id.toString() === id);
	};

	return {
		batches,
		batch,
		getBatches,
		updateBatch,
		deleteBatch,
		resetBatch,
		getBatchById,
	};
});
