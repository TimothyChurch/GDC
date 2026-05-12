import {
	convertVolume,
	convertTemperature,
	convertStrength,
	toWineGallons,
	fromWineGallons,
	toFahrenheit,
	fromFahrenheit,
	toAbvPercent,
	fromAbvPercent,
} from '~/server/utils/unitConverter';
import type {
	SettingsVolumeUnit,
	SettingsStrengthUnit,
	SettingsTemperatureUnit,
	SettingsWeightUnit,
} from '~/types/interfaces/Settings';

/**
 * Single source of truth for unit display in the UI.
 *
 * Storage stays canonical — wine gallons, ABV percent, °F, pounds — and this
 * composable converts to whatever the admin selected in Settings → Units.
 *
 * Usage:
 *   const u = useDisplayUnits()
 *   {{ u.formatVolume(slot.volume) }}              // "100.0 gal" or "378.5 L"
 *   {{ u.formatStrength(bottle.abv) }}             // "40.0%" or "80 proof"
 *   const liters = u.fromCanonicalVolume(100)      // converts 100 gal → display unit
 *   const wg = u.toCanonicalVolume(378.5)          // user typed in display unit → gallons
 *
 * The composable reads reactively from useSettingsStore. Components don't
 * need to call ensureLoaded — when settings haven't fetched yet, defaults
 * (gallon, abv, fahrenheit, pound) are used.
 */

// ─── Display labels ───────────────────────────────────────────────────────────

export const VOLUME_LABEL: Record<SettingsVolumeUnit, string> = {
	gallon: 'gal',
	liter: 'L',
	milliliter: 'mL',
	fluid_ounce: 'fl oz',
};

export const STRENGTH_LABEL: Record<SettingsStrengthUnit, string> = {
	abv: '%',
	proof: 'proof',
};

export const TEMPERATURE_LABEL: Record<SettingsTemperatureUnit, string> = {
	fahrenheit: '°F',
	celsius: '°C',
};

export const WEIGHT_LABEL: Record<SettingsWeightUnit, string> = {
	pound: 'lb',
	kilogram: 'kg',
	ounce: 'oz',
	gram: 'g',
};

// ─── Selector option lists (for UI dropdowns) ─────────────────────────────────

export const VOLUME_OPTIONS: { label: string; value: SettingsVolumeUnit }[] = [
	{ label: 'Gallons (gal)', value: 'gallon' },
	{ label: 'Liters (L)', value: 'liter' },
	{ label: 'Milliliters (mL)', value: 'milliliter' },
	{ label: 'Fluid ounces (fl oz)', value: 'fluid_ounce' },
];

export const STRENGTH_OPTIONS: { label: string; value: SettingsStrengthUnit }[] = [
	{ label: 'ABV (%)', value: 'abv' },
	{ label: 'Proof', value: 'proof' },
];

export const TEMPERATURE_OPTIONS: { label: string; value: SettingsTemperatureUnit }[] = [
	{ label: 'Fahrenheit (°F)', value: 'fahrenheit' },
	{ label: 'Celsius (°C)', value: 'celsius' },
];

export const WEIGHT_OPTIONS: { label: string; value: SettingsWeightUnit }[] = [
	{ label: 'Pounds (lb)', value: 'pound' },
	{ label: 'Kilograms (kg)', value: 'kilogram' },
	{ label: 'Ounces (oz)', value: 'ounce' },
	{ label: 'Grams (g)', value: 'gram' },
];

// ─── Composable ───────────────────────────────────────────────────────────────

