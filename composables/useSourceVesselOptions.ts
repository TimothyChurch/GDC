import type { Ref } from 'vue';

export interface SourceVesselOption {
	id: string;
	name: string;
	availableVolume: number;
	availableVolumeUnit: string;
	abv: number;
}

export interface UseSourceVesselOptionsConfig {
	/** Vessel ID always included even if vessel.contents has no entry for the batch.
	 *  Used by ModalDistillingCharge to keep the prefill source visible after the
	 *  vessel was already drained by a prior transfer. */
	explicitSourceVesselId?: Ref<string | undefined>;
}

/**
 * Source-vessel candidates for a still charge, filtered by batch presence and
 * vessel type appropriate to the run type.
 *
 *   - 'stripping' run accepts wash from Fermenter or Tank.
 *   - 'spirit'    run accepts low wines from Tank only.
 *
 * Lifted from `components/Modal/ModalDistillingCharge.vue` (#39 / #50) so it
 * can be reused by future charge UIs and exercised by tests independently
 * of the modal's own state.
 */
export function useSourceVesselOptions(
	batchId: Ref<string>,
	runType: Ref<'stripping' | 'spirit'>,
	config?: UseSourceVesselOptionsConfig,
) {
	const vesselStore = useVesselStore();

	const allowedSourceTypes = computed<string[]>(() =>
		runType.value === 'spirit' ? ['Tank'] : ['Fermenter', 'Tank'],
	);

	const sourceVesselOptions = computed<SourceVesselOption[]>(() => {
		const out: SourceVesselOption[] = [];
		for (const v of vesselStore.vessels) {
			if (v.type === 'Still') continue;
			const entry = v.contents?.find(
				(c) => c.batch === batchId.value && c.volume > 0.001,
			);
			const typeAllowed = allowedSourceTypes.value.includes(v.type);
			const isExplicitSource = config?.explicitSourceVesselId?.value === v._id;

			// Include if the vessel holds this batch AND is an allowed type,
			// OR if it's the explicit source even when its contents were already drained.
			if (!isExplicitSource && !(entry && typeAllowed)) continue;

			out.push({
				id: v._id,
				name: v.name,
				availableVolume: entry?.volume || 0,
				availableVolumeUnit: entry?.volumeUnit || 'gallon',
				abv: entry?.abv || 0,
			});
		}
		return out;
	});

	return { sourceVesselOptions, allowedSourceTypes };
}
