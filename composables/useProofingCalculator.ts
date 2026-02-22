export const useProofingCalculator = () => {
	const initialWeight = ref({ weight: 0, unit: 'lb' });
	const initialAbv = ref(0);
	const targetAbv = ref();
	const steps: Ref<{ volume: number; unit: string; abv: number }[]> = ref([]);

	const initialVolume: Ref<{ volume: number; unit: string }> = computed(() => {
		if (initialWeight.value.unit === 'lb') {
			const volume = parseFloat(
				imperialWeightToVolume(
					initialWeight.value.weight,
					initialAbv.value
				).toFixed(2)
			);
			const unit = 'gal';
			return { volume, unit };
		} else {
			const volume = parseFloat(
				metricWeightToVolume(
					initialWeight.value.weight,
					initialAbv.value
				).toFixed(2)
			);
			const unit = 'L';
			return { volume, unit };
		}
	});
	const currentVolume = computed(() => {
		let stepsVolume = 0;
		if (steps.value.length > 0) {
			steps.value.forEach((step) => {
				if (step.volume != 0 && step.unit != '') {
					stepsVolume +=
						step.volume * convertUnitRatio(step.unit, initialVolume.value.unit);
				}
			});
		}
		const volume = parseFloat(
			(initialVolume.value.volume + stepsVolume).toFixed(2)
		);
		const unit = initialVolume.value.unit;
		return { volume, unit };
	});

	const estimateFinalVolume: Ref<{ volume: number; unit: string } | undefined> =
		computed(() => {
			if (targetAbv.value == 0) {
				return;
			}
			if (steps.value.length >= 1) {
				let abv = 0;
				if (steps.value[steps.value.length - 1].abv != 0) {
					abv = steps.value[steps.value.length - 1].abv;
				} else if (steps.value.length > 2) {
					abv = steps.value[steps.value.length - 2].abv;
				} else {
					abv = initialAbv.value;
				}
				const volume = parseFloat(
					((abv * currentVolume.value.volume) / targetAbv.value).toFixed(2)
				);
				const unit = initialVolume.value.unit;
				return { volume, unit };
			}
			if (steps.value.length == 0) {
				const volume = parseFloat(
					(
						(initialAbv.value * initialVolume.value.volume) /
						targetAbv.value
					).toFixed(2)
				);
				const unit = initialVolume.value.unit;
				return { volume, unit };
			}
			if (steps.value.length == 1) {
			}
			if (steps.value[steps.value.length - 1].abv != 0) {
			}
		});

	const waterNeeded = computed(() => {
		if (estimateFinalVolume.value === undefined) {
			return undefined;
		}
		const volume = parseFloat(
			(
				(estimateFinalVolume.value.volume - currentVolume.value.volume) *
				0.75
			).toFixed(2)
		);
		const unit = estimateFinalVolume.value.unit;
		return { volume, unit };
	});

	const removeStep = (index: number) => {
		steps.value.splice(index, 1);
	};

	const clear = () => {
		initialWeight.value = { weight: 0, unit: 'lb' };
		initialAbv.value = 0;
		targetAbv.value = 0;
		steps.value = [];
	};

	return {
		initialWeight,
		initialAbv,
		targetAbv,
		initialVolume,
		currentVolume,
		estimateFinalVolume,
		waterNeeded,
		steps,
		removeStep,
		clear,
	};
};
