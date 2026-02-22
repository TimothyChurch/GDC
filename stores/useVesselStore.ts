import { defineStore } from 'pinia';
import type { Vessel, Contents } from '~/types';

export const useVesselStore = defineStore('vessels', () => {
	const toast = useToast();

	// State
	const vessels = ref<Vessel[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
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
		loading.value = true;
		try {
			const response = await $fetch('/api/vessel');
			vessels.value = response as Vessel[];
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			try {
				await getVessels();
				loaded.value = true;
			} catch {
				// loaded stays false — will retry on next call
			}
		}
	};

	const getVesselById = (id: string) => {
		return vessels.value.find((v) => v._id === id);
	};

	const setVessel = (id: string) => {
		resetVessel();
		const found = vessels.value.find((v) => v._id === id);
		if (found) vessel.value = JSON.parse(JSON.stringify(found));
	};

	const updateVessel = async (): Promise<void> => {
		if (vessel.value.contents && vessel.value.contents.length > 0) {
			const totalVolume = vessel.value.contents.reduce((acc, c) => acc + c.volume, 0);
			vessel.value.current = {
				volume: totalVolume,
				volumeUnit: vessel.value.contents[0].volumeUnit,
				abv: totalVolume > 0
					? vessel.value.contents.reduce((acc, c) => acc + (c.abv * c.volume), 0) / totalVolume
					: 0,
				value: vessel.value.contents.reduce((acc, c) => acc + c.value, 0),
			};
		}
		saving.value = true;
		try {
			const isNew = !vessel.value._id;
			if (isNew) {
				const { _id, ...createData } = vessel.value;
				const response = await $fetch('/api/vessel/create', {
					method: 'POST',
					body: createData,
				});
				vessels.value.push(response as Vessel);
			} else {
				const response = await $fetch(`/api/vessel/${vessel.value._id}`, {
					method: 'PUT',
					body: vessel.value,
				});
				const index = vessels.value.findIndex((v) => v._id === vessel.value._id);
				if (index !== -1) {
					vessels.value[index] = response as Vessel;
				}
			}
			toast.add({ title: `Vessel ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetVessel();
		} catch (error: any) {
			toast.add({ title: 'Failed to save vessel', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const deleteVessel = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/vessel/${id}`, {
				method: 'DELETE',
			});
			vessels.value = vessels.value.filter((v) => v._id !== id);
			toast.add({ title: 'Vessel deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete vessel', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
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

	const emptyVessel = async (id: string) => {
		setVessel(id);
		vessel.value.contents = [];
		vessel.value.current = {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		};
		await updateVessel();
	};

	const fullTransfer = async (sourceId: string, destId: string): Promise<void> => {
		const source = vessels.value.find((v) => v._id === sourceId);
		const dest = vessels.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const destContents = dest.contents || [];

		// Append source contents to destination
		dest.contents = [...destContents, ...sourceContents];
		// Clear source
		source.contents = [];
		source.current = { volume: 0, volumeUnit: '', abv: 0, value: 0 };

		// Save both vessels
		vessel.value = dest;
		await updateVessel();
		vessel.value = source;
		await updateVessel();

		toast.add({ title: 'Transfer complete', color: 'success', icon: 'i-lucide-check-circle' });
	};

	const transferBatch = async (sourceId: string, destId: string, transfer: { volume: number; volumeUnit: string; abv: number; value: number }): Promise<void> => {
		const source = vessels.value.find((v) => v._id === sourceId);
		const dest = vessels.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const totalSourceVolume = sourceContents.reduce((acc, c) => acc + c.volume, 0);
		if (totalSourceVolume <= 0) return;

		const ratio = transfer.volume / totalSourceVolume;
		const newDestContents: Contents[] = [];

		// Split each content entry proportionally
		sourceContents.forEach((content) => {
			const transferVolume = content.volume * ratio;
			content.volume -= transferVolume;
			content.value -= content.value * ratio;
			newDestContents.push({
				batch: content.batch,
				volume: transferVolume,
				volumeUnit: content.volumeUnit,
				abv: content.abv,
				value: content.value > 0 ? (content.value / (1 - ratio)) * ratio : 0,
			});
		});

		// Remove empty contents from source
		source.contents = sourceContents.filter((c) => c.volume > 0);
		dest.contents = [...(dest.contents || []), ...newDestContents];

		// Save both vessels
		vessel.value = dest;
		await updateVessel();
		vessel.value = source;
		await updateVessel();

		toast.add({ title: 'Partial transfer complete', color: 'success', icon: 'i-lucide-check-circle' });
	};

	const addContents = async (vesselId: string, contents: Contents): Promise<void> => {
		const target = vessels.value.find((v) => v._id === vesselId);
		if (!target) return;

		target.contents = [...(target.contents || []), contents];

		vessel.value = target;
		await updateVessel();
	};

	// Getters
	const getVesselByType = (type: string): Vessel[] => {
		return vessels.value.filter((v) => v.type === type);
	};

	return {
		vessels,
		vessel,
		loaded,
		loading,
		saving,
		fermenters,
		mashTuns,
		stills,
		tanks,
		barrels,
		ensureLoaded,
		getVessels,
		setVessel,
		getVesselById,
		updateVessel,
		deleteVessel,
		resetVessel,
		emptyVessel,
		getVesselByType,
		fullTransfer,
		transferBatch,
		addContents,
	};
});
