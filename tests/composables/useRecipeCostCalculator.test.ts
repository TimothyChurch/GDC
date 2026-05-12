import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, computed } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useRecipeCostCalculator } from '~/composables/useRecipeCostCalculator';
import { useItemStore } from '~/stores/useItemStore';
import { useBulkSpiritStore } from '~/stores/useBulkSpiritStore';

/**
 * Tests cover the orchestration shape: row construction, store fallbacks for
 * missing items, and total summation. Underlying cost math (latestPrice,
 * ingredientCost, bulkSpiritIngredientCost) is exercised by their own utility
 * tests.
 */

describe('useRecipeCostCalculator', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	describe('ingredients rows', () => {
		it('returns empty array when no ingredients provided', () => {
			const { ingredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: ref(undefined),
			});
			expect(ingredients.value).toEqual([]);
		});

		it('returns empty array for an empty ingredients list', () => {
			const { ingredients } = useRecipeCostCalculator({
				ingredients: ref([]),
				bulkSpirits: ref(undefined),
			});
			expect(ingredients.value).toEqual([]);
		});

		it('falls back to "Unknown" name when item is not in the store', () => {
			const { ingredients } = useRecipeCostCalculator({
				ingredients: ref([
					{ _id: 'missingItemId', amount: 5, unit: 'lb' },
				]),
				bulkSpirits: ref(undefined),
			});
			expect(ingredients.value).toHaveLength(1);
			expect(ingredients.value[0]).toMatchObject({
				id: 'missingItemId',
				name: 'Unknown',
				amount: 5,
				unit: 'lb',
			});
			// pricePerUnit and cost default to 0 when no PO history exists
			expect(ingredients.value[0]!.cost).toBe(0);
		});

		it('preserves the ingredient amount and unit verbatim on the row', () => {
			const { ingredients } = useRecipeCostCalculator({
				ingredients: ref([
					{ _id: 'a', amount: 12.5, unit: 'gallon' },
					{ _id: 'b', amount: 3, unit: 'lb' },
				]),
				bulkSpirits: ref(undefined),
			});
			expect(ingredients.value).toHaveLength(2);
			expect(ingredients.value[0]!.amount).toBe(12.5);
			expect(ingredients.value[0]!.unit).toBe('gallon');
			expect(ingredients.value[1]!.amount).toBe(3);
			expect(ingredients.value[1]!.unit).toBe('lb');
		});
	});

	describe('bulkSpiritIngredients rows', () => {
		it('returns empty array when no bulk spirits provided', () => {
			const { bulkSpiritIngredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: ref(undefined),
			});
			expect(bulkSpiritIngredients.value).toEqual([]);
		});

		it('falls back to "Unknown Spirit" when bulk spirit is missing', () => {
			const { bulkSpiritIngredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: ref([
					{ bulkSpirit: 'missingId', volume: 5, volumeUnit: 'gallon' },
				]),
			});
			expect(bulkSpiritIngredients.value).toHaveLength(1);
			expect(bulkSpiritIngredients.value[0]).toMatchObject({
				name: 'Unknown Spirit',
				volume: 5,
				volumeUnit: 'gallon',
				abv: 0,
				costPerPG: 0,
				cost: 0,
			});
		});

		it('zero cost when costPerProofGallon is zero (free internal spirit)', () => {
			const bsStore = useBulkSpiritStore();
			bsStore.bulkSpirits.push({
				_id: 's1', name: 'House Whiskey', abv: 50, costPerProofGallon: 0,
			} as any);

			const { bulkSpiritIngredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: ref([
					{ bulkSpirit: 's1', volume: 5, volumeUnit: 'gallon' },
				]),
			});
			expect(bulkSpiritIngredients.value[0]!.cost).toBe(0);
			expect(bulkSpiritIngredients.value[0]!.name).toBe('House Whiskey');
			expect(bulkSpiritIngredients.value[0]!.abv).toBe(50);
		});

		it('computes cost from the underlying bulkSpiritIngredientCost helper', () => {
			const bsStore = useBulkSpiritStore();
			bsStore.bulkSpirits.push({
				_id: 's1', name: 'Aged Rye', abv: 50, costPerProofGallon: 10,
			} as any);

			const { bulkSpiritIngredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: ref([
					{ bulkSpirit: 's1', volume: 5, volumeUnit: 'gallon' },
				]),
			});
			// 5 gal × 50% ABV → PG = 5 × 50 / 50 = 5
			// 5 PG × $10/PG = $50
			expect(bulkSpiritIngredients.value[0]!.cost).toBeCloseTo(50, 4);
		});
	});

	describe('totals', () => {
		it('totalIngredientsCost sums ingredient row costs', () => {
			const { totalIngredientsCost } = useRecipeCostCalculator({
				ingredients: ref([
					{ _id: 'missingA', amount: 1, unit: 'lb' },
					{ _id: 'missingB', amount: 2, unit: 'lb' },
				]),
				bulkSpirits: ref(undefined),
			});
			// Both items missing → both cost 0 → total 0
			expect(totalIngredientsCost.value).toBe(0);
		});

		it('totalCost is the sum of ingredients + bulk spirit costs', () => {
			const bsStore = useBulkSpiritStore();
			bsStore.bulkSpirits.push({
				_id: 's1', name: 'Test', abv: 50, costPerProofGallon: 10,
			} as any);

			const { totalCost, totalBulkSpiritsCost, totalIngredientsCost } =
				useRecipeCostCalculator({
					ingredients: ref([{ _id: 'missing', amount: 1, unit: 'lb' }]),
					bulkSpirits: ref([
						{ bulkSpirit: 's1', volume: 5, volumeUnit: 'gallon' },
					]),
				});

			// ingredients: 0, spirits: 50 → total: 50
			expect(totalIngredientsCost.value).toBe(0);
			expect(totalBulkSpiritsCost.value).toBeCloseTo(50, 4);
			expect(totalCost.value).toBeCloseTo(50, 4);
		});

		it('totalCost is zero when both inputs are empty', () => {
			const { totalCost } = useRecipeCostCalculator({
				ingredients: ref([]),
				bulkSpirits: ref([]),
			});
			expect(totalCost.value).toBe(0);
		});
	});

	describe('reactivity', () => {
		it('rows recompute when the source ingredients change', () => {
			const ingSource = ref<{ _id: string; amount: number; unit: string }[]>([]);
			const { ingredients } = useRecipeCostCalculator({
				ingredients: ingSource,
				bulkSpirits: ref(undefined),
			});

			expect(ingredients.value).toHaveLength(0);

			ingSource.value = [{ _id: 'newId', amount: 1, unit: 'lb' }];
			expect(ingredients.value).toHaveLength(1);
			expect(ingredients.value[0]!.id).toBe('newId');
		});

		it('rows recompute when source bulk spirits change', () => {
			const bsSource = ref<{ bulkSpirit: string; volume: number; volumeUnit: string }[]>([]);
			const { bulkSpiritIngredients } = useRecipeCostCalculator({
				ingredients: ref(undefined),
				bulkSpirits: bsSource,
			});

			expect(bulkSpiritIngredients.value).toHaveLength(0);

			bsSource.value = [{ bulkSpirit: 'bsId', volume: 1, volumeUnit: 'gallon' }];
			expect(bulkSpiritIngredients.value).toHaveLength(1);
		});
	});
});
