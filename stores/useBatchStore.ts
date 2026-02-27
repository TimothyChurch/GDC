import type { Batch, BatchStages, DistillingRun, Recipe, TastingNote, TransferLogEntry } from '~/types';
import { STAGE_KEY_MAP, isStageActive, getActiveStages, hasStageVolumes, getStageIndex } from '~/composables/batchPipeline';

const emptyStages = (): BatchStages => ({});

const defaultBatch = (): Batch => ({
	_id: '',
	recipe: '',
	pipeline: ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
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

	// --- Pipeline-based stage advancement ---

	/** Start the first production stage with optional partial volume transfer */
	const startFirstStage = async (batchId: string, vesselId: string, transferVolume?: number): Promise<void> => {
		const vesselStore = useVesselStore();
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		ensureStageVolumes(target);

		const firstStage = target.pipeline[0];
		const upcomingVolume = target.stageVolumes!['Upcoming'] || target.batchSize || 0;
		const actualVolume = transferVolume != null ? Math.min(transferVolume, upcomingVolume) : upcomingVolume;

		const remainingUpcoming = upcomingVolume - actualVolume;
		if (remainingUpcoming > 0.001) {
			target.stageVolumes!['Upcoming'] = remainingUpcoming;
		} else {
			delete target.stageVolumes!['Upcoming'];
		}

		target.stageVolumes![firstStage] = (target.stageVolumes![firstStage] || 0) + actualVolume;

		const firstStageIdx = getStageIndex(target.pipeline, firstStage);
		const currentIdx = target.currentStage === 'Upcoming' ? -1 : getStageIndex(target.pipeline, target.currentStage);
		if (firstStageIdx > currentIdx) {
			target.currentStage = firstStage;
		}

		const stageKey = STAGE_KEY_MAP[firstStage] as keyof BatchStages;
		if (stageKey) {
			if (!target.stages[stageKey]) {
				(target.stages as any)[stageKey] = {};
			}
			const stage = target.stages[stageKey] as any;
			if (!stage.startedAt) {
				stage.startedAt = new Date();
			}
			if (vesselId && !stage.vessel) {
				stage.vessel = vesselId;
			}
		}

		addTransferLogEntry(target, {
			from: 'Upcoming',
			to: firstStage,
			volume: actualVolume,
			volumeUnit: target.batchSizeUnit || 'gallon',
			vessel: vesselId || undefined,
		});
		addLogEntry(target, `Transferred ${actualVolume} ${target.batchSizeUnit || 'gal'} to ${firstStage}`);

		crud.item.value = target;
		await updateBatch();

		if (vesselId) {
			await vesselStore.addContents(vesselId, {
				batch: batchId,
				volume: actualVolume,
				volumeUnit: target.batchSizeUnit || 'gallon',
				abv: 0,
				value: (target.batchCost || 0) * (actualVolume / (target.batchSize || actualVolume)),
			});
		}
	};

	/** Advance a batch from sourceStage to targetStage with optional partial volume. */
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

		ensureStageVolumes(target);

		const targetIdx = getStageIndex(target.pipeline, targetStage);
		let fromStage = sourceStage;
		if (!fromStage) {
			if (targetIdx === 0) {
				fromStage = 'Upcoming';
			} else if (targetIdx > 0) {
				fromStage = target.pipeline[targetIdx - 1];
			} else {
				fromStage = target.currentStage;
			}
		}

		const sourceVolume = target.stageVolumes![fromStage] || 0;
		const actualVolume = transferVolume != null ? Math.min(transferVolume, sourceVolume) : sourceVolume;
		if (actualVolume <= 0) return;

		const remainingSource = sourceVolume - actualVolume;
		if (remainingSource > 0.001) {
			target.stageVolumes![fromStage] = remainingSource;
		} else {
			delete target.stageVolumes![fromStage];
			const sourceKey = STAGE_KEY_MAP[fromStage] as keyof BatchStages;
			if (sourceKey && target.stages[sourceKey]) {
				(target.stages[sourceKey] as any).completedAt = new Date();
			}
		}

		const destVol = destinationVolume != null ? destinationVolume : actualVolume;
		target.stageVolumes![targetStage] = (target.stageVolumes![targetStage] || 0) + destVol;

		const currentIdx = target.currentStage === 'Upcoming' ? -1 : getStageIndex(target.pipeline, target.currentStage);
		if (targetIdx > currentIdx) {
			target.currentStage = targetStage;
		}

		const newStageKey = STAGE_KEY_MAP[targetStage] as keyof BatchStages;
		if (newStageKey) {
			if (!target.stages[newStageKey]) {
				(target.stages as any)[newStageKey] = {};
			}
			const stage = target.stages[newStageKey] as any;
			if (!stage.startedAt) {
				stage.startedAt = new Date();
			}
			if (stageData?.vessel && !stage.vessel) {
				stage.vessel = stageData.vessel;
			}
		}

		if (targetStage === 'Bottled') {
			const activeNonBottled = Object.entries(target.stageVolumes!)
				.filter(([stage, vol]) => stage !== 'Bottled' && vol > 0);
			if (activeNonBottled.length === 0) {
				target.status = 'completed';
			}
		}

		addTransferLogEntry(target, {
			from: fromStage,
			to: targetStage,
			volume: destVol,
			volumeUnit: target.batchSizeUnit || 'gallon',
			vessel: stageData?.vessel || undefined,
		});
		if (destinationVolume != null && destinationVolume !== actualVolume) {
			addLogEntry(target, `Distilled ${actualVolume} ${target.batchSizeUnit || 'gal'} from ${fromStage}, collected ${destVol} ${target.batchSizeUnit || 'gal'} to ${targetStage}`);
		} else {
			addLogEntry(target, `Transferred ${actualVolume} ${target.batchSizeUnit || 'gal'} from ${fromStage} to ${targetStage}`);
		}

		crud.item.value = target;
		await updateBatch();
	};

	/** Update data for a specific stage */
	const updateStageData = async (batchId: string, stageName: string, data: Record<string, any>, logMessage?: string): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		const stageKey = STAGE_KEY_MAP[stageName] as keyof BatchStages;
		if (!stageKey) return;

		if (!target.stages[stageKey]) {
			(target.stages as any)[stageKey] = {};
		}
		Object.assign(target.stages[stageKey] as any, data);

		addLogEntry(target, logMessage || `Updated ${stageName} data`);

		crud.item.value = target;
		await updateBatch();
	};

	// --- Distilling run management ---

	const addDistillingRun = async (batchId: string, run: DistillingRun): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target) return;

		if (!target.stages.distilling) {
			(target.stages as any).distilling = {};
		}
		const distilling = target.stages.distilling as any;
		if (!distilling.runs) distilling.runs = [];

		run.runNumber = distilling.runs.length + 1;
		distilling.runs.push(run);

		addLogEntry(target, `Added distilling run #${run.runNumber}`, `${run.runType} run`);

		crud.item.value = target;
		await updateBatch();
	};

	const updateDistillingRun = async (batchId: string, runIndex: number, data: Partial<DistillingRun>): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.distilling) return;

		const distilling = target.stages.distilling as any;
		if (!distilling.runs?.[runIndex]) return;

		Object.assign(distilling.runs[runIndex], data);

		addLogEntry(target, `Updated distilling run #${distilling.runs[runIndex].runNumber}`);

		crud.item.value = target;
		await updateBatch();
	};

	const deleteDistillingRun = async (batchId: string, runIndex: number): Promise<void> => {
		const target = crud.items.value.find((b) => b._id === batchId);
		if (!target?.stages?.distilling) return;

		const distilling = target.stages.distilling as any;
		if (!distilling.runs?.[runIndex]) return;

		const removedNumber = distilling.runs[runIndex].runNumber;
		distilling.runs.splice(runIndex, 1);

		distilling.runs.forEach((r: DistillingRun, i: number) => {
			r.runNumber = i + 1;
		});

		addLogEntry(target, `Deleted distilling run #${removedNumber}`);

		crud.item.value = target;
		await updateBatch();
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
		storedBatches,
		barrelAgingBatches,
		macerationBatches,
		activeStages,
		// Pipeline advancement
		advanceToStage,
		startFirstStage,
		updateStageData,
		// Distilling run management
		addDistillingRun,
		updateDistillingRun,
		deleteDistillingRun,
		// Activity log
		addNote,
		// Tasting notes
		addTastingNote,
		deleteTastingNote,
		// Getters
		getBatchesInStage,
		getBatchesByCurrentStage,
		getBatchByStatus,
		getRecipeNameByBatchId,
	};
});
