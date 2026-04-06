import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';

function toGallons(volume, unit) {
  if (!unit || unit === "gallon" || unit === "gal") return volume;
  const ratio = convertUnitRatio(unit, "gallon");
  return volume * ratio;
}
function calculateProofGallons(volume, volumeUnit, abv) {
  if (!volume || !abv) return 0;
  const gallons = toGallons(volume, volumeUnit);
  return +(gallons * abv / 50).toFixed(4);
}

export { calculateProofGallons as c, toGallons as t };
//# sourceMappingURL=proofGallons--xmqBsFG.mjs.map