export function useDisplayUnits() {
	const settings = useSettingsStore();

	const volume = computed<SettingsVolumeUnit>(() => settings.units.volume);
	const strength = computed<SettingsStrengthUnit>(() => settings.units.strength);
	const temperature = computed<SettingsTemperatureUnit>(() => settings.units.temperature);
	const weight = computed<SettingsWeightUnit>(() => settings.units.weight);

	const volumeLabel = computed(() => VOLUME_LABEL[volume.value]);
	const strengthLabel = computed(() => STRENGTH_LABEL[strength.value]);
	const temperatureLabel = computed(() => TEMPERATURE_LABEL[temperature.value]);
	const weightLabel = computed(() => WEIGHT_LABEL[weight.value]);

	// ─── Volume ─────────────────────────────────────────────────────────────────

	/** Canonical (gallon) → display unit. */
	function fromCanonicalVolume(gallons: number): number {
		if (!Number.isFinite(gallons)) return 0;
		return fromWineGallons(gallons, volume.value);
	}

	/** User-entered value in display unit → canonical (gallon). */
	function toCanonicalVolume(value: number, fromUnit?: string): number {
		if (!Number.isFinite(value)) return 0;
		return toWineGallons(value, fromUnit || volume.value);
	}

	function formatVolume(gallons: number | null | undefined, opts: { decimals?: number; withLabel?: boolean } = {}): string {
		const { decimals = 2, withLabel = true } = opts;
		if (gallons == null || !Number.isFinite(gallons)) return '—';
		const v = fromCanonicalVolume(gallons).toFixed(decimals);
		return withLabel ? `${v} ${volumeLabel.value}` : v;
	}

	// ─── Strength ───────────────────────────────────────────────────────────────

	/** Canonical (ABV %) → display unit. */
	function fromCanonicalStrength(abv: number): number {
		if (!Number.isFinite(abv)) return 0;
		return fromAbvPercent(abv, strength.value);
	}

	/** User-entered value in display unit → canonical (ABV %). */
	function toCanonicalStrength(value: number, fromUnit?: string): number {
		if (!Number.isFinite(value)) return 0;
		return toAbvPercent(value, fromUnit || strength.value);
	}

	function formatStrength(abv: number | null | undefined, opts: { decimals?: number; withLabel?: boolean } = {}): string {
		const { decimals = 1, withLabel = true } = opts;
		if (abv == null || !Number.isFinite(abv)) return '—';
		const v = fromCanonicalStrength(abv).toFixed(decimals);
		if (!withLabel) return v;
		// '%' renders as "40.0%"; 'proof' renders as "80 proof"
		return strength.value === 'abv' ? `${v}%` : `${v} proof`;
	}

	// ─── Temperature ────────────────────────────────────────────────────────────

	/** Canonical (°F) → display unit. */
	function fromCanonicalTemperature(fahrenheit: number): number {
		if (!Number.isFinite(fahrenheit)) return 0;
		return fromFahrenheit(fahrenheit, temperature.value);
	}

	/** User-entered value in display unit → canonical (°F). */
	function toCanonicalTemperature(value: number, fromUnit?: string): number {
		if (!Number.isFinite(value)) return 0;
		return toFahrenheit(value, fromUnit || temperature.value);
	}

	function formatTemperature(fahrenheit: number | null | undefined, opts: { decimals?: number; withLabel?: boolean } = {}): string {
		const { decimals = 0, withLabel = true } = opts;
		if (fahrenheit == null || !Number.isFinite(fahrenheit)) return '—';
		const v = fromCanonicalTemperature(fahrenheit).toFixed(decimals);
		return withLabel ? `${v}${temperatureLabel.value}` : v;
	}

	// ─── Weight ─────────────────────────────────────────────────────────────────

	const POUND_TO_KG = 0.45359237;
	const POUND_TO_OUNCE = 16;
	const POUND_TO_GRAM = 453.59237;

	function fromCanonicalWeight(pounds: number): number {
		if (!Number.isFinite(pounds)) return 0;
		switch (weight.value) {
			case 'pound': return pounds;
			case 'kilogram': return pounds * POUND_TO_KG;
			case 'ounce': return pounds * POUND_TO_OUNCE;
			case 'gram': return pounds * POUND_TO_GRAM;
		}
	}

	function toCanonicalWeight(value: number, fromUnit?: string): number {
		if (!Number.isFinite(value)) return 0;
		const u = (fromUnit || weight.value) as SettingsWeightUnit;
		switch (u) {
			case 'pound': return value;
			case 'kilogram': return value / POUND_TO_KG;
			case 'ounce': return value / POUND_TO_OUNCE;
			case 'gram': return value / POUND_TO_GRAM;
			default: return value;
		}
	}

	function formatWeight(pounds: number | null | undefined, opts: { decimals?: number; withLabel?: boolean } = {}): string {
		const { decimals = 2, withLabel = true } = opts;
		if (pounds == null || !Number.isFinite(pounds)) return '—';
		const v = fromCanonicalWeight(pounds).toFixed(decimals);
		return withLabel ? `${v} ${weightLabel.value}` : v;
	}

	// ─── Cross-unit conversions (for forms with their own per-field units) ──────

	return {
		// Reactive prefs
		volume,
		strength,
		temperature,
		weight,
		// Display labels
		volumeLabel,
		strengthLabel,
		temperatureLabel,
		weightLabel,
		// Volume
		fromCanonicalVolume,
		toCanonicalVolume,
		formatVolume,
		// Strength
		fromCanonicalStrength,
		toCanonicalStrength,
		formatStrength,
		// Temperature
		fromCanonicalTemperature,
		toCanonicalTemperature,
		formatTemperature,
		// Weight
		fromCanonicalWeight,
		toCanonicalWeight,
		formatWeight,
		// Raw converters re-exported for advanced cases
		convertVolume,
		convertTemperature,
		convertStrength,
	};
}
