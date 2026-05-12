import { describe, it, expect } from 'vitest';
import { bottleToWineGallons } from '~/composables/useProductionCosts';

describe('bottleToWineGallons', () => {
	it('converts millilitres to wine gallons', () => {
		// 750 mL is the canonical bottle size — ≈ 0.198 gal
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'mL' })).toBeCloseTo(0.19813, 4);
	});

	it('treats lowercase ml as millilitres', () => {
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'ml' })).toBeCloseTo(0.19813, 4);
	});

	it('treats "milliliter" / "milliliters" as millilitres', () => {
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'milliliter' })).toBeCloseTo(0.19813, 4);
		expect(bottleToWineGallons({ volume: 1000, volumeUnit: 'milliliters' })).toBeCloseTo(0.26417, 4);
	});

	it('converts litres to wine gallons', () => {
		// 1 L ≈ 0.264 gal
		expect(bottleToWineGallons({ volume: 1, volumeUnit: 'L' })).toBeCloseTo(0.26417, 4);
		expect(bottleToWineGallons({ volume: 1, volumeUnit: 'l' })).toBeCloseTo(0.26417, 4);
		expect(bottleToWineGallons({ volume: 1, volumeUnit: 'liter' })).toBeCloseTo(0.26417, 4);
	});

	it('converts fluid ounces (oz)', () => {
		// 128 fl oz = 1 gallon
		expect(bottleToWineGallons({ volume: 128, volumeUnit: 'oz' })).toBeCloseTo(1, 4);
		expect(bottleToWineGallons({ volume: 128, volumeUnit: 'fl oz' })).toBeCloseTo(1, 4);
	});

	it('treats gallons as identity', () => {
		expect(bottleToWineGallons({ volume: 5, volumeUnit: 'gal' })).toBe(5);
		expect(bottleToWineGallons({ volume: 5, volumeUnit: 'gallon' })).toBe(5);
		expect(bottleToWineGallons({ volume: 5, volumeUnit: 'gallons' })).toBe(5);
	});

	it('defaults to 750mL when volume is missing', () => {
		expect(bottleToWineGallons({ volumeUnit: 'mL' })).toBeCloseTo(0.19813, 4);
		expect(bottleToWineGallons({})).toBeCloseTo(0.19813, 4);
	});

	it('defaults to mL when unit is missing or unknown', () => {
		// 750 with no unit treated as mL
		expect(bottleToWineGallons({ volume: 750 })).toBeCloseTo(0.19813, 4);
		// Unknown unit also falls back to mL (defensive)
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'foo' })).toBeCloseTo(0.19813, 4);
	});

	it('is case-insensitive', () => {
		expect(bottleToWineGallons({ volume: 1, volumeUnit: 'GAL' })).toBe(1);
		expect(bottleToWineGallons({ volume: 1, volumeUnit: 'Liter' })).toBeCloseTo(0.26417, 4);
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'ML' })).toBeCloseTo(0.19813, 4);
	});

	it('produces the expected WG for common bottle sizes', () => {
		expect(bottleToWineGallons({ volume: 50, volumeUnit: 'mL' })).toBeCloseTo(0.01321, 4); // mini
		expect(bottleToWineGallons({ volume: 200, volumeUnit: 'mL' })).toBeCloseTo(0.05283, 4); // half-pint
		expect(bottleToWineGallons({ volume: 375, volumeUnit: 'mL' })).toBeCloseTo(0.09907, 4); // half-bottle
		expect(bottleToWineGallons({ volume: 750, volumeUnit: 'mL' })).toBeCloseTo(0.19813, 4); // standard
		expect(bottleToWineGallons({ volume: 1000, volumeUnit: 'mL' })).toBeCloseTo(0.26417, 4); // liter
		expect(bottleToWineGallons({ volume: 1750, volumeUnit: 'mL' })).toBeCloseTo(0.46230, 4); // handle
	});
});
