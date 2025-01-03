export const convertUnitRatio = (fromUnit: string, toUnit: string) => {
	if (!fromUnit || !toUnit || fromUnit === toUnit) {
		return 1;
	}
	interface ConversionRates {
		[key: string]: { [key: string]: number };
	}
	const conversionRates: ConversionRates = {
		// Volume Measurements
		'fl oz': { cup: 0.125, gallon: 0.0078125, mL: 29.5735, L: 0.0295735 },
		cup: { 'fl oz': 8, gallon: 0.0625, mL: 236.588, L: 0.236588 },
		gallon: { 'fl oz': 128, cup: 16, mL: 3785.41, L: 3.78541 },
		mL: { 'fl oz': 0.033814, cup: 0.00422675, gallon: 0.000264172, L: 0.001 },
		L: { 'fl oz': 33.814, cup: 4.22675, gallon: 0.264172, mL: 1000 },
		// Weight Measurements
		oz: { lb: 0.0625, g: 28.3495, kg: 0.0283495 },
		lb: { oz: 16, g: 453.592, kg: 0.453592 },
		g: { oz: 0.035274, lb: 0.00220462, kg: 0.001 },
		kg: { oz: 35.274, lb: 2.20462, g: 1000 },
		// Counts
		bottle: { each: 1, bottle: 1, count: 1 },
		each: { each: 1, bottle: 1, count: 1 },
		count: { each: 1, bottle: 1, count: 1 },
	};
	return conversionRates[fromUnit][toUnit] as number;
};

export const metricWeightToVolume = (weight: number, abv: number) => {
	const densityWater = 1;
	const densityAlcohol = 0.78947;
	let mixtureAbv = 0;
	if (abv > 1) {
		mixtureAbv = abv * 0.01;
	} else {
		mixtureAbv = abv;
	}
	const densityMixture =
		densityAlcohol * mixtureAbv + densityWater * (1 - mixtureAbv);
	const volume = weight / densityMixture;
	return volume;
};

export const imperialWeightToVolume = (weight: number, abv: number) => {
	const densityWater = 8.33;
	const densityAlcohol = 6.5;
	let mixtureAbv = 0;
	if (abv > 1) {
		mixtureAbv = abv * 0.01;
	} else {
		mixtureAbv = abv;
	}
	const densityMixture =
		densityAlcohol * mixtureAbv + densityWater * (1 - mixtureAbv);
	const volume = weight / densityMixture;
	return volume;
};

export const proofing = (
	volume: number,
	initialAbv: number,
	targetAbv: number
) => {
	if (initialAbv > 1) {
		initialAbv = initialAbv * 0.01;
	}
	if (targetAbv > 1) {
		targetAbv = targetAbv * 0.01;
	}
	return (volume * initialAbv) / targetAbv;
};

export const stepProofing = (
	initialAbv: number,
	waterAdded: number,
	newAbv: number,
	targetAbv: number
) => {
	const newVolume = -(waterAdded * initialAbv) / (newAbv - initialAbv);
	const targetVolume = (newVolume * newAbv) / targetAbv;
	return targetVolume - newVolume;
};

export const proofingDown = (
	volume: number,
	initialAbv: number,
	targetAbv: number,
	spiritAbv: number
) => {
	return (initialAbv * volume - volume * targetAbv) / (targetAbv - spiritAbv);
};
