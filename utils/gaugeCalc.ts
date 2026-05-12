import { convertUnitRatio } from './conversions'
import { calculateProofGallons, toGallons } from './proofGallons'

/**
 * Distillery gauging conversions used at the point of data entry — temperature,
 * brix/SG, volume conversions, proof gallons. Pure functions; wrap in a computed
 * in the calling component if reactivity is needed.
 *
 * Note: `abvToProof` / `proofToAbv` live in `composables/transferDefinitions.ts`
 * and are auto-imported globally — don't redefine them here.
 */

export function fToC(f: number): number {
  if (!Number.isFinite(f)) return 0
  return +(((f - 32) * 5) / 9).toFixed(1)
}

export function cToF(c: number): number {
  if (!Number.isFinite(c)) return 0
  return +((c * 9) / 5 + 32).toFixed(1)
}

/** Brix → specific gravity (homebrewer's formula, accurate within working ranges). */
export function brixToSg(brix: number): number {
  if (!Number.isFinite(brix) || brix <= 0) return 1
  return +(1 + brix / (258.6 - (brix / 258.2) * 227.1)).toFixed(4)
}

export function sgToBrix(sg: number): number {
  if (!Number.isFinite(sg) || sg <= 1) return 0
  return +(((sg - 1) * 1000) / 4).toFixed(2)
}

export function convertVolume(volume: number, fromUnit: string, toUnit: string): number {
  if (!Number.isFinite(volume)) return 0
  return +(volume * convertUnitRatio(fromUnit, toUnit)).toFixed(4)
}

export function gaugeProofGallons(volume: number, volumeUnit: string, abv: number): number {
  return calculateProofGallons(volume, volumeUnit, abv)
}

export function asGallons(volume: number, unit: string): number {
  return +toGallons(volume, unit).toFixed(4)
}
