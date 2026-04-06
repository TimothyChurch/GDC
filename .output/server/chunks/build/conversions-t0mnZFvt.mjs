const convertUnitRatio = (fromUnit, toUnit) => {
  if (!fromUnit || !toUnit || fromUnit === toUnit) {
    return 1;
  }
  const conversionRates = {
    // Volume Measurements (gal/gallon are aliases — both included as targets)
    "12oz can": {
      "fl oz": 12,
      cup: 1.5,
      gal: 0.09375,
      gallon: 0.09375,
      mL: 355,
      L: 0.355
    },
    "fl oz": {
      cup: 0.125,
      gal: 78125e-7,
      gallon: 78125e-7,
      mL: 29.5735,
      L: 0.0295735
    },
    cup: { "fl oz": 8, gal: 0.0625, gallon: 0.0625, mL: 236.588, L: 0.236588 },
    gal: { "fl oz": 128, cup: 16, gallon: 1, mL: 3785.41, L: 3.78541 },
    gallon: { "fl oz": 128, cup: 16, gal: 1, mL: 3785.41, L: 3.78541 },
    mL: {
      "fl oz": 0.033814,
      cup: 422675e-8,
      gal: 264172e-9,
      gallon: 264172e-9,
      L: 1e-3
    },
    L: {
      "fl oz": 33.814,
      cup: 4.22675,
      gal: 0.264172,
      gallon: 0.264172,
      mL: 1e3,
      L: 1
    },
    // Weight Measurements
    oz: { lb: 0.0625, g: 28.3495, kg: 0.0283495 },
    lb: { oz: 16, g: 453.592, kg: 0.453592 },
    g: { oz: 0.035274, lb: 220462e-8, kg: 1e-3 },
    kg: { oz: 35.274, lb: 2.20462, g: 1e3 },
    // Counts
    bottle: { each: 1, bottle: 1, count: 1 },
    each: { each: 1, bottle: 1, count: 1 },
    count: { each: 1, bottle: 1, count: 1 }
  };
  const fromRates = conversionRates[fromUnit];
  if (!fromRates || fromRates[toUnit] === void 0) {
    return 1;
  }
  return fromRates[toUnit];
};
const metricWeightToVolume = (weight, abv) => {
  const densityWater = 1;
  const densityAlcohol = 0.78947;
  let mixtureAbv = 0;
  if (abv > 1) {
    mixtureAbv = abv * 0.01;
  } else {
    mixtureAbv = abv;
  }
  const densityMixture = densityAlcohol * mixtureAbv + densityWater * (1 - mixtureAbv);
  const volume = weight / densityMixture;
  return volume;
};
const imperialWeightToVolume = (weight, abv) => {
  const densityWater = 8.33;
  const densityAlcohol = 6.5;
  let mixtureAbv = 0;
  if (abv > 1) {
    mixtureAbv = abv * 0.01;
  } else {
    mixtureAbv = abv;
  }
  const densityMixture = densityAlcohol * mixtureAbv + densityWater * (1 - mixtureAbv);
  const volume = weight / densityMixture;
  return volume;
};

export { convertUnitRatio as c, imperialWeightToVolume as i, metricWeightToVolume as m };
//# sourceMappingURL=conversions-t0mnZFvt.mjs.map
