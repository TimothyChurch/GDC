import type { Batch, BatchStages, DistillingRun, MashingStage, Recipe, TastingNote, TransferLogEntry } from '~/types';
import { STAGE_KEY_MAP, isStageActive, getActiveStages, hasStageVolumes, getStageIndex, getPreviousStage } from '~/composables/batchPipeline';
import { calculateProofGallons } from '~/utils/proofGallons';

const emptyStages = (): BatchStages => ({});

const defaultBatch = (): Batch => ({
	_id: '',
	recipe: '',
	pipeline: ['Mashing', 'Fermenting', 'Stripping Run', 'Low Wines', 'Spirit Run', 'Storage', 'Proofing', 'Bottled'],
	currentStage: 'Upcoming',
	status: 'active',
	recipeCost: undefined as unknown as number,
	batchSize: undefined as unknown as number,
	batchSizeUnit: 'gallon',
	batchCost: undefined,
	barrelCost: undefined,
	stages: emptyStages(),
	stageVolumes: {},
	transferLog: [],
});

export const useBatchStore = defineStore('batches', () => {
	const toast = useToast();

	const crud = useCrudStore<Batch>({
		name: 'Batch',
		apiPath: '/api/batch',
		defaultItem: defaultBatch,
		// Strip engine-owned fields from PUT payloads so the 409 USE_TRANSFER_ENDPOINT
		// guard on /api/batch/[id].put doesn't reject routine batch updates
		// (notes, recipe, costs, distilling runs data, etc.).
		// stageVolumes / stageProofs / transferLog mutations must go through
		// the Transfer engine via useTransferStore.
		beforeUpdate: (b) => {
			const {
				stageVolumes,
				stageProofs,
				transferLog,
				cacheVersion,
				cachedAt,
				ttbAccount,
				...rest
			} = b as any;
			return rest;
		},
	});

	// --- Computed filters ---
	const activeBatches = computed(() =>
		crud.items.value.filter((b) => b.status === 'active'),
	);
	const completedBatches = computed(() =>
		crud.items.value.filter((b) => b.status === 'completed'),
	);

	// Stage-based filters using getBatchesInStage for volume-aware lookups
	const upcomingBatches = computed(() => getBatchesInStage('Upcoming'));
	const mashingBatches = computed(() => getBatchesInStage('Mashing'));
	const fermentingBatches = computed(() => getBatchesInStage('Fermenting'));
	const distillingBatches = computed(() => getBatchesInStage('Distilling'));
	const strippingRunBatches = computed(() => getBatchesInStage('Stripping Run'));
	const lowWinesBatches = computed(() => getBatchesInStage('Low Wines'));
	const spiritRunBatches = computed(() => getBatchesInStage('Spirit Run'));
	const storedBatches = computed(() => getBatchesInStage('Storage'));
	const barrelAgingBatches = computed(() => getBatchesInStage('Barrel Aging'));
	const macerationBatches = computed(() => getBatchesInStage('Maceration'));

	// --- Custom updateBatch that wraps saveItem ---
	// Batch has custom pre-create logic (add log entry, initialize stageVolumes)
	const updateBatch = async (): Promise<void> => {
		const isNew = !crud.item.value._id;
		if (isNew) {
			const recipeStore = useRecipeStore();
			const recipeName = recipeStore.getRecipeById(crud.item.value.recipe)?.name;
			addLogEntry(crud.item.value, 'Batch created', recipeName ? `From recipe: ${recipeName}` : undefined);
			if (!crud.item.value.stageVolumes || Object.keys(crud.item.value.stageVolumes).length === 0) {
				crud.item.value.stageVolumes = { 'Upcoming': crud.item.value.batchSize || 0 };
			}
		}
		await crud.saveItem();
	};

	// --- Helper: initialize stageVolumes on legacy batch ---
	const ensureStageVolumes = (target: Batch): void => {
		if (!target.stageVolumes || Object.keys(target.stageVolumes).length === 0) {
			target.stageVolumes = { [target.currentStage]: target.batchSize || 0 };
		}
		if (!target.transferLog) {
			target.transferLog = [];
		}
	};

	// --- Helper: get current user name for transfer log ---
	const getCurrentUserName = (): string | undefined => {
		const { user } = useAuth();
		return user.value
			? `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email
			: undefined;
	};

	// --- Helper: add a transfer log entry ---
	const addTransferLogEntry = (target: Batch, entry: Omit<TransferLogEntry, 'date' | 'user'>): void => {
		if (!target.transferLog) target.transferLog = [];
		target.transferLog.push({
			...entry,
			date: new Date(),
			user: getCurrentUserName(),
		});
	};

	// --- Pipeline-based stage advancement (engine-routed, Phase 4) ---
	//
	// All three methods below route through the Transfer Engine
	// (`server/utils/transferEngine.ts`) for atomicity, period-locking, and
	// audit. The legacy in-memory mutation pattern is gone — the engine
	// returns updated docs which the transferStore syncs back into the
	// batch + vessel stores. Fixes Bugs 1.1, 4.1, 6.1, 12.1 from
	// PLAN-PIPELINE-REVAMP.md §4.1.
	//
	// PROOF DEFAULTING: legacy callers (existing UI in advanced stages of
	// distillation) don't capture proof. We default to 0 for both source
	// and destination, which trivially balances PG (0 = 0 + 0). Phase 5/6
	// UI work will surface proof inputs and pass them through.

	const findVesselsContaining = (batchId: string): { vesselId: string; volume: number; proof: number }[] => {
		const vesselStore = useVesselStore();
		const out: { vesselId: string; volume: number; proof: number }[] = [];
		for (const v of vesselStore.crud.items.value) {
			const slot = (v.contents || []).find((c: any) => String(c.batch) === batchId);
			if (slot && slot.volume > 0) {
				const proof = slot.proof ?? (slot.abv != null ? slot.abv * 2 : 0);
				out.push({ vesselId: v._id, volume: slot.volume, proof });
			}
		}
		return out;
	};

	/** Start the first production stage with optional partial volume transfer.
	 * Routes through the Transfer Engine. Side effects (inventory withdrawal,
	 * bulk-spirit withdrawal) still run client-side after a successful transfer.
	 */
	const startFirstStage = async (batchId: string, vesselId: string, transferVolume?: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		const firstStage = target.pipeline[0]!;
		const stageVolumes = target.stageVolumes || {};
		const upcomingVolume = stageVolumes['Upcoming'] || target.batchSize || 0;
		const volume = transferVolume != null ? Math.min(transferVolume, upcomingVolume) : upcomingVolume;
		if (volume <= 0) return;

		const transferStore = useTransferStore();
		await transferStore.create({
			type: 'stage_transition',
			batch: batchId,
			fromStage: 'Upcoming',
			toStage: firstStage,
			sources: [],  // Upcoming has no physical source — engine bypasses balance check
			destinations: [{ vessel: vesselId, stage: firstStage, volume, proof: 0 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		});

		// Side effects — these are NOT part of the transfer; they're separate writes.
		// The transfer succeeded atomically; these can fail without affecting batch state.
		if (firstStage === 'Mashing') {
			await withdrawMashIngredients(batchId);
		}
		await withdrawBulkSpirits(batchId);
	};

	/** Advance a batch from sourceStage to targetStage with optional partial volume.
	 *
	 * Source vessel selection: looks up vessels currently containing the batch.
	 * If exactly one is found, it's used as the source. If multiple, the caller
	 * must specify them (Phase 5/6 UI gives the user a picker; for now we
	 * advance from the first matching vessel and warn).
	 *
	 * For 'Upcoming' as fromStage, no source vessel is needed.
	 */
	const advanceToStage = async (
		batchId: string,
		targetStage: string,
		stageData?: { vessel?: string },
		transferVolume?: number,
		sourceStage?: string,
		destinationVolume?: number,
	): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		const targetIdx = getStageIndex(target.pipeline, targetStage);
		let fromStage = sourceStage;
		if (!fromStage) {
			if (targetIdx === 0) {
				fromStage = 'Upcoming';
			} else if (targetIdx > 0) {
				fromStage = target.pipeline[targetIdx - 1]!;
			} else {
				fromStage = target.currentStage;
			}
		}

		const sourceVolume = (target.stageVolumes || {})[fromStage] || 0;
		const actualVolume = transferVolume != null ? Math.min(transferVolume, sourceVolume) : sourceVolume;
		if (actualVolume <= 0 && fromStage !== 'Upcoming') return;

		const destVol = destinationVolume != null ? destinationVolume : actualVolume;

		const transferStore = useTransferStore();

		// Build sources from vessels actually holding the batch (multi-vessel-aware).
		// If fromStage is 'Upcoming', sources is empty (engine bypass).
		let sources: { vessel: string; volume: number; proof: number }[] = [];
		if (fromStage !== 'Upcoming') {
			const containing = findVesselsContaining(batchId);
			if (containing.length === 0) {
				console.warn(`[advanceToStage] No vessels contain batch ${batchId}; cannot determine source.`);
				return;
			}
			// Allocate the requested actualVolume across vessels (greedy from first).
			let remaining = actualVolume;
			for (const c of containing) {
				if (remaining <= 0) break;
				const takeVol = Math.min(remaining, c.volume);
				sources.push({ vessel: c.vesselId, volume: takeVol, proof: c.proof });
				remaining -= takeVol;
			}
			if (remaining > 0.001) {
				console.warn(`[advanceToStage] Requested ${actualVolume} gal but only ${actualVolume - remaining} gal available across vessels.`);
			}
		}

		// Destination: caller-supplied vessel (or null for stages without a physical vessel like Storage).
		const destinations = stageData?.vessel
			? [{ vessel: stageData.vessel, stage: targetStage, volume: destVol, proof: 0 }]
			: [];

		// Loss = source volume - dest volume (only when distillation produces less than charged).
		const lossVolume = Math.max(0, actualVolume - destVol);
		const loss = lossVolume > 0
			? { volume: lossVolume, proof: 0, reasonCode: 'foreshots_heads_tails' as const }
			: { volume: 0, proof: 0, reasonCode: 'no_loss' as const };

		await transferStore.create({
			type: 'stage_transition',
			batch: batchId,
			fromStage,
			toStage: targetStage,
			sources,
			destinations,
			loss,
		});

		// Mashing-entry side effect (inventory withdrawal)
		if (targetStage === 'Mashing') {
			await withdrawMashIngredients(batchId);
		}
	};

	/** Update data for a specific stage */
	const updateStageData = async (batchId: string, stageName: string, data: Record<string, any>, logMessage?: string): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		const stageKey = STAGE_KEY_MAP[stageName];
		if (!stageKey) return;

		if (!target.stages[stageKey]) {
			target.stages[stageKey] = {};
		}
		Object.assign(target.stages[stageKey]!, data);

		addLogEntry(target, logMessage || `Updated ${stageName} data`);

		crud.item.value = target;
		await updateBatch();
	};

	/** Revert volume from a stage back to the previous stage in the pipeline.
	 *
	 * Engine-routed (Phase 4): finds the most recent committed `stage_transition`
	 * transfer where `toStage === fromStage`, and calls the engine's reverse
	 * primitive. The reverse atomically restores both batch and vessel state.
	 *
	 * Fixes Bug 12.1 — the legacy implementation only touched stageVolumes,
	 * leaving vessels in an inconsistent ghost state.
	 */
	const revertToPreviousStage = async (batchId: string, fromStage: string): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		const transferStore = useTransferStore();

		// Find the most recent committed transfer that landed liquid in `fromStage`.
		// We query the server rather than rely on local cache to be sure we get the latest.
		const candidates = await transferStore.list({
			batch: batchId,
			type: 'stage_transition',
			status: 'committed',
			limit: 50,
		});

		const target_transfer = candidates.find(
			t => t.toStage === fromStage,
		);

		if (!target_transfer) {
			toast.add({
				title: 'Nothing to revert',
				description: `No committed transfer landed liquid in ${fromStage}.`,
				color: 'warning',
				icon: 'i-lucide-alert-triangle',
			});
			return;
		}

		await transferStore.reverse(target_transfer._id, `Revert ${fromStage} → ${getPreviousStage(target.pipeline, fromStage) || 'previous stage'}`);
	};

	// --- Distilling run management ---

	const addDistillingRun = async (batchId: string, run: DistillingRun): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		if (!target.stages.distilling) {
			target.stages.distilling = {};
		}
		if (!target.stages.distilling.runs) target.stages.distilling.runs = [];

		run.runNumber = target.stages.distilling.runs.length + 1;
		target.stages.distilling.runs.push(run);

		addLogEntry(target, `Added distilling run #${run.runNumber}`, `${run.runType} run`);

		crud.item.value = target;
		await updateBatch();
	};

	const updateDistillingRun = async (batchId: string, runIndex: number, data: Partial<DistillingRun>): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.distilling?.runs?.[runIndex]) return;

		Object.assign(target.stages.distilling.runs[runIndex], data);

		addLogEntry(target, `Updated distilling run #${target.stages.distilling.runs[runIndex].runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const deleteDistillingRun = async (batchId: string, runIndex: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.distilling?.runs?.[runIndex]) return;

		const removedNumber = target.stages.distilling.runs[runIndex].runNumber;
		target.stages.distilling.runs.splice(runIndex, 1);

		target.stages.distilling.runs.forEach((r: DistillingRun, i: number) => {
			r.runNumber = i + 1;
		});

		addLogEntry(target, `Deleted distilling run #${removedNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	// --- Stripping run management ---

	// Recompute the lowWines stage totals from all stripping run outputs.
	// Low wines is the accumulation of every stripping run — volume sums, ABV is volume-weighted.
	const recomputeLowWines = (target: Batch): void => {
		const runs = target.stages?.strippingRun?.runs || [];
		const runsWithOutput = runs.filter((r: DistillingRun) => (r.output?.volume || r.total?.volume || 0) > 0);

		if (!target.stages.lowWines) target.stages.lowWines = {};
		const lw: any = target.stages.lowWines;

		if (runsWithOutput.length === 0) {
			lw.volume = 0;
			lw.abv = 0;
			lw.proofGallons = 0;
			lw.sourceRuns = runs.length;
			return;
		}

		const totalVol = runsWithOutput.reduce((s: number, r: DistillingRun) => s + (r.output?.volume || r.total?.volume || 0), 0);
		const weightedAbv = runsWithOutput.reduce((s: number, r: DistillingRun) => {
			const vol = r.output?.volume || r.total?.volume || 0;
			const abv = r.output?.abv || r.total?.abv || 0;
			return s + vol * abv;
		}, 0);
		const avgAbv = totalVol > 0 ? weightedAbv / totalVol : 0;

		lw.volume = totalVol;
		lw.volumeUnit = runsWithOutput[0].output?.volumeUnit || runsWithOutput[0].total?.volumeUnit || lw.volumeUnit || 'gallon';
		lw.abv = avgAbv;
		lw.proofGallons = totalVol > 0 && avgAbv > 0 ? calculateProofGallons(totalVol, lw.volumeUnit, avgAbv) : 0;
		lw.sourceRuns = runs.length;
	};

	const addStrippingRun = async (batchId: string, run: DistillingRun): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		if (!target.stages.strippingRun) target.stages.strippingRun = {};
		if (!target.stages.strippingRun.runs) target.stages.strippingRun.runs = [];

		run.runNumber = target.stages.strippingRun.runs.length + 1;
		run.runType = 'stripping';
		target.stages.strippingRun.runs.push(run);
		recomputeLowWines(target);

		addLogEntry(target, `Added stripping run #${run.runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const updateStrippingRun = async (batchId: string, runIndex: number, data: Partial<DistillingRun>): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.strippingRun?.runs?.[runIndex]) return;

		Object.assign(target.stages.strippingRun.runs[runIndex], data);
		recomputeLowWines(target);
		addLogEntry(target, `Updated stripping run #${target.stages.strippingRun.runs[runIndex].runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const deleteStrippingRun = async (batchId: string, runIndex: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.strippingRun?.runs?.[runIndex]) return;

		const removedNumber = target.stages.strippingRun.runs[runIndex].runNumber;
		target.stages.strippingRun.runs.splice(runIndex, 1);
		target.stages.strippingRun.runs.forEach((r: DistillingRun, i: number) => { r.runNumber = i + 1; });
		recomputeLowWines(target);

		addLogEntry(target, `Deleted stripping run #${removedNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	// --- Spirit run management ---

	const addSpiritRun = async (batchId: string, run: DistillingRun): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		if (!target.stages.spiritRun) target.stages.spiritRun = {};
		if (!target.stages.spiritRun.runs) target.stages.spiritRun.runs = [];

		run.runNumber = target.stages.spiritRun.runs.length + 1;
		run.runType = 'spirit';
		target.stages.spiritRun.runs.push(run);

		addLogEntry(target, `Added spirit run #${run.runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const updateSpiritRun = async (batchId: string, runIndex: number, data: Partial<DistillingRun>): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.spiritRun?.runs?.[runIndex]) return;

		Object.assign(target.stages.spiritRun.runs[runIndex], data);
		addLogEntry(target, `Updated spirit run #${target.stages.spiritRun.runs[runIndex].runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const deleteSpiritRun = async (batchId: string, runIndex: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.spiritRun?.runs?.[runIndex]) return;

		const removedNumber = target.stages.spiritRun.runs[runIndex].runNumber;
		target.stages.spiritRun.runs.splice(runIndex, 1);
		target.stages.spiritRun.runs.forEach((r: DistillingRun, i: number) => { r.runNumber = i + 1; });

		addLogEntry(target, `Deleted spirit run #${removedNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	// --- Generic run update by stage key (used by BatchDistillingRun component) ---

	const updateRunByStageKey = async (stageKey: string, batchId: string, runIndex: number, data: Partial<DistillingRun>): Promise<void> => {
		if (stageKey === 'strippingRun') return updateStrippingRun(batchId, runIndex, data);
		if (stageKey === 'spiritRun') return updateSpiritRun(batchId, runIndex, data);
		return updateDistillingRun(batchId, runIndex, data);
	};

	// --- Activity log ---

	const addLogEntry = (target: Batch, action: string, details?: string): void => {
		if (!target.log) target.log = [];
		const userName = getCurrentUserName();
		target.log.push({
			date: new Date(),
			action,
			details,
			user: userName || undefined,
		});
	};

	/** Add a manual note to a batch's activity log */
	const addNote = async (batchId: string, note: string): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;
		addLogEntry(target, 'Note added', note);
		crud.item.value = target;
		await updateBatch();
	};

	/** Add a tasting note to a batch */
	const addTastingNote = async (batchId: string, note: Omit<TastingNote, 'addedBy'>): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;
		if (!target.tastingNotes) target.tastingNotes = [];
		target.tastingNotes.push({
			...note,
			addedBy: getCurrentUserName(),
		});
		addLogEntry(target, 'Tasting note added', note.abv ? `ABV: ${note.abv}%` : undefined);
		crud.item.value = target;
		await updateBatch();
	};

	/** Delete a tasting note from a batch by index */
	const deleteTastingNote = async (batchId: string, noteIndex: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target || !target.tastingNotes?.[noteIndex]) return;
		target.tastingNotes.splice(noteIndex, 1);
		addLogEntry(target, 'Tasting note removed');
		crud.item.value = target;
		await updateBatch();
	};

	// --- Getters ---

	/** Get batches that have volume in a given stage (volume-aware) */
	const getBatchesInStage = (stage: string): Batch[] => {
		return crud.items.value.filter((b) => {
			if (b.status !== 'active') return false;
			if (hasStageVolumes(b)) {
				return isStageActive(b, stage);
			}
			return b.currentStage === stage;
		});
	};

	/** Legacy getter -- still uses currentStage only */
	const getBatchesByCurrentStage = (stage: string): Batch[] => {
		return crud.items.value.filter((b) => b.currentStage === stage && b.status === 'active');
	};

	const getBatchByStatus = (status: string): Batch[] => {
		return crud.items.value.filter((b) => b.status === status);
	};

	/** Get all distinct stages that have active batches (volume-aware) */
	const activeStages = computed(() => {
		const stages = new Set<string>();
		for (const b of activeBatches.value) {
			if (hasStageVolumes(b)) {
				for (const stage of getActiveStages(b)) {
					stages.add(stage);
				}
			} else {
				stages.add(b.currentStage);
			}
		}
		return [...stages];
	});

	const getRecipeNameByBatchId = (id: string): string | undefined => {
		const recipeStore = useRecipeStore();
		const b = crud.getById(id);
		if (b?.recipe) {
			const recipe = recipeStore.getRecipeById(b.recipe) as Recipe;
			return recipe?.name;
		}
	};

	// --- Bulk spirit withdrawal ---

	/**
	 * Withdraw bulk spirits from storage when a batch enters its first stage.
	 * Scales volumes based on batch size vs recipe volume.
	 */
	const withdrawBulkSpirits = async (batchId: string): Promise<void> => {
		const recipeStore = useRecipeStore();
		const bulkSpiritStore = useBulkSpiritStore();

		const batch = crud.items.value.find((b) => b._id === batchId);
		if (!batch) return;

		const recipe = recipeStore.getRecipeById(batch.recipe);
		if (!recipe?.bulkSpirits?.length) return;

		// Calculate scale factor: batch size / recipe volume
		let scaleFactor = 1;
		if (recipe.volume) {
			const { convertQuantity } = useUnitConversion();
			const batchInRecipeUnits = convertQuantity(
				batch.batchSize,
				batch.batchSizeUnit,
				recipe.volumeUnit,
			);
			scaleFactor = batchInRecipeUnits / recipe.volume;
		}

		let totalWithdrawnValue = 0;
		const summary: string[] = [];

		for (const bsIngredient of recipe.bulkSpirits) {
			const spirit = bulkSpiritStore.getBulkSpiritById(bsIngredient.bulkSpirit);
			if (!spirit) continue;

			const scaledVolume = bsIngredient.volume * scaleFactor;

			try {
				const result = await bulkSpiritStore.withdraw(bsIngredient.bulkSpirit, {
					batchId,
					volume: scaledVolume,
					volumeUnit: bsIngredient.volumeUnit,
				});
				totalWithdrawnValue += result.value;
				summary.push(`${scaledVolume.toFixed(1)} ${bsIngredient.volumeUnit} ${spirit.name}`);
			} catch {
				// Error toast shown by withdraw
			}
		}

		// Add the withdrawn bulk spirit cost to the batch cost
		if (totalWithdrawnValue > 0) {
			batch.batchCost = (batch.batchCost || 0) + totalWithdrawnValue;
			addLogEntry(batch, 'Bulk spirits withdrawn', summary.join(', '));
			crud.item.value = batch;
			await updateBatch();
		}
	};

	// --- Mash ingredient withdrawal ---

	/**
	 * Withdraw recipe ingredients from inventory when a batch enters the Mashing stage.
	 * Scales ingredient amounts based on batch size vs recipe volume.
	 * Sets `ingredientsWithdrawn` flag on the mashing stage to prevent duplicate withdrawals.
	 */
	const withdrawMashIngredients = async (batchId: string): Promise<void> => {
		const recipeStore = useRecipeStore();
		const itemStore = useItemStore();
		const inventoryStore = useInventoryStore();
		const { convertQuantity } = useUnitConversion();

		const batch = crud.items.value.find((b) => b._id === batchId);
		if (!batch) return;

		// Guard: don't withdraw if already done for this batch
		const mashStage = batch.stages?.mashing as MashingStage | undefined;
		if (mashStage?.ingredientsWithdrawn) return;

		const recipe = recipeStore.getRecipeById(batch.recipe);
		if (!recipe || !recipe.items || recipe.items.length === 0) return;

		// Calculate scale factor: batch size / recipe volume (with unit conversion)
		let scaleFactor = 1;
		if (recipe.volume) {
			const batchInRecipeUnits = convertQuantity(
				batch.batchSize,
				batch.batchSizeUnit,
				recipe.volumeUnit,
			);
			scaleFactor = batchInRecipeUnits / recipe.volume;
		}

		const inventoryRecords: Array<{ item: string; quantity: number; date: Date }> = [];
		const summary: Array<{ name: string; amount: number; unit: string }> = [];

		for (const recipeItem of recipe.items) {
			const item = itemStore.getItemById(recipeItem._id);
			if (!item) continue;
			if (item.trackInventory === false) continue;

			const scaledAmount = recipeItem.amount * scaleFactor;

			// Convert recipe ingredient units to the item's inventory unit if they differ
			const inventoryUnit = item.inventoryUnit || recipeItem.unit;
			const deductionInInventoryUnits = recipeItem.unit !== inventoryUnit
				? convertQuantity(scaledAmount, recipeItem.unit, inventoryUnit)
				: scaledAmount;

			const currentStock = inventoryStore.getCurrentStock(recipeItem._id);
			const newStock = Math.max(0, currentStock - deductionInInventoryUnits);

			inventoryRecords.push({
				item: recipeItem._id,
				quantity: Math.round(newStock * 100) / 100,
				date: new Date(),
			});
			summary.push({
				name: item.name,
				amount: Math.round(deductionInInventoryUnits * 100) / 100,
				unit: inventoryUnit,
			});
		}

		if (inventoryRecords.length === 0) return;

		try {
			await inventoryStore.createBulk(inventoryRecords);
		} catch {
			// Error toast already shown by createBulk
			return;
		}

		// Mark ingredients as withdrawn to prevent duplicate deductions
		if (!batch.stages.mashing) {
			batch.stages.mashing = {};
		}
		(batch.stages.mashing as MashingStage).ingredientsWithdrawn = true;
		addLogEntry(batch, 'Mash ingredients withdrawn from inventory', summary.map((s) => `-${s.amount} ${s.unit} ${s.name}`).join(', '));
		crud.item.value = batch;
		await updateBatch();

		// Show confirmation toast
		const recipeName = recipe.name || 'recipe';
		const lines = summary.map((s) => `-${s.amount} ${s.unit} ${s.name}`);
		toast.add({
			title: `Ingredients withdrawn for ${recipeName}`,
			description: lines.join(', '),
			color: 'success',
			icon: 'i-lucide-archive',
			duration: 8000,
		});
	};

	return {
		...crud,
		// Domain aliases for backward compatibility
		batches: crud.items,
		batch: crud.item,
		getBatches: crud.getAll,
		deleteBatch: crud.deleteItem,
		resetBatch: crud.resetItem,
		setBatch: crud.setItem,
		getBatchById: crud.getById,
		// Custom updateBatch (adds log entry for new batches)
		updateBatch,
		// Computed filters
		activeBatches,
		completedBatches,
		upcomingBatches,
		mashingBatches,
		fermentingBatches,
		distillingBatches,
		strippingRunBatches,
		lowWinesBatches,
		spiritRunBatches,
		storedBatches,
		barrelAgingBatches,
		macerationBatches,
		activeStages,
		// Pipeline advancement
		advanceToStage,
		startFirstStage,
		updateStageData,
		revertToPreviousStage,
		// Distilling run management
		addDistillingRun,
		updateDistillingRun,
		deleteDistillingRun,
		addStrippingRun,
		updateStrippingRun,
		deleteStrippingRun,
		addSpiritRun,
		updateSpiritRun,
		deleteSpiritRun,
		updateRunByStageKey,
		// Activity log
		addNote,
		// Tasting notes
		addTastingNote,
		deleteTastingNote,
		// Inventory
		withdrawMashIngredients,
		withdrawBulkSpirits,
		// Getters
		getBatchesInStage,
		getBatchesByCurrentStage,
		getBatchByStatus,
		getRecipeNameByBatchId,
	};
});
