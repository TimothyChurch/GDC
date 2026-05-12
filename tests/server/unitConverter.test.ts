import { describe, it, expect } from 'vitest';
import {
	normalizeUnit,
	toWineGallons,
	fromWineGallons,
	convertVolume,
	normalizeAbv,
	roundVolume,
	UnitConversionError,
	toFahrenheit,
	fromFahrenheit,
	convertTemperature,
	normalizeTemperatureUnit,
	toAbvPercent,
	fromAbvPercent,
	convertStrength,
	normalizeStrengthUnit,
} from '~/server/utils/unitConverter';

describe('normalizeUnit', () => {
	it('normalizes gallon aliases', () => {
		expect(normalizeUnit('Gallon')).toBe('gallon');
		expect(normalizeUnit('gallon')).toBe('gallon');
		expect(normalizeUnit('GAL')).toBe('gallon');
		expect(normalizeUnit('gal')).toBe('gallon');
		expect(normalizeUnit('gals')).toBe('gallon');
		expect(normalizeUnit(' gallons ')).toBe('gallon');
	});

	it('normalizes liter aliases', () => {
		expect(normalizeUnit('L')).toBe('liter');
		expect(normalizeUnit('l')).toBe('liter');
		expect(normalizeUnit('liter')).toBe('liter');
		expect(normalizeUnit('liters')).toBe('liter');
		expect(normalizeUnit('Litre')).toBe('liter');
	});

	it('normalizes weight aliases', () => {
		expect(normalizeUnit('lb')).toBe('pound');
		expect(normalizeUnit('LBS')).toBe('pound');
		expect(normalizeUnit('kg')).toBe('kilogram');
		expect(normalizeUnit('oz')).toBe('ounce');
	});

	it('throws on unknown unit (no silent fallback)', () => {
		expect(() => normalizeUnit('quart')).toThrow(UnitConversionError);
		expect(() => normalizeUnit('barrel')).toThrow(UnitConversionError);
		expect(() => normalizeUnit('hogshead')).toThrow(UnitConversionError);
	});

	it('throws on empty/null input', () => {
		expect(() => normalizeUnit('')).toThrow(UnitConversionError);
		expect(() => normalizeUnit(null)).toThrow(UnitConversionError);
		expect(() => normalizeUnit(undefined)).toThrow(UnitConversionError);
	});
});

describe('toWineGallons', () => {
	it('converts gallons (identity)', () => {
		expect(toWineGallons(10, 'gallon')).toBe(10);
		expect(toWineGallons(10, 'GAL')).toBe(10);
	});

	it('converts liters', () => {
		expect(toWineGallons(3.78541, 'liter')).toBeCloseTo(1, 4);
		expect(toWineGallons(1, 'L')).toBeCloseTo(0.26417, 4);
	});

	it('converts milliliters', () => {
		expect(toWineGallons(3785.41, 'milliliter')).toBeCloseTo(1, 3);
		expect(toWineGallons(1000, 'mL')).toBeCloseTo(0.26417, 3);
	});

	it('converts fluid ounces', () => {
		expect(toWineGallons(128, 'fluid_ounce')).toBe(1);
		expect(toWineGallons(128, 'fl oz')).toBe(1);
	});

	it('throws on unknown unit', () => {
		expect(() => toWineGallons(10, 'quart')).toThrow(UnitConversionError);
	});

	it('throws on weight unit (cross-domain)', () => {
		expect(() => toWineGallons(10, 'pound')).toThrow(UnitConversionError);
		expect(() => toWineGallons(10, 'kilogram')).toThrow(UnitConversionError);
	});

	it('throws on non-finite volume', () => {
		expect(() => toWineGallons(NaN, 'gallon')).toThrow(UnitConversionError);
		expect(() => toWineGallons(Infinity, 'gallon')).toThrow(UnitConversionError);
	});
});

describe('fromWineGallons', () => {
	it('round-trips correctly', () => {
		const original = 12.345;
		expect(fromWineGallons(toWineGallons(original, 'liter'), 'liter')).toBeCloseTo(original, 6);
		expect(fromWineGallons(toWineGallons(original, 'milliliter'), 'milliliter')).toBeCloseTo(original, 4);
		expect(fromWineGallons(toWineGallons(original, 'fluid_ounce'), 'fluid_ounce')).toBeCloseTo(original, 6);
	});
});

