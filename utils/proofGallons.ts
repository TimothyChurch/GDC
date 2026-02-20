import { convertUnitRatio } from './conversions'

/**
 * Convert a volume to US gallons using the existing conversion table.
 * Falls back to assuming gallons if the unit is unrecognized.
 */
export function toGallons(volume: number, unit: string): number {
  if (!unit || unit === 'gallon' || unit === 'gal') return volume
  const ratio = convertUnitRatio(unit, 'gallon')
  return volume * ratio
}

/**
 * Calculate proof gallons from volume, unit, and ABV.
 * Formula: volume_in_gallons × (ABV / 50)
 * Equivalent to: volume_in_gallons × ABV × 2 / 100
 *
 * TTB definition: 1 proof gallon = 1 gallon at 50% ABV (100 proof).
 */
export function calculateProofGallons(volume: number, volumeUnit: string, abv: number): number {
  if (!volume || !abv) return 0
  const gallons = toGallons(volume, volumeUnit)
  return +(gallons * abv / 50).toFixed(4)
}
