/**
 * Strict unit converter for the Transfer Engine.
 *
 * Replaces the lenient `utils/conversions.ts:convertUnitRatio()` which silently
 * returns 1 for unknown unit pairs and was the source of Bug 2.1 (silent volume
 * drift across the entire pipeline).
 *
 * This module:
 *   - Normalizes unit aliases (`Gallon` / `gal` / `GAL` / `gallon` → `gallon`)
 *   - Throws `UnitConversionError` on unknown units (no silent fallback)
 *   - Treats wine gallons as the canonical volume unit for all server math
 *
 * Why wine gallons? TTB §19.281–19.284 gauging requirements specify wine
 * gallons (and proof) as the recordkeeping basis. Storing one canonical unit
 * eliminates round-trip drift.
 */

export class UnitConversionError extends Error {
	readonly code = 'UNIT_CONVERSION_ERROR';
	constructor(message: string) {
		super(message);
		this.name = 'UnitConversionError';
	}
}

// ─── Canonical unit names ─────────────────────────────────────────────────────

export type CanonicalVolumeUnit = 'gallon' | 'liter' | 'milliliter' | 'fluid_ounce' | 'cup';
export type CanonicalWeightUnit = 'pound' | 'ounce' | 'kilogram' | 'gram';
export type CanonicalTemperatureUnit = 'fahrenheit' | 'celsius';
export type CanonicalStrengthUnit = 'abv' | 'proof';
export type CanonicalUnit = CanonicalVolumeUnit | CanonicalWeightUnit;

// ─── Alias normalization ──────────────────────────────────────────────────────

const VOLUME_ALIASES: Record<string, CanonicalVolumeUnit> = {
	// gallon
	gallon: 'gallon',
	gallons: 'gallon',
	gal: 'gallon',
	gals: 'gallon',
	// liter
	liter: 'liter',
	liters: 'liter',
	litre: 'liter',
	litres: 'liter',
	l: 'liter',
	// milliliter
	milliliter: 'milliliter',
	milliliters: 'milliliter',
	millilitre: 'milliliter',
	ml: 'milliliter',
	// fluid ounce
	'fluid_ounce': 'fluid_ounce',
	'fluid ounce': 'fluid_ounce',
	'fluid ounces': 'fluid_ounce',
	'fl oz': 'fluid_ounce',
	'fl_oz': 'fluid_ounce',
	floz: 'fluid_ounce',
	// cup
	cup: 'cup',
	cups: 'cup',
};

const WEIGHT_ALIASES: Record<string, CanonicalWeightUnit> = {
	pound: 'pound',
	pounds: 'pound',
	lb: 'pound',
	lbs: 'pound',
	ounce: 'ounce',
	ounces: 'ounce',
	oz: 'ounce',
	kilogram: 'kilogram',
	kilograms: 'kilogram',
	kg: 'kilogram',
	gram: 'gram',
	grams: 'gram',
	g: 'gram',
};

const ALL_ALIASES: Record<string, CanonicalUnit> = {
	...VOLUME_ALIASES,
	...WEIGHT_ALIASES,
};

/**
 * Normalize a user-supplied unit string to its canonical form.
 * Throws if the unit is unrecognized.
 */
export function normalizeUnit(raw: string | null | undefined): CanonicalUnit {
	if (raw === null || raw === undefined || raw === '') {
		throw new UnitConversionError('Unit is required (got empty/null)');
	}
	const lower = String(raw).trim().toLowerCase();
	const canonical = ALL_ALIASES[lower];
	if (!canonical) {
		throw new UnitConversionError(
			`Unknown unit: '${raw}'. Supported: ${Object.keys(ALL_ALIASES).sort().join(', ')}`,
		);
	}
	return canonical;
}

export function isVolumeUnit(unit: string): boolean {
	try {
		const c = normalizeUnit(unit);
		return c in VOLUME_TO_GALLON_FACTOR;
	} catch {
		return false;
	}
}

// ─── Conversion factors (canonical → gallon, multiplier) ──────────────────────
// All factors precomputed against US gallon (3.785411784 liters = 1 US gallon).

