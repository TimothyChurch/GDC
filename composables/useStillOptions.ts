import { convertUnitRatio } from '~/utils/conversions';

/**
 * Capacity-aware select-menu options for the still vessels.
 *
 * Each option's label includes a capacity hint:
 *   - `"Still A (12.0/30 gal)"`  — current volume / total capacity
 *   - `"Still A (12.0 gal in use)"` — capacity unknown, but vessel has contents
 *   - `"Still A (empty)"` — capacity unknown and empty
 *
 * Extracted from `components/Modal/ModalDistillingCharge.vue` (#39).
 */
export function useStillOptions() {
	const vesselStore = useVesselStore();

	const stillOptions = computed(() => {
		return vesselStore.stills.map((v) => {
			const statsUnit = v.stats?.volumeUnit || 'gal';
			const currentVol = (v.current?.volume || 0)
				* convertUnitRatio(v.current?.volumeUnit || statsUnit, statsUnit);
			const capacity = v.stats?.volume || 0;
			const hint = capacity > 0
				? `${currentVol.toFixed(1)}/${capacity.toFixed(0)} ${statsUnit}`
				: currentVol > 0
					? `${currentVol.toFixed(1)} ${statsUnit} in use`
					: 'empty';
			return {
				label: `${v.name} (${hint})`,
				value: v._id,
			};
		});
	});

	return { stillOptions };
}
