import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDisplayUnits } from '~/composables/useDisplayUnits';
import { useSettingsStore } from '~/stores/useSettingsStore';

/**
 * Tests the formatting + canonical-conversion contract of the unit composable.
 * Settings store is real Pinia (mocked $fetch is irrelevant since we set
 * `settings.value.units` directly).
 */

describe('useDisplayUnits', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	function setUnits(units: Partial<{ volume: string; strength: string; temperature: string; weight: string }>) {
		const store = useSettingsStore();
		store.settings.units = {
			volume: 'gallon',
			strength: 'abv',
			temperature: 'fahrenheit',
			weight: 'pound',
			...units,
		} as any;
	}

	describe('volume', () => {
		it('formats canonical gallons in default unit (gallon)', () => {
			const u = useDisplayUnits();
			expect(u.formatVolume(100)).toBe('100.00 gal');
		});

		it('converts canonical gallons to liters when set', () => {
			setUnits({ volume: 'liter' });
			const u = useDisplayUnits();
			expect(u.formatVolume(100, { decimals: 1 })).toBe('378.5 L');
		});

		it('toCanonicalVolume rounds-trip with fromCanonical', () => {
			setUnits({ volume: 'liter' });
			const u = useDisplayUnits();
			const display = u.fromCanonicalVolume(100);     // 100 gal → ~378.54 L
			const back = u.toCanonicalVolume(display);
			expect(back).toBeCloseTo(100, 4);
		});

		it('returns "—" for null/undefined', () => {
			const u = useDisplayUnits();
			expect(u.formatVolume(null)).toBe('—');
			expect(u.formatVolume(undefined)).toBe('—');
			expect(u.formatVolume(NaN)).toBe('—');
		});
	});

	describe('strength', () => {
		it('formats ABV as percent by default', () => {
			const u = useDisplayUnits();
			expect(u.formatStrength(40)).toBe('40.0%');
		});

		it('formats as proof when preference is proof', () => {
			setUnits({ strength: 'proof' });
			const u = useDisplayUnits();
			expect(u.formatStrength(40)).toBe('80.0 proof');
		});

		it('converts proof input to canonical ABV', () => {
			setUnits({ strength: 'proof' });
			const u = useDisplayUnits();
			expect(u.toCanonicalStrength(80)).toBe(40);
		});
	});

	describe('temperature', () => {
		it('formats canonical Fahrenheit by default', () => {
			const u = useDisplayUnits();
			expect(u.formatTemperature(72)).toBe('72°F');
		});

		it('converts canonical Fahrenheit to Celsius when set', () => {
			setUnits({ temperature: 'celsius' });
			const u = useDisplayUnits();
			expect(u.formatTemperature(212, { decimals: 0 })).toBe('100°C');
			expect(u.formatTemperature(32, { decimals: 0 })).toBe('0°C');
		});

		it('toCanonicalTemperature accepts Celsius input and returns Fahrenheit', () => {
			setUnits({ temperature: 'celsius' });
			const u = useDisplayUnits();
			expect(u.toCanonicalTemperature(0)).toBe(32);
			expect(u.toCanonicalTemperature(100)).toBe(212);
		});
	});

	describe('weight', () => {
		it('formats pounds by default', () => {
			const u = useDisplayUnits();
			expect(u.formatWeight(10)).toBe('10.00 lb');
		});

		it('converts to kilograms when set', () => {
			setUnits({ weight: 'kilogram' });
			const u = useDisplayUnits();
			expect(u.formatWeight(10, { decimals: 2 })).toBe('4.54 kg');
		});

		it('round-trips weight through canonical', () => {
			setUnits({ weight: 'gram' });
			const u = useDisplayUnits();
			const display = u.fromCanonicalWeight(2);   // 2 lb → ~907.18 g
			const back = u.toCanonicalWeight(display);
			expect(back).toBeCloseTo(2, 4);
		});
	});

	describe('reactivity', () => {
		it('label reacts when settings change', () => {
			const u = useDisplayUnits();
			expect(u.volumeLabel.value).toBe('gal');
			setUnits({ volume: 'liter' });
			expect(u.volumeLabel.value).toBe('L');
		});
	});

	describe('fallback when settings missing', () => {
		it('uses canonical defaults when units field absent', () => {
			const store = useSettingsStore();
			// Simulate older settings doc without units field
			(store.settings as any).units = undefined;
			const u = useDisplayUnits();
			expect(u.volumeLabel.value).toBe('gal');
			expect(u.strengthLabel.value).toBe('%');
			expect(u.temperatureLabel.value).toBe('°F');
			expect(u.weightLabel.value).toBe('lb');
		});
	});
});
