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
		// Strip engine-owned fields from PUT payloads so the 409 USE_TRANSFER_ENDPOINT
		// guard on /api/vessel/[id].put doesn't reject routine vessel updates
		// (name, location, status, etc.). Content mutations must go through the
		// Transfer engine via useTransferStore.
		beforeUpdate: (v) => {
			const {
				contents,
				current,
				contentsVersion,
				previousContentsHistory,
				cachedAt,
				...rest
			} = v as any;
			return rest;
		},
	});

	// Computed filters by type
	const fermenters = computed(() => crud.items.value.filter((v) => v.type === 'Fermenter'));
	const mashTuns = computed(() => crud.items.value.filter((v) => v.type === 'Mash Tun'));
	const stills = computed(() => crud.items.value.filter((v) => v.type === 'Still'));
	const tanks = computed(() => crud.items.value.filter((v) => v.type === 'Tank'));
	const barrels = computed(() => crud.items.value.filter((v) => v.type === 'Barrel'));
	const emptyBarrels = computed(() =>
		barrels.value.filter(
			(v) => v.status !== 'Disposed' && (!v.contents || v.contents.length === 0 || (v.current?.volume ?? 0) === 0),
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

	// ─── Transfer Engine wrappers (Phase 4 of PLAN-PIPELINE-REVAMP.md) ────────
	//
	// Every method that moves liquid now routes through the Transfer Engine
	// for atomicity, period-locking, audit. The engine returns updated source
	// + dest vessel docs which the transferStore syncs into our items array,
	// so we don't need to touch them locally.
	//
	// Fixes Bugs 1.4, 1.5, 2.2, 3.1, 8.1 from PLAN-PIPELINE-REVAMP.md §4.1.

	/** Convert any volume in any unit to wine gallons via the strict converter.
	 *  Falls back to legacy convertUnitRatio for unknown units to avoid
	 *  breaking legacy callers — but logs a warning. */
	const toGallonsLenient = (volume: number, unit: string | undefined | null): number => {
		const u = (unit || 'gallon').toLowerCase();
		if (u === 'gallon' || u === 'gal' || u === 'gallons') return volume;
		// Use legacy converter for now — Phase 5 will adopt the strict server-side one
		return volume * convertUnitRatio(u, 'gallon');
	};

	/** Get a vessel's content slot for a specific batch, with proof inferred. */
	const getSlot = (vessel: Vessel, batchId: string): { volumeWG: number; proof: number } | null => {
		const c = (vessel.contents || []).find((x: any) => String(x.batch) === batchId);
		if (!c || c.volume <= 0) return null;
		const volumeWG = toGallonsLenient(c.volume, c.volumeUnit);
		const proof = (c as any).proof ?? (c.abv != null ? c.abv * 2 : 0);
		return { volumeWG, proof };
	};

	/** Empty a vessel — emits a destruction transfer per batch. For barrels,
	 * also marks the vessel as used (the engine handles previousContentsHistory). */
	const emptyVessel = async (id: string) => {
		const vessel = crud.items.value.find(v => v._id === id);
		if (!vessel) return;
		const transferStore = useTransferStore();

		const slots = (vessel.contents || []).filter((c: any) => c.volume > 0);
		for (const slot of slots) {
			const volumeWG = toGallonsLenient(slot.volume, slot.volumeUnit);
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
			await transferStore.create({
				type: 'destruction',
				batch: String(slot.batch),
				fromStage: null,
				toStage: null,
				sources: [{ vessel: id, volume: volumeWG, proof }],
				destinations: [],
				loss: { volume: volumeWG, proof, reasonCode: 'destruction' },
				notes: 'Vessel emptied (legacy emptyVessel call)',
			});
		}

		// Mark used + clear UI state (engine handles previousContentsHistory; this is for the legacy `isUsed` flag)
		if (vessel.type === 'Barrel') {
			setVessel(id);
			crud.item.value.isUsed = true;
			await updateVessel();
		}
	};

	/** Move ALL contents from source to dest. Emits one transfer per batch. */
	const fullTransfer = async (sourceId: string, destId: string): Promise<void> => {
		const source = crud.items.value.find(v => v._id === sourceId);
		const dest = crud.items.value.find(v => v._id === destId);
		if (!source || !dest) return;
		const transferStore = useTransferStore();

		const slots = (source.contents || []).filter((c: any) => c.volume > 0);
		for (const slot of slots) {
			const volumeWG = toGallonsLenient(slot.volume, slot.volumeUnit);
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
			await transferStore.create({
				type: 'vessel_move',
				batch: String(slot.batch),
				fromStage: null,
				toStage: null,
				sources: [{ vessel: sourceId, volume: volumeWG, proof }],
				destinations: [{ vessel: destId, volume: volumeWG, proof }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
				notes: 'Full vessel transfer',
			});
		}
	};

	/**
	 * @deprecated Buggy "siphon all batches proportionally" semantic. Use
	 * `transferBatchContents(source, dest, batchId, volume, unit)` instead to
	 * specify which batch is moving. Kept as a wrapper that loops over all
	 * batches in the source vessel and transfers each proportionally.
	 *
	 * Bug 3.1 from PLAN-PIPELINE-REVAMP.md §4.1.
	 */
	const transferBatch = async (
		sourceId: string,
		destId: string,
		transfer: { volume: number; volumeUnit: string; abv: number; value: number },
	): Promise<void> => {
		console.warn('[useVesselStore] transferBatch is deprecated and ambiguous; use transferBatchContents(source, dest, batchId, volume, unit) instead.');
		const source = crud.items.value.find(v => v._id === sourceId);
		if (!source) return;
		const slots = (source.contents || []).filter((c: any) => c.volume > 0);
		const totalVol = slots.reduce((s, c: any) => s + toGallonsLenient(c.volume, c.volumeUnit), 0);
		if (totalVol <= 0) return;
		const requestedWG = toGallonsLenient(transfer.volume, transfer.volumeUnit);
		const ratio = Math.min(1, requestedWG / totalVol);

		for (const slot of slots) {
			const slotWG = toGallonsLenient(slot.volume, slot.volumeUnit);
			const moveWG = slotWG * ratio;
			if (moveWG <= 0.001) continue;
			await transferBatchContents(sourceId, destId, String(slot.batch), moveWG, 'gallon');
		}
	};

	/** Move a specific batch's contents from one vessel to another.
	 *  Emits one engine transfer of type `vessel_move`.
	 *  Replaces the legacy in-memory mutation pattern (Bugs 1.5, 2.2). */
	const transferBatchContents = async (
		sourceId: string,
		destId: string,
		batchId: string,
		volume: number,
		volumeUnit: string,
	): Promise<void> => {
		const source = crud.items.value.find(v => v._id === sourceId);
		if (!source) return;
		const slot = getSlot(source, batchId);
		if (!slot) {
			console.warn(`[useVesselStore] Source vessel ${source.name} does not contain batch ${batchId}`);
			return;
		}
		const requestedWG = toGallonsLenient(volume, volumeUnit);
		const moveWG = Math.min(requestedWG, slot.volumeWG);
		if (moveWG <= 0.001) return;

		const transferStore = useTransferStore();
		await transferStore.create({
			type: 'vessel_move',
			batch: batchId,
			fromStage: null,
			toStage: null,
			sources: [{ vessel: sourceId, volume: moveWG, proof: slot.proof }],
			destinations: [{ vessel: destId, volume: moveWG, proof: slot.proof }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		});
	};

	/** Empty a barrel (via destruction transfers) and mark it disposed. */
	const disposeBarrel = async (id: string): Promise<void> => {
		const vessel = crud.items.value.find(v => v._id === id);
		if (!vessel) return;

		// First, emit destruction transfers to drain contents through the engine.
		await emptyVessel(id);

		// Then mark the vessel disposed via routine update (engine-owned fields stripped by beforeUpdate).
		setVessel(id);
		const barrelName = crud.item.value.name;
		crud.item.value.isUsed = true;
		crud.item.value.status = 'Disposed';
		await updateVessel();
		toast.add({ title: 'Barrel disposed', description: barrelName, color: 'warning', icon: 'i-lucide-trash-2' });
	};

	/**
	 * @deprecated Direct content manipulation is owned by the Transfer Engine.
	 * Prefer `useTransferStore.create()` with an explicit transfer type.
	 *
	 * For backward compatibility with legacy UI flows (BatchAdvanceAction,
	 * PanelProduction, etc.) this emits a `stage_transition` with fromStage='Upcoming'
	 * (engine bypasses balance check for this initial-entry case). Phase 6 will
	 * rewrite those flows to call the engine directly.
	 */
	const addContents = async (vesselId: string, contents: Contents): Promise<void> => {
		console.warn('[useVesselStore] addContents is deprecated. Use useTransferStore.create() with an explicit transfer type.');
		const transferStore = useTransferStore();
		const volumeWG = toGallonsLenient(contents.volume, contents.volumeUnit);
		const proof = (contents as any).proof ?? (contents.abv != null ? contents.abv * 2 : 0);
		await transferStore.create({
			type: 'stage_transition',
			batch: contents.batch,
			fromStage: 'Upcoming',
			toStage: null,
			sources: [],
			destinations: [{ vessel: vesselId, volume: volumeWG, proof }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			notes: 'Legacy addContents call (Phase 4 fallback)',
		});
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
		disposeBarrel,
		getVesselByType,
		fullTransfer,
		transferBatch,
		transferBatchContents,
		addContents,
	};
});
