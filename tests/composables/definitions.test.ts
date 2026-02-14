import { describe, it, expect } from 'vitest';
import { estimateCocktailPrice, liquorClasses } from '~/composables/definitions';

describe('estimateCocktailPrice', () => {
  it('calculates price from cost', () => {
    // Formula: ((cost - 1.5) / 2.5) * 4 + 7
    expect(estimateCocktailPrice(5)).toBeCloseTo(12.6, 1);
  });

  it('returns 7 when cost equals 1.5 (break-even)', () => {
    expect(estimateCocktailPrice(1.5)).toBe(7);
  });

  it('handles zero cost', () => {
    // ((0 - 1.5) / 2.5) * 4 + 7 = (-0.6) * 4 + 7 = 4.6
    expect(estimateCocktailPrice(0)).toBeCloseTo(4.6, 1);
  });

  it('handles high cost', () => {
    // ((10 - 1.5) / 2.5) * 4 + 7 = 3.4 * 4 + 7 = 20.6
    expect(estimateCocktailPrice(10)).toBeCloseTo(20.6, 1);
  });

  it('handles negative cost (unlikely but should not crash)', () => {
    const result = estimateCocktailPrice(-1);
    expect(typeof result).toBe('number');
    expect(isFinite(result)).toBe(true);
  });
});

describe('liquorClasses', () => {
  it('is an array of classes', () => {
    expect(Array.isArray(liquorClasses)).toBe(true);
    expect(liquorClasses.length).toBeGreaterThan(0);
  });

  it('each class has class, definition, and types', () => {
    for (const cls of liquorClasses) {
      expect(cls).toHaveProperty('class');
      expect(cls).toHaveProperty('definition');
      expect(cls).toHaveProperty('types');
      expect(Array.isArray(cls.types)).toBe(true);
    }
  });

  it('contains expected classes', () => {
    const classNames = liquorClasses.map(c => c.class);
    expect(classNames).toContain('Whisky');
    expect(classNames).toContain('Gin');
    expect(classNames).toContain('Rum');
    expect(classNames).toContain('Brandy');
  });

  it('whisky has bourbon type', () => {
    const whisky = liquorClasses.find(c => c.class === 'Whisky');
    const typeNames = whisky?.types.map(t => t.type);
    expect(typeNames).toContain('Bourbon Whisky');
    expect(typeNames).toContain('Rye Whisky');
  });
});
