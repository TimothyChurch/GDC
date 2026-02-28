import type { Vessel, Contents } from '~/types';
import { convertUnitRatio } from '~/utils/conversions';

export const useVesselStore = defineStore('vessels', () => {
	const toast = useToast();

	const defaultVessel = (): Vessel => ({
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

	const crud = useCrudStore<Vessel>({
		name: 'Vessel',
		apiPath: '/api/vessel',
		defaultItem: defaultVessel,
	});

	// Computed filters by type
	const fermenters = computed(() => crud.items.value.filter((v) => v.type === 'Fermenter'));
	const mashTuns = computed(() => crud.items.value.filter((v) => v.type === 'Mash Tun'));
	const stills = computed(() => crud.items.value.filter((v) => v.type === 'Still'));
	const tanks = computed(() => crud.items.value.filter((v) => v.type === 'Tank'));
	const barrels = computed(() => crud.items.value.filter((v) => v.type === 'Barrel'));
	const emptyBarrels = computed(() =>
		barrels.value.filter(
			(v) => !v.contents || v.contents.length === 0 || (v.current?.volume ?? 0) === 0,
		),
	);

	// Override setVessel to reset first (original behavior)
	const setVessel = (id: string) => {
		crud.resetItem();
		const found = crud.items.value.find((v) => v._id === id);
		if (found) crud.item.value = structuredClone(toRaw(found));
	};

	/**
	 * Custom updateVessel that recalculates `current` from `contents` before saving.
	 * This is domain logic that doesn't fit the generic CRUD pattern.
	 * Note: intentionally swallows errors (original behavior) -- callers like
	 * fullTransfer/transferBatch don't expect throws.
	 */
	const updateVessel = async (): Promise<void> => {
		if (crud.item.value.contents && crud.item.value.contents.length > 0) {
			const targetUnit = crud.item.value.stats?.volumeUnit || crud.item.value.contents[0]!.volumeUnit;
			const totalVolume = crud.item.value.contents.reduce(
				(acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, targetUnit), 0,
			);
			const weightedAbv = totalVolume > 0
				? crud.item.value.contents.reduce(
					(acc, c) => acc + c.abv * (c.volume * convertUnitRatio(c.volumeUnit, targetUnit)), 0,
				) / totalVolume
				: 0;
			crud.item.value.current = {
				volume: totalVolume,
				volumeUnit: targetUnit,
				abv: weightedAbv,
				value: crud.item.value.contents.reduce((acc, c) => acc + c.value, 0),
			};
		} else {
			crud.item.value.current = {
				volume: 0,
				volumeUnit: crud.item.value.current?.volumeUnit || '',
				abv: 0,
				value: 0,
			};
		}
		try {
			await crud.saveItem();
		} catch {
			// Error toast already shown by saveItem -- swallow to match original behavior
		}
	};

	const emptyVessel = async (id: string) => {
		setVessel(id);

		// For barrels, tag as used and record previous contents from the batch's recipe
		if (crud.item.value.type === 'Barrel' && crud.item.value.contents?.length) {
			crud.item.value.isUsed = true;
			const batchStore = useBatchStore();
			const recipeStore = useRecipeStore();
			const firstBatchId = crud.item.value.contents[0]?.batch;
			if (firstBatchId) {
				const batch = batchStore.getBatchById(firstBatchId);
				if (batch?.recipe) {
					const recipe = recipeStore.getRecipeById(batch.recipe);
					if (recipe) {
						crud.item.value.previousContents = recipe.type || recipe.name;
					}
				}
			}
		}

		crud.item.value.contents = [];
		crud.item.value.current = {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		};
		await updateVessel();
	};

	const fullTransfer = async (sourceId: string, destId: string): Promise<void> => {
		const source = crud.items.value.find((v) => v._id === sourceId);
		const dest = crud.items.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const destContents = dest.contents || [];

		dest.contents = [...destContents, ...sourceContents];
		source.contents = [];
		source.current = { volume: 0, volumeUnit: '', abv: 0, value: 0 };

		crud.item.value = dest;
		await updateVessel();
		crud.item.value = source;
		await updateVessel();

		toast.add({ title: 'Transfer complete', color: 'success', icon: 'i-lucide-check-circle' });
	};

	const transferBatch = async (sourceId: string, destId: string, transfer: { volume: number; volumeUnit: string; abv: number; value: number }): Promise<void> => {
		const source = crud.items.value.find((v) => v._id === sourceId);
		const dest = crud.items.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const normalUnit = sourceContents[0]?.volumeUnit || transfer.volumeUnit;
		const totalSourceVolume = sourceContents.reduce(
			(acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, normalUnit), 0,
		);
		if (totalSourceVolume <= 0) return;

		const transferInNormalUnit = transfer.volume * convertUnitRatio(transfer.volumeUnit, normalUnit);
		const ratio = transferInNormalUnit / totalSourceVolume;
		const newDestContents: Contents[] = [];

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

		source.contents = sourceContents.filter((c) => c.volume > 0);
		dest.contents = [...(dest.contents || []), ...newDestContents];

		crud.item.value = dest;
		await updateVessel();
		crud.item.value = source;
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
		const source = crud.items.value.find((v) => v._id === sourceId);
		const dest = crud.items.value.find((v) => v._id === destId);
		if (!source || !dest) return;

		const sourceContents = source.contents || [];
		const entry = sourceContents.find((c) => c.batch === batchId);
		if (!entry || entry.volume <= 0) return;

		const volumeInEntryUnit = volume * convertUnitRatio(volumeUnit, entry.volumeUnit);
		const actualVolume = Math.min(volumeInEntryUnit, entry.volume);
		const ratio = actualVolume / entry.volume;
		const transferValue = entry.value * ratio;
		const transferAbv = entry.abv;

		entry.volume -= actualVolume;
		entry.value -= transferValue;

		if (entry.volume < 0.001) {
			source.contents = sourceContents.filter((c) => c !== entry);
		}

		const destUnit = dest.stats?.volumeUnit || entry.volumeUnit;
		const actualVolumeInDestUnit = actualVolume * convertUnitRatio(entry.volumeUnit, destUnit);
		const destContents = dest.contents || [];
		const existingDest = destContents.find((c) => c.batch === batchId);
		if (existingDest) {
			const existingInDestUnit = existingDest.volume * convertUnitRatio(existingDest.volumeUnit, destUnit);
			const totalVol = existingInDestUnit + actualVolumeInDestUnit;
			existingDest.abv = totalVol > 0
				? (existingDest.abv * existingInDestUnit + transferAbv * actualVolumeInDestUnit) / totalVol
				: 0;
			existingDest.volume = totalVol;
			existingDest.volumeUnit = destUnit;
			existingDest.value += transferValue;
		} else {
			destContents.push({
				batch: batchId,
				volume: actualVolumeInDestUnit,
				volumeUnit: destUnit,
				abv: transferAbv,
				value: transferValue,
			});
			dest.contents = destContents;
		}

		crud.item.value = source;
		await updateVessel();
		crud.item.value = dest;
		await updateVessel();
	};

	const addContents = async (vesselId: string, contents: Contents): Promise<void> => {
		const target = crud.items.value.find((v) => v._id === vesselId);
		if (!target) return;

		target.contents = [...(target.contents || []), contents];

		crud.item.value = target;
		await updateVessel();
	};

	const getVesselByType = (type: string): Vessel[] => {
		return crud.items.value.filter((v) => v.type === type);
	};

	return {
		...crud,
		// Domain aliases for backward compatibility
		vessels: crud.items,
		vessel: crud.item,
		getVessels: crud.getAll,
		deleteVessel: crud.deleteItem,
		resetVessel: crud.resetItem,
		getVesselById: crud.getById,
		// Override setVessel (resets first)
		setVessel,
		// Override updateVessel (recalculates current from contents)
		updateVessel,
		// Computed filters
		fermenters,
		mashTuns,
		stills,
		tanks,
		barrels,
		emptyBarrels,
		// Domain-specific
		emptyVessel,
		getVesselByType,
		fullTransfer,
		transferBatch,
		transferBatchContents,
		addContents,
	};
});
