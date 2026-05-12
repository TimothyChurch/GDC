import { describe, it, expect } from 'vitest';
import {
	computeProductionInventoryDeltas,
	type ProductionInventoryShape,
} from '~/utils/productionInventory';

const BOTTLE_A = 'bottleA';
const BOTTLE_B = 'bottleB';
const GLASS_A = 'glassA';
const GLASS_B = 'glassB';
const CAP = 'cap';
const LABEL = 'label';

const make = (overrides: Partial<ProductionInventoryShape>): ProductionInventoryShape => ({
	quantity: 0,
	...overrides,
});

describe('computeProductionInventoryDeltas — quantity changes (no item changes)', () => {
	it('produces no deltas when nothing changed', () => {
		const same = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		expect(computeProductionInventoryDeltas(same, same)).toEqual([]);
	});

	it('applies a positive net delta to the bottle when quantity increased', () => {
		const old = make({ quantity: 100, bottle: BOTTLE_A });
		const next = make({ quantity: 120, bottle: BOTTLE_A });
		expect(computeProductionInventoryDeltas(old, next)).toEqual([
			{ itemId: BOTTLE_A, kind: 'bottle', delta: 20 },
		]);
	});

	it('applies a negative net delta to the bottle when quantity decreased', () => {
		const old = make({ quantity: 100, bottle: BOTTLE_A });
		const next = make({ quantity: 80, bottle: BOTTLE_A });
		expect(computeProductionInventoryDeltas(old, next)).toEqual([
			{ itemId: BOTTLE_A, kind: 'bottle', delta: -20 },
		]);
	});

	it('mirrors the bottle delta on each unchanged material', () => {
		// bottle gained +20, so each material consumed 20 more (delta -20 = oldQty - newQty)
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		const next = make({
			quantity: 120,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		expect(computeProductionInventoryDeltas(old, next)).toEqual([
			{ itemId: BOTTLE_A, kind: 'bottle', delta: 20 },
			{ itemId: GLASS_A, kind: 'material', delta: -20 },
			{ itemId: CAP, kind: 'material', delta: -20 },
			{ itemId: LABEL, kind: 'material', delta: -20 },
		]);
	});

	it('drops zero-delta entries when only some fields differ', () => {
		// Same quantity → no inventory changes anywhere
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		expect(computeProductionInventoryDeltas(old, next)).toEqual([]);
	});
});

describe('computeProductionInventoryDeltas — bottle changed', () => {
	it('reverses the old bottle and applies the new bottle', () => {
		const old = make({ quantity: 100, bottle: BOTTLE_A });
		const next = make({ quantity: 80, bottle: BOTTLE_B });
		const deltas = computeProductionInventoryDeltas(old, next);
		expect(deltas).toContainEqual({ itemId: BOTTLE_A, kind: 'bottle', delta: -100 });
		expect(deltas).toContainEqual({ itemId: BOTTLE_B, kind: 'bottle', delta: 80 });
	});

	it('also re-applies materials in full when bottle changed (materials unchanged)', () => {
		// Bottle changed but materials are the same. Old materials consumed 100, new consume 80.
		// Net for each material: oldQty - newQty = 100 - 80 = 20 returned to stock.
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP },
		});
		const next = make({
			quantity: 80,
			bottle: BOTTLE_B,
			bottling: { glassware: GLASS_A, cap: CAP },
		});
		const deltas = computeProductionInventoryDeltas(old, next);
		expect(deltas).toContainEqual({ itemId: GLASS_A, kind: 'material', delta: 20 });
		expect(deltas).toContainEqual({ itemId: CAP, kind: 'material', delta: 20 });
	});
});

describe('computeProductionInventoryDeltas — material changed', () => {
	it('reverses the old material (returns to stock) and applies the new material (deducts)', () => {
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A },
		});
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_B },
		});
		const deltas = computeProductionInventoryDeltas(old, next);
		expect(deltas).toContainEqual({ itemId: GLASS_A, kind: 'material', delta: 100 });
		expect(deltas).toContainEqual({ itemId: GLASS_B, kind: 'material', delta: -100 });
	});

	it('handles partial material changes — only changed material gets swap deltas', () => {
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_B, cap: CAP, label: LABEL },
		});
		const deltas = computeProductionInventoryDeltas(old, next);
		// glassware swapped
		expect(deltas).toContainEqual({ itemId: GLASS_A, kind: 'material', delta: 100 });
		expect(deltas).toContainEqual({ itemId: GLASS_B, kind: 'material', delta: -100 });
		// cap and label unchanged with same qty → no deltas
		expect(deltas.find((d) => d.itemId === CAP)).toBeUndefined();
		expect(deltas.find((d) => d.itemId === LABEL)).toBeUndefined();
	});
});

describe('computeProductionInventoryDeltas — missing fields', () => {
	it('treats missing bottling materials as removal when quantity > 0', () => {
		const old = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP },
		});
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: {}, // both materials removed
		});
		const deltas = computeProductionInventoryDeltas(old, next);
		// old materials are returned (+100 each)
		expect(deltas).toContainEqual({ itemId: GLASS_A, kind: 'material', delta: 100 });
		expect(deltas).toContainEqual({ itemId: CAP, kind: 'material', delta: 100 });
	});

	it('treats added materials as deduction (was empty, now present)', () => {
		const old = make({ quantity: 100, bottle: BOTTLE_A, bottling: {} });
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { cap: CAP },
		});
		expect(computeProductionInventoryDeltas(old, next)).toContainEqual({
			itemId: CAP,
			kind: 'material',
			delta: -100,
		});
	});

	it('handles missing bottling object entirely', () => {
		const old = make({ quantity: 100, bottle: BOTTLE_A });
		const next = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { cap: CAP },
		});
		expect(computeProductionInventoryDeltas(old, next)).toEqual([
			{ itemId: CAP, kind: 'material', delta: -100 },
		]);
	});
});

describe('computeProductionInventoryDeltas — round-trip safety', () => {
	it('applying then reverting produces zero net effect', () => {
		const empty = make({ quantity: 0 });
		const filled = make({
			quantity: 100,
			bottle: BOTTLE_A,
			bottling: { glassware: GLASS_A, cap: CAP, label: LABEL },
		});

		const forward = computeProductionInventoryDeltas(empty, filled);
		const backward = computeProductionInventoryDeltas(filled, empty);

		// Sum of forward + backward deltas per item should be zero
		const sums = new Map<string, number>();
		for (const d of [...forward, ...backward]) {
			sums.set(d.itemId, (sums.get(d.itemId) || 0) + d.delta);
		}
		for (const total of sums.values()) {
			expect(total).toBe(0);
		}
	});
});
