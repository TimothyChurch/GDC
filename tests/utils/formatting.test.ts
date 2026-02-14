import { describe, it, expect } from 'vitest';
import { Dollar } from '~/utils/formatting';

describe('Dollar formatter', () => {
  it('formats whole numbers', () => {
    expect(Dollar.format(10)).toBe('$10.00');
  });

  it('formats decimal values', () => {
    expect(Dollar.format(12.5)).toBe('$12.50');
  });

  it('formats zero', () => {
    expect(Dollar.format(0)).toBe('$0.00');
  });

  it('formats large numbers with commas', () => {
    expect(Dollar.format(1234567.89)).toBe('$1,234,567.89');
  });

  it('formats negative numbers', () => {
    expect(Dollar.format(-5.99)).toBe('-$5.99');
  });

  it('rounds to 2 decimal places', () => {
    expect(Dollar.format(1.999)).toBe('$2.00');
    expect(Dollar.format(1.001)).toBe('$1.00');
  });

  it('handles very small numbers', () => {
    expect(Dollar.format(0.01)).toBe('$0.01');
  });

  it('handles NaN gracefully', () => {
    expect(Dollar.format(NaN)).toBe('$NaN');
  });
});
