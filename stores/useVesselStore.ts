import { defineStore } from 'pinia';
import type { Vessel, Contents } from '~/types';
import { convertUnitRatio } from '~/utils/conversions';

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
		isUsed: false,
		previousContents: '',
		targetAge: undefined,
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
	const emptyBarrels = computed(() =>
		barrels.value.filter(
			(v) => !v.contents || v.contents.length === 0 || (v.current?.volume ?? 0) === 0
		)
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
			const targetUnit = vessel.value.stats?.volumeUnit || vessel.value.contents[0]!.volumeUnit;
			const totalVolume = vessel.value.contents.reduce(
				(acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, targetUnit), 0
			);
			const weightedAbv = totalVolume > 0
				? vessel.value.contents.reduce(
					(acc, c) => acc + c.abv * (c.volume * convertUnitRatio(c.volumeUnit, targetUnit)), 0
				) / totalVolume
				: 0;
			vessel.value.current = {
				volume: totalVolume,
				volumeUnit: targetUnit,
				abv: weightedAbv,
				value: vessel.value.contents.reduce((acc, c) => acc + c.value, 0),
			};
		} else {
			// Contents empty — reset current to zero so fill level clears
			vessel.value.current = {
				volume: 0,
				volumeUnit: vessel.value.current?.volumeUnit || '',
				abv: 0,
				value: 0,
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
			isUsed: false,
			previousContents: '',
			targetAge: undefined,
		};
	};

	const emptyVessel = async (id: string) => {
		setVessel(id);

		// For barrels, tag as used and record previous contents from the batch's recipe
		if (vessel.value.type === 'Barrel' && vessel.value.contents?.length) {
			vessel.value.isUsed = true;
			// Resolve spirit type from the first batch's recipe
			const batchStore = useBatchStore();
			const recipeStore = useRecipeStore();
			const firstBatchId = vessel.value.contents[0]?.batch;
			if (firstBatchId) {
				const batch = batchStore.getBatchById(firstBatchId);
				if (batch?.recipe) {
					const recipe = recipeStore.getRecipeById(batch.recipe);
					if (recipe) {
						// Use recipe type if available, otherwise fall back to recipe name
						vessel.value.previousContents = recipe.type || recipe.name;
					}
				}
			}
		}

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
		const normalUnit = sourceContents[0]?.volumeUnit || transfer.volumeUnit;
		const totalSourceVolume = sourceContents.reduce(
			(acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, normalUnit), 0
		);
		if (totalSourceVolume <= 0) return;

		const transferInNormalUnit = transfer.volume * convertUnitRatio(transfer.volumeUnit, normalUnit);
		const ratio = transferInNormalUnit / totalSourceVolume;
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

	const transferBatchContents = async (
		sourceId: string,
		destId: string,
		batchId: string,
		volume: number,
		volumeUnit: string,
	): Promise<void> => {
		const source = vessels.value.find((v) => v._id === sourceId);
		const dest = vessels.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const entry = sourceContents.find((c) => c.batch === batchId);
		if (!entry || entry.volume <= 0) return;

		// Convert requested volume to entry's stored unit before clamping
		const volumeInEntryUnit = volume * convertUnitRatio(volumeUnit, entry.volumeUnit);
		const actualVolume = Math.min(volumeInEntryUnit, entry.volume);
		const ratio = actualVolume / entry.volume;
		const transferValue = entry.value * ratio;
		const transferAbv = entry.abv;

		// Reduce source entry
		entry.volume -= actualVolume;
		entry.value -= transferValue;

		// Remove if depleted
		if (entry.volume < 0.001) {
			source.contents = sourceContents.filter((c) => c !== entry);
		}

		// Add to destination — merge if same batch exists
		const destContents = dest.contents || [];
		const existingDest = destContents.find((c) => c.batch === batchId);
		if (existingDest) {
			// Volume-weighted ABV merge
			const totalVol = existingDest.volume + actualVolume;
			existingDest.abv = totalVol > 0
				? (existingDest.abv * existingDest.volume + transferAbv * actualVolume) / totalVol
				: 0;
			existingDest.volume = totalVol;
			existingDest.value += transferValue;
		} else {
			destContents.push({
				batch: batchId,
				volume: actualVolume,
				volumeUnit,
				abv: transferAbv,
				value: transferValue,
			});
			dest.contents = destContents;
		}

		// Save both vessels
		vessel.value = source;
		await updateVessel();
		vessel.value = dest;
		await updateVessel();
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
		emptyBarrels,
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
		transferBatchContents,
		addContents,
	};
});
