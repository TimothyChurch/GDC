import { describe, it, expect } from 'vitest';
import { convertUnitRatio, metricWeightToVolume, imperialWeightToVolume, proofing, stepProofing, proofingDown } from '~/utils/conversions';

describe('convertUnitRatio', () => {
  describe('same unit', () => {
    it('returns 1 for same unit', () => {
      expect(convertUnitRatio('gal', 'gal')).toBe(1);
      expect(convertUnitRatio('lb', 'lb')).toBe(1);
      expect(convertUnitRatio('mL', 'mL')).toBe(1);
    });
  });

  describe('empty/undefined inputs', () => {
    it('returns 1 for empty strings', () => {
      expect(convertUnitRatio('', '')).toBe(1);
      expect(convertUnitRatio('', 'gal')).toBe(1);
      expect(convertUnitRatio('gal', '')).toBe(1);
    });
  });

  describe('unknown units', () => {
    it('returns 1 as safe fallback for unknown fromUnit', () => {
      expect(convertUnitRatio('unknown', 'gal')).toBe(1);
    });

    it('returns 1 as safe fallback for unknown toUnit', () => {
      expect(convertUnitRatio('gal', 'unknown')).toBe(1);
    });

    it('returns 1 for both units unknown', () => {
      expect(convertUnitRatio('foo', 'bar')).toBe(1);
    });
  });

  describe('volume conversions', () => {
    it('converts fl oz to mL', () => {
      expect(convertUnitRatio('fl oz', 'mL')).toBeCloseTo(29.5735, 3);
    });

    it('converts gal to mL', () => {
      expect(convertUnitRatio('gal', 'mL')).toBeCloseTo(3785.41, 1);
    });

    it('converts L to gallon', () => {
      expect(convertUnitRatio('L', 'gallon')).toBeCloseTo(0.264172, 4);
    });

    it('converts mL to L', () => {
      expect(convertUnitRatio('mL', 'L')).toBeCloseTo(0.001, 5);
    });

    it('converts L to mL', () => {
      expect(convertUnitRatio('L', 'mL')).toBe(1000);
    });

    it('converts cup to fl oz', () => {
      expect(convertUnitRatio('cup', 'fl oz')).toBe(8);
    });

    it('converts gallon to fl oz', () => {
      expect(convertUnitRatio('gallon', 'fl oz')).toBe(128);
    });
  });

  describe('weight conversions', () => {
    it('converts lb to oz', () => {
      expect(convertUnitRatio('lb', 'oz')).toBe(16);
    });

    it('converts kg to lb', () => {
      expect(convertUnitRatio('kg', 'lb')).toBeCloseTo(2.20462, 4);
    });

    it('converts g to kg', () => {
      expect(convertUnitRatio('g', 'kg')).toBe(0.001);
    });

    it('converts kg to g', () => {
      expect(convertUnitRatio('kg', 'g')).toBe(1000);
    });

    it('converts oz to g', () => {
      expect(convertUnitRatio('oz', 'g')).toBeCloseTo(28.3495, 3);
    });
  });

  describe('count conversions', () => {
    it('converts bottle to each', () => {
      expect(convertUnitRatio('bottle', 'each')).toBe(1);
    });

    it('converts each to count', () => {
      expect(convertUnitRatio('each', 'count')).toBe(1);
    });

    it('converts count to bottle', () => {
      expect(convertUnitRatio('count', 'bottle')).toBe(1);
    });
  });
});

describe('metricWeightToVolume', () => {
  it('converts pure water (0% ABV)', () => {
    // 1000g water = 1000mL at density 1
    expect(metricWeightToVolume(1000, 0)).toBeCloseTo(1000, 0);
  });

  it('converts pure alcohol (100% ABV)', () => {
    // 789.47g alcohol = ~1000mL at density 0.78947
    expect(metricWeightToVolume(789.47, 100)).toBeCloseTo(1000, 0);
  });

  it('handles ABV as percentage (>1)', () => {
    const vol = metricWeightToVolume(1000, 40);
    // density at 40% = 0.78947*0.4 + 1*0.6 = 0.91579
    expect(vol).toBeCloseTo(1000 / 0.91579, 0);
  });

  it('handles ABV as decimal (<1)', () => {
    const vol = metricWeightToVolume(1000, 0.4);
    // density at 40% = 0.78947*0.4 + 1*0.6 = 0.91579
    expect(vol).toBeCloseTo(1000 / 0.91579, 0);
  });
});

describe('imperialWeightToVolume', () => {
  it('converts pure water (0% ABV)', () => {
    // 8.33 lbs water = 1 gallon
    expect(imperialWeightToVolume(8.33, 0)).toBeCloseTo(1, 1);
  });

  it('handles 40% ABV', () => {
    const density = 6.5 * 0.4 + 8.33 * 0.6; // 7.598
    expect(imperialWeightToVolume(10, 40)).toBeCloseTo(10 / density, 2);
  });
});

describe('proofing', () => {
  it('calculates final volume for dilution', () => {
    // 10 gal at 80% diluted to 40%
    expect(proofing(10, 80, 40)).toBe(20);
  });

  it('handles ABV as percentages (>1)', () => {
    expect(proofing(10, 80, 40)).toBe(20);
  });

  it('handles ABV as decimals (<1)', () => {
    expect(proofing(10, 0.8, 0.4)).toBe(20);
  });

  it('returns same volume when ABVs are equal', () => {
    expect(proofing(10, 40, 40)).toBe(10);
  });
});

describe('proofingDown', () => {
  it('calculates spirit needed to reduce ABV', () => {
    // Adding lower-proof spirit to reduce ABV
    const result = proofingDown(10, 80, 60, 40);
    // (80*10 - 10*60) / (60 - 40) = 200/20 = 10
    expect(result).toBe(10);
  });
});
