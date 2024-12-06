import { defineStore } from 'pinia';
import type { ObjectId } from 'mongoose';
import type { Vessel } from '~/types';

export const useVesselStore = defineStore('vessels', () => {
	// State
	const vessels = ref<Vessel[]>([]);
	const vessel = ref<Vessel>({
		_id: undefined as unknown as ObjectId,
		name: '',
		type: '',
		status: '',
		stats: {
			weight: undefined as unknown as number,
			weightUnit: '',
			volume: undefined as unknown as number,
			volumeUnit: '',
		},
		barrel: {
			size: '',
			char: '',
			cost: undefined as unknown as number,
		},
		contents: [],
		cost: undefined as unknown as number,
	});

	// Actions
	const getVessels = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/vessel');
			vessels.value = response as Vessel[];
		} catch (error) {
			console.error('Error fetching vessels:', error);
		}
	};

	const getVesselById = (id: string) => {
		try {
			return vessels.value.find((v) => v._id.toString() === id);
		} catch (error) {
			console.error('Error fetching vessel:', error);
		}
	};

	const updateVessel = async (): Promise<void> => {
		if (!vessel.value._id) {
			try {
				const response = await $fetch('/api/vessel/create', {
					method: 'POST',
					body: vessel.value,
				});
				vessels.value.push(response as Vessel);
				resetVessel();
			} catch (error) {
				console.error('Error creating vessel:', error);
			}
		} else {
			try {
				const response = await $fetch(`/api/vessel/${vessel.value._id}`, {
					method: 'PUT',
					body: vessel.value,
				});
				const index = vessels.value.findIndex(
					(v) => v._id === vessel.value._id
				);
				if (index !== -1) {
					vessels.value[index] = response as Vessel;
				}
				resetVessel();
			} catch (error) {
				console.error('Error updating vessel:', error);
			}
		}
	};

	const deleteVessel = async (id: string): Promise<void> => {
		try {
			await $fetch(`/api/vessel/${id}`, {
				method: 'DELETE',
			});
			vessels.value = vessels.value.filter((v) => v._id.toString() !== id);
		} catch (error) {
			console.error('Error deleting vessel:', error);
		}
	};

	const resetVessel = (): void => {
		vessel.value = {
			_id: undefined as unknown as ObjectId,
			name: '',
			type: '',
			status: '',
			stats: {
				weight: undefined as unknown as number,
				weightUnit: '',
				volume: undefined as unknown as number,
				volumeUnit: '',
			},
			barrel: {
				size: '',
				char: '',
				cost: undefined as unknown as number,
			},
			contents: [],
			cost: undefined as unknown as number,
		};
	};

	// Getters
	const getVesselByType = (type: string): Vessel[] => {
		return vessels.value.filter((v) => v.type === type);
	};

	return {
		vessels,
		vessel,
		getVessels,
		getVesselById,
		updateVessel,
		deleteVessel,
		resetVessel,
		getVesselByType,
	};
});
