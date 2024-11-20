export const literToGallon = (liter: number) => {
  return liter * 0.264172;
};

export const gallonToLiter = (gallon: number) => {
  return gallon * 3.78541;
};

export const lbToKg = (lb: number) => {
  return lb * 0.453592;
};

export const kgToLb = (kg: number) => {
  return kg * 2.20462;
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
