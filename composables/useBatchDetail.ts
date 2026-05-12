import type { Ref } from 'vue';
import {
	hasReachedStage as _hasReached,
	isStageActive,
	hasStageVolumes,
	getNextStage,
	getActiveStages,
	getPreviousStage,
} from '~/composables/batchPipeline';

/**
 * Read-only derivations for a single batch on the detail page.
 *
 * Lifted out of `pages/admin/batch/[_id].vue` (#39 / #50): centralizes the
 * pipeline-aware checks (`hasReached`, `canEdit`, `canStepBack`,
 * `advancableStages`, `barrelAgingHasBarrels`, `containingVessels`) so the
 * page focuses on layout + UI state.
 */
export function useBatchDetail(batchId: Ref<string | undefined>) {
	const batchStore = useBatchStore();
	const recipeStore = useRecipeStore();
	const vesselStore = useVesselStore();

	const batch = computed(() =>
		batchId.value ? batchStore.getBatchById(batchId.value) : undefined,
	);

	const recipe = computed(() =>
		batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : undefined,
	);

	const containingVessels = computed(() => {
		if (!batch.value?._id) return [];
		return vesselStore.vessels.filter((v) =>
			v.contents?.some((c) => c.batch === batch.value!._id),
		);
	});

	const hasReached = (stageName: string): boolean => {
		const b = batch.value;
		if (!b) return false;
		if (b.currentStage === 'Upcoming' && !hasStageVolumes(b)) return false;
		if (hasStageVolumes(b)) {
			return isStageActive(b, stageName) || _hasReached(b.pipeline, b.currentStage, stageName);
		}
		return _hasReached(b.pipeline, b.currentStage, stageName);
	};

	const canEdit = (stageName: string): boolean => {
		const b = batch.value;
		if (!b) return false;
		if (b.status !== 'active' && b.status !== 'completed') return false;
		return hasReached(stageName);
	};

	const advancableStages = computed<string[]>(() => {
		const b = batch.value;
		if (!b || b.status !== 'active') return [];
		const result: string[] = [];

		if (hasStageVolumes(b)) {
			const active = getActiveStages(b);
			for (const stage of active) {
				if (stage === 'Upcoming') {
					if (b.pipeline.length > 0) result.push(stage);
				} else {
					const next = getNextStage(b.pipeline, stage);
					if (next) result.push(stage);
				}
			}
		} else {
			// Legacy: advance from currentStage if there's a next stage
			const next = b.currentStage === 'Upcoming'
				? b.pipeline[0]
				: getNextStage(b.pipeline, b.currentStage);
			if (next) result.push(b.currentStage);
		}

		// Include terminal Storage stages (no next stage but has volume)
		if (hasStageVolumes(b)) {
			const active = getActiveStages(b);
			for (const stage of active) {
				if (
					stage === 'Storage'
					&& !getNextStage(b.pipeline, stage)
					&& !result.includes(stage)
				) {
					result.push(stage);
				}
			}
		}

		return result;
	});

	const barrelAgingHasBarrels = computed(() => {
		if (!batch.value?._id) return false;
		return vesselStore.vessels.some(
			(v) => v.type === 'Barrel' && v.contents?.some((c) => c.batch === batch.value!._id),
		);
	});

	const canStepBack = (stageName: string): boolean => {
		const b = batch.value;
		if (!b) return false;
		if (b.status !== 'active' && b.status !== 'completed') return false;
		if (!hasStageVolumes(b)) return false;
		if (!isStageActive(b, stageName)) return false;
		const prev = getPreviousStage(b.pipeline, stageName);
		return !!prev;
	};

	return {
		batch,
		recipe,
		containingVessels,
		hasReached,
		canEdit,
		advancableStages,
		barrelAgingHasBarrels,
		canStepBack,
	};
}
