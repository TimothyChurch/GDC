import { defineStore } from 'pinia';
import type { Vessel } from '~/types';

export const useVesselStore = defineStore('vessels', () => {
	// State
	const vessels = ref<Vessel[]>([]);
	const vessel = ref<Vessel>({
		_id: '',
		name: '',
		type: '',
		stats: {
			weight: undefined,
			weightUnit: '',
			volume: undefined,
			volumeUnit: '',
		},
		barrel: {
			size: '',
			char: '',
			cost: undefined,
		},
		contents: [],
		current: {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		},
		cost: undefined,
	});
	const fermenters = computed(() =>
		vessels.value.filter((v) => v.type === 'Fermenter')
	);
	const mashTuns = computed(() =>
		vessels.value.filter((v) => v.type === 'Mash Tun')
	);
	const stills = computed(() =>
		vessels.value.filter((v) => v.type === 'Still')
	);
	const tanks = computed(() => vessels.value.filter((v) => v.type === 'Tank'));
	const barrels = computed(() =>
		vessels.value.filter((v) => v.type === 'Barrel')
	);

	// Actions
	const getVessels = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/vessel');
			vessels.value = response as Vessel[];
		} catch (error) {
			console.error('Error fetching vessels:', error);
		}
	};
	getVessels();

	const getVesselById = (id: string) => {
		try {
			return vessels.value.find((v) => v._id === id);
		} catch (error) {
			console.error('Error fetching vessel:', error);
		}
	};

	const setVessel = (id: string) => {
		resetVessel();
		vessel.value = vessels.value.find((v) => v._id === id) as Vessel;
	};

	const updateVessel = async (): Promise<void> => {
		if (vessel.value.contents && vessel.value.contents.length > 0) {
			vessel.value.current = {
				volume: vessel.value.contents.reduce((acc, c) => acc + c.volume, 0),
				volumeUnit: vessel.value.contents[0].volumeUnit,
				abv:
					vessel.value.contents
						.map((c) => {
							return (c.abv * c.volume) / 100;
						})
						.reduce((acc, curr) => acc + curr, 0) /
					vessel.value.contents.length,
				value: vessel.value.contents.reduce((acc, c) => acc + c.value, 0),
			};
		}
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
				await $fetch(`/api/vessel/${vessel.value._id}`, {
					method: 'PUT',
					body: vessel.value,
				});

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
			vessels.value = vessels.value.filter((v) => v._id !== id);
		} catch (error) {
			console.error('Error deleting vessel:', error);
		}
	};

	const resetVessel = (): void => {
		vessel.value = {
			_id: '',
			name: '',
			type: '',
			stats: {
				weight: undefined,
				weightUnit: '',
				volume: undefined,
				volumeUnit: '',
			},
			barrel: {
				size: '',
				char: '',
				cost: undefined,
			},
			current: {
				volume: 0,
				volumeUnit: '',
				abv: 0,
				value: 0,
			},
			contents: [],
			cost: undefined,
		};
	};

	const emptyVessel = (id: string) => {
		setVessel(id);
		vessel.value.contents = [];
		vessel.value.current = {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		};
		updateVessel();
	};

	// Getters
	const getVesselByType = (type: string): Vessel[] => {
		return vessels.value.filter((v) => v.type === type);
	};

	return {
		vessels,
		vessel,
		fermenters,
		mashTuns,
		stills,
		tanks,
		barrels,
		getVessels,
		setVessel,
		getVesselById,
		updateVessel,
		deleteVessel,
		resetVessel,
		emptyVessel,
		getVesselByType,
	};
});