const VOLUME_TO_GALLON_FACTOR: Record<CanonicalVolumeUnit, number> = {
	gallon: 1,
	liter: 0.26417205235814845,
	milliliter: 0.00026417205235814845,
	fluid_ounce: 0.0078125,        // 1 fl oz = 1/128 gal
	cup: 0.0625,                   // 1 cup = 1/16 gal
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert any volume value to wine gallons (canonical).
 * Throws UnitConversionError on unknown units.
 *
 * Wine gallons differ from "wine gallons" the regulatory term — but for our
 * purposes (US distillery, no metric weighing) this is the same as US gallons.
 */
export function toWineGallons(volume: number, fromUnit: string): number {
	if (!Number.isFinite(volume)) {
		throw new UnitConversionError(`Volume must be finite, got: ${volume}`);
	}
	const canonical = normalizeUnit(fromUnit);
	const factor = VOLUME_TO_GALLON_FACTOR[canonical as CanonicalVolumeUnit];
	if (factor === undefined) {
		throw new UnitConversionError(
			`Unit '${fromUnit}' is a weight unit; cannot convert to volume`,
		);
	}
	return volume * factor;
}

/**
 * Convert wine gallons back to any other volume unit.
 */
export function fromWineGallons(volumeGallons: number, toUnit: string): number {
	if (!Number.isFinite(volumeGallons)) {
		throw new UnitConversionError(`Volume must be finite, got: ${volumeGallons}`);
	}
	const canonical = normalizeUnit(toUnit);
	const factor = VOLUME_TO_GALLON_FACTOR[canonical as CanonicalVolumeUnit];
	if (factor === undefined) {
		throw new UnitConversionError(
			`Unit '${toUnit}' is a weight unit; cannot convert from volume`,
		);
	}
	return volumeGallons / factor;
}

/**
 * Convert between any two volume units. Throws on unknown units.
 * Replaces the lenient `convertUnitRatio()` from `utils/conversions.ts`.
 */
export function convertVolume(volume: number, fromUnit: string, toUnit: string): number {
	const inGallons = toWineGallons(volume, fromUnit);
	return fromWineGallons(inGallons, toUnit);
}

/**
 * For ABV-aware code: ABV is unit-less but we treat anything > 1 as a
 * percentage (e.g., 80) and anything <= 1 as a ratio (e.g., 0.8). This
 * normalizes to a percentage 0..100.
 */
export function normalizeAbv(abv: number | null | undefined): number {
	if (abv === null || abv === undefined || !Number.isFinite(abv)) return 0;
	return abv > 1 ? abv : abv * 100;
}

/**
 * Round a volume to a sensible precision for storage.
 * Default 4 decimals (0.0001 gal ≈ 0.013 fl oz) — well below any physical gauge.
 */
export function roundVolume(volume: number, decimals = 4): number {
	if (!Number.isFinite(volume)) return 0;
	const factor = Math.pow(10, decimals);
	return Math.round(volume * factor) / factor;
}

// ─── Temperature ──────────────────────────────────────────────────────────────
// Temperature uses an offset, not a ratio, so it gets its own helpers rather
// than fitting into the multiplicative VOLUME_TO_GALLON_FACTOR pattern.
// Canonical for storage: Fahrenheit (US distillery convention).

const TEMPERATURE_ALIASES: Record<string, CanonicalTemperatureUnit> = {
	fahrenheit: 'fahrenheit',
	f: 'fahrenheit',
	'°f': 'fahrenheit',
	celsius: 'celsius',
	c: 'celsius',
	'°c': 'celsius',
	centigrade: 'celsius',
};

export function normalizeTemperatureUnit(raw: string | null | undefined): CanonicalTemperatureUnit {
	if (raw === null || raw === undefined || raw === '') {
		throw new UnitConversionError('Temperature unit is required (got empty/null)');
	}
	const lower = String(raw).trim().toLowerCase();
	const canonical = TEMPERATURE_ALIASES[lower];
	if (!canonical) {
		throw new UnitConversionError(
			`Unknown temperature unit: '${raw}'. Supported: ${Object.keys(TEMPERATURE_ALIASES).sort().join(', ')}`,
		);
	}
	return canonical;
}

export function toFahrenheit(value: number, fromUnit: string): number {
	if (!Number.isFinite(value)) {
		throw new UnitConversionError(`Temperature must be finite, got: ${value}`);
	}
	const c = normalizeTemperatureUnit(fromUnit);
	if (c === 'fahrenheit') return value;
	return value * 9 / 5 + 32;
}

export function fromFahrenheit(valueF: number, toUnit: string): number {
	if (!Number.isFinite(valueF)) {
		throw new UnitConversionError(`Temperature must be finite, got: ${valueF}`);
	}
	const c = normalizeTemperatureUnit(toUnit);
	if (c === 'fahrenheit') return valueF;
	return (valueF - 32) * 5 / 9;
}

export function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
	return fromFahrenheit(toFahrenheit(value, fromUnit), toUnit);
}

// ─── Strength (ABV ↔ proof) ───────────────────────────────────────────────────
// Canonical for storage: ABV percent (0–100). Proof = 2 × ABV%.

const STRENGTH_ALIASES: Record<string, CanonicalStrengthUnit> = {
	abv: 'abv',
	'%abv': 'abv',
	percent: 'abv',
	'%': 'abv',
	proof: 'proof',
};

export function normalizeStrengthUnit(raw: string | null | undefined): CanonicalStrengthUnit {
	if (raw === null || raw === undefined || raw === '') {
		throw new UnitConversionError('Strength unit is required (got empty/null)');
	}
	const lower = String(raw).trim().toLowerCase();
	const canonical = STRENGTH_ALIASES[lower];
	if (!canonical) {
		throw new UnitConversionError(
			`Unknown strength unit: '${raw}'. Supported: ${Object.keys(STRENGTH_ALIASES).sort().join(', ')}`,
		);
	}
	return canonical;
}

export function toAbvPercent(value: number, fromUnit: string): number {
	if (!Number.isFinite(value)) {
		throw new UnitConversionError(`Strength must be finite, got: ${value}`);
	}
	const c = normalizeStrengthUnit(fromUnit);
	if (c === 'abv') return value;
	return value / 2;  // proof → abv
}

export function fromAbvPercent(abv: number, toUnit: string): number {
	if (!Number.isFinite(abv)) {
		throw new UnitConversionError(`ABV must be finite, got: ${abv}`);
	}
	const c = normalizeStrengthUnit(toUnit);
	if (c === 'abv') return abv;
	return abv * 2;  // abv → proof
}

export function convertStrength(value: number, fromUnit: string, toUnit: string): number {
	return fromAbvPercent(toAbvPercent(value, fromUnit), toUnit);
}
