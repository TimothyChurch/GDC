import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Batch, BatchStages, Recipe } from '~/types';

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
	stages: emptyStages(),
});

export const useBatchStore = defineStore('batches', () => {
	const toast = useToast();

	// State
	const batches = ref<Batch[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
	const batch = ref<Batch>(defaultBatch());

	// --- Computed filters by currentStage ---
	const activeBatches = computed(() =>
		batches.value.filter((b) => b.status === 'active')
	);
	const completedBatches = computed(() =>
		batches.value.filter((b) => b.status === 'completed')
	);

	// Stage-based filters (for dashboard pipeline widget compatibility)
	const upcomingBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Upcoming' && b.status === 'active')
	);
	const mashingBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Mashing' && b.status === 'active')
	);
	const fermentingBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Fermenting' && b.status === 'active')
	);
	const distillingBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Distilling' && b.status === 'active')
	);
	const storedBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Storage' && b.status === 'active')
	);
	const barrelAgingBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Barrel Aging' && b.status === 'active')
	);
	const macerationBatches = computed(() =>
		batches.value.filter((b) => b.currentStage === 'Maceration' && b.status === 'active')
	);

	// --- CRUD Actions ---
	const getBatches = async (): Promise<void> => {
		loading.value = true;
		try {
			const response = await $fetch('/api/batch');
			batches.value = response as Batch[];
		} catch (e) {
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			await getBatches();
			loaded.value = true;
		}
	};

	const setBatch = (id: string): void => {
		batch.value = batches.value.find(
			(b) => b._id === id
		) as Batch;
	};

	const updateBatch = async (): Promise<void> => {
		saving.value = true;
		try {
			const isNew = !batch.value._id;
			if (isNew) {
				const recipeStore = useRecipeStore();
				const recipeName = recipeStore.getRecipeById(batch.value.recipe)?.name;
				addLogEntry(batch.value, 'Batch created', recipeName ? `From recipe: ${recipeName}` : undefined);
				const response = await $fetch('/api/batch/create', {
					method: 'POST',
					body: JSON.stringify(batch.value),
				});
				batches.value.push(response as Batch);
			} else {
				const response = await $fetch(`/api/batch/${batch.value._id}`, {
					method: 'PUT',
					body: JSON.stringify(batch.value),
				});
				const index = batches.value.findIndex((b) => b._id === batch.value._id);
				if (index !== -1) {
					batches.value[index] = response as Batch;
				}
			}
			toast.add({ title: `Batch ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetBatch();
		} catch (error: any) {
			toast.add({ title: 'Failed to save batch', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const deleteBatch = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/batch/${id}`, {
				method: 'DELETE',
			});
			batches.value = batches.value.filter((b) => b._id !== id);
			toast.add({ title: 'Batch deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete batch', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const resetBatch = (): void => {
		batch.value = defaultBatch();
	};

	// --- Pipeline-based stage advancement ---

	/** Advance a batch to the next stage in its pipeline */
	const advanceToStage = async (
		batchId: string,
		targetStage: string,
		stageData?: { vessel?: string },
	): Promise<void> => {
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;

		// Mark previous stage as completed
		const prevStageKey = STAGE_KEY_MAP[target.currentStage];
		if (prevStageKey && target.stages[prevStageKey as keyof BatchStages]) {
			(target.stages[prevStageKey as keyof BatchStages] as any).completedAt = new Date();
		}

		// Set new current stage
		target.currentStage = targetStage;

		// Initialize the new stage data if it doesn't exist
		const newStageKey = STAGE_KEY_MAP[targetStage] as keyof BatchStages;
		if (newStageKey) {
			if (!target.stages[newStageKey]) {
				(target.stages as any)[newStageKey] = {};
			}
			const stage = target.stages[newStageKey] as any;
			stage.startedAt = new Date();
			if (stageData?.vessel) stage.vessel = stageData.vessel;
		}

		// If advancing to Bottled, mark batch as completed
		if (targetStage === 'Bottled') {
			target.status = 'completed';
		}

		// Add log entry
		addLogEntry(target, `Advanced to ${targetStage}`);

		batch.value = target;
		await updateBatch();
	};

	/** Start the first production stage (Mashing or Maceration) with vessel contents */
	const startFirstStage = async (batchId: string, vesselId: string): Promise<void> => {
		const vesselStore = useVesselStore();
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;

		const firstStage = target.pipeline[0];
		target.currentStage = firstStage;

		const stageKey = STAGE_KEY_MAP[firstStage] as keyof BatchStages;
		if (stageKey) {
			if (!target.stages[stageKey]) {
				(target.stages as any)[stageKey] = {};
			}
			const stage = target.stages[stageKey] as any;
			stage.startedAt = new Date();
			stage.vessel = vesselId;
		}

		addLogEntry(target, `Started ${firstStage}`);

		batch.value = target;
		await updateBatch();

		// Add batch contents to the vessel
		await vesselStore.addContents(vesselId, {
			batch: batchId,
			volume: target.batchSize || 0,
			volumeUnit: target.batchSizeUnit || 'gallon',
			abv: 0,
			value: target.batchCost || 0,
		});
	};

	/** Update data for a specific stage */
	const updateStageData = async (batchId: string, stageName: string, data: Record<string, any>, logMessage?: string): Promise<void> => {
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;

		const stageKey = STAGE_KEY_MAP[stageName] as keyof BatchStages;
		if (!stageKey) return;

		if (!target.stages[stageKey]) {
			(target.stages as any)[stageKey] = {};
		}
		Object.assign(target.stages[stageKey] as any, data);

		addLogEntry(target, logMessage || `Updated ${stageName} data`);

		batch.value = target;
		await updateBatch();
	};

	// --- Activity log ---

	const addLogEntry = (target: Batch, action: string, details?: string): void => {
		if (!target.log) target.log = [];
		const { user } = useAuth();
		const userName = user.value
			? `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim() || user.value.email
			: undefined;
		target.log.push({
			date: new Date(),
			action,
			details,
			user: userName || undefined,
		});
	};

	/** Add a manual note to a batch's activity log */
	const addNote = async (batchId: string, note: string): Promise<void> => {
		const target = batches.value.find((b) => b._id === batchId);
		if (!target) return;
		addLogEntry(target, 'Note added', note);
		batch.value = target;
		await updateBatch();
	};

	// --- Getters ---
	const getBatchById = (id: string): Batch | undefined => {
		return batches.value.find((b) => b._id === id);
	};

	const getBatchesByCurrentStage = (stage: string): Batch[] => {
		return batches.value.filter((b) => b.currentStage === stage && b.status === 'active');
	};

	const getBatchByStatus = (status: string): Batch[] => {
		return batches.value.filter((b) => b.status === status);
	};

	/** Get all distinct stages that have active batches */
	const activeStages = computed(() => {
		const stages = new Set<string>();
		for (const b of activeBatches.value) {
			stages.add(b.currentStage);
		}
		return [...stages];
	});

	const getRecipeNameByBatchId = (id: string): string | undefined => {
		const recipeStore = useRecipeStore();
		const b = getBatchById(id);
		if (b?.recipe) {
			const recipe = recipeStore.getRecipeById(b.recipe) as Recipe;
			return recipe?.name;
		}
	};

	return {
		// State
		batches,
		batch,
		loaded,
		loading,
		saving,
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
		// CRUD
		ensureLoaded,
		getBatches,
		setBatch,
		updateBatch,
		deleteBatch,
		resetBatch,
		// Pipeline advancement
		advanceToStage,
		startFirstStage,
		updateStageData,
		// Activity log
		addNote,
		// Getters
		getBatchById,
		getBatchesByCurrentStage,
		getBatchByStatus,
		getRecipeNameByBatchId,
	};
});