describe('convertVolume', () => {
	it('converts via gallons internally', () => {
		expect(convertVolume(1, 'gallon', 'liter')).toBeCloseTo(3.78541, 4);
		expect(convertVolume(1, 'liter', 'milliliter')).toBeCloseTo(1000, 3);
		expect(convertVolume(1, 'gallon', 'fluid_ounce')).toBe(128);
	});

	it('throws on either side unknown', () => {
		expect(() => convertVolume(1, 'gallon', 'quart')).toThrow(UnitConversionError);
		expect(() => convertVolume(1, 'quart', 'gallon')).toThrow(UnitConversionError);
	});
});

describe('normalizeAbv', () => {
	it('treats values > 1 as percentages', () => {
		expect(normalizeAbv(80)).toBe(80);
		expect(normalizeAbv(40)).toBe(40);
	});

	it('scales 0..1 values up to percentages', () => {
		expect(normalizeAbv(0.8)).toBe(80);
		expect(normalizeAbv(0.4)).toBeCloseTo(40, 6);
	});

	it('handles edge cases', () => {
		expect(normalizeAbv(0)).toBe(0);
		expect(normalizeAbv(null)).toBe(0);
		expect(normalizeAbv(undefined)).toBe(0);
		expect(normalizeAbv(NaN)).toBe(0);
	});
});

describe('roundVolume', () => {
	it('rounds to 4 decimals by default', () => {
		expect(roundVolume(1.23456789)).toBe(1.2346);
		expect(roundVolume(100.000001)).toBe(100);
	});

	it('respects custom decimals', () => {
		expect(roundVolume(1.23456789, 2)).toBe(1.23);
		expect(roundVolume(1.5, 0)).toBe(2);
	});

	it('handles non-finite gracefully', () => {
		expect(roundVolume(NaN)).toBe(0);
		expect(roundVolume(Infinity)).toBe(0);
	});
});

describe('temperature', () => {
	it('normalizes F/C aliases', () => {
		expect(normalizeTemperatureUnit('F')).toBe('fahrenheit');
		expect(normalizeTemperatureUnit('°F')).toBe('fahrenheit');
		expect(normalizeTemperatureUnit('Celsius')).toBe('celsius');
		expect(normalizeTemperatureUnit('°c')).toBe('celsius');
	});

	it('throws on unknown temperature unit', () => {
		expect(() => normalizeTemperatureUnit('K')).toThrow(UnitConversionError);
	});

	it('toFahrenheit handles canonical and conversion', () => {
		expect(toFahrenheit(72, 'fahrenheit')).toBe(72);
		expect(toFahrenheit(0, 'celsius')).toBe(32);
		expect(toFahrenheit(100, 'celsius')).toBe(212);
	});

	it('fromFahrenheit converts both directions', () => {
		expect(fromFahrenheit(32, 'celsius')).toBe(0);
		expect(fromFahrenheit(212, 'celsius')).toBe(100);
		expect(fromFahrenheit(70, 'fahrenheit')).toBe(70);
	});

	it('convertTemperature is symmetric', () => {
		expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
		expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
	});
});

describe('strength (ABV ↔ proof)', () => {
	it('normalizes aliases', () => {
		expect(normalizeStrengthUnit('ABV')).toBe('abv');
		expect(normalizeStrengthUnit('%')).toBe('abv');
		expect(normalizeStrengthUnit('Proof')).toBe('proof');
	});

	it('toAbvPercent: proof divides by 2, abv passes through', () => {
		expect(toAbvPercent(80, 'proof')).toBe(40);
		expect(toAbvPercent(40, 'abv')).toBe(40);
	});

	it('fromAbvPercent: doubles for proof', () => {
		expect(fromAbvPercent(40, 'proof')).toBe(80);
		expect(fromAbvPercent(40, 'abv')).toBe(40);
	});

	it('convertStrength round-trips', () => {
		expect(convertStrength(80, 'proof', 'abv')).toBe(40);
		expect(convertStrength(40, 'abv', 'proof')).toBe(80);
	});
});
