import { describe, it, expect } from 'vitest'
import { toGallons, calculateProofGallons } from '../../utils/proofGallons'

describe('toGallons', () => {
  it('returns volume unchanged for gallons', () => {
    expect(toGallons(10, 'gallon')).toBe(10)
    expect(toGallons(10, 'gal')).toBe(10)
  })

  it('converts liters to gallons', () => {
    expect(toGallons(1, 'L')).toBeCloseTo(0.264172, 4)
    expect(toGallons(3.78541, 'L')).toBeCloseTo(1, 2)
  })

  it('converts mL to gallons', () => {
    expect(toGallons(3785.41, 'mL')).toBeCloseTo(1, 2)
  })

  it('falls back to 1:1 for unknown units', () => {
    expect(toGallons(5, 'unknown')).toBe(5)
  })

  it('handles empty/falsy unit as gallons', () => {
    expect(toGallons(7, '')).toBe(7)
  })
})

describe('calculateProofGallons', () => {
  it('calculates correctly for 1 gallon at 50% ABV = 1 PG', () => {
    expect(calculateProofGallons(1, 'gallon', 50)).toBe(1)
  })

  it('calculates correctly for 1 gallon at 100% ABV = 2 PG', () => {
    expect(calculateProofGallons(1, 'gallon', 100)).toBe(2)
  })

  it('calculates correctly for 10 gallons at 40% ABV = 8 PG', () => {
    expect(calculateProofGallons(10, 'gallon', 40)).toBe(8)
  })

  it('handles liters with unit conversion', () => {
    // 3.78541 L ≈ 1 gallon, at 50% ABV → ~1 PG
    expect(calculateProofGallons(3.78541, 'L', 50)).toBeCloseTo(1, 1)
  })

  it('returns 0 for zero volume', () => {
    expect(calculateProofGallons(0, 'gallon', 50)).toBe(0)
  })

  it('returns 0 for zero ABV', () => {
    expect(calculateProofGallons(10, 'gallon', 0)).toBe(0)
  })

  it('returns 0 for falsy volume', () => {
    expect(calculateProofGallons(NaN, 'gallon', 50)).toBe(0)
  })

  it('rounds to 4 decimal places', () => {
    const result = calculateProofGallons(1, 'L', 45)
    const decimals = result.toString().split('.')[1]?.length || 0
    expect(decimals).toBeLessThanOrEqual(4)
  })
})
