import type { ExtractType } from "../types/interfaces/Item";

/**
 * Reference table of common distilling/brewing grains, sugars, and extracts
 * with typical PPG (Points Per Pound Per Gallon) values.
 *
 * Sources: Palmer "How to Brew" Appendix B; Briess/Crisp/Weyermann maltster
 * spec sheets; ADI distilling references; ProMash & Beersmith ingredient
 * libraries. PPG values are typical mid-range estimates — actual values
 * vary by maltster and crop year.
 *
 * Used by:
 *  - components/Panel/PanelItem.vue   (auto-suggest on item name)
 *  - server/api/item/seed-grain-defaults.post.ts (one-time backfill)
 */

export interface GrainDefault {
  /** Regex matched against Item.name (case-insensitive). First match wins, so
   * order matters — put more specific patterns before broader ones. */
  match: RegExp;
  /** Display label (used in autosuggest tooltips). */
  label: string;
  ppg: number;
  extractType: ExtractType;
}

export const GRAIN_DEFAULTS: readonly GrainDefault[] = [
  // Specialty grains (most specific patterns first)
  { match: /chocolate\s*malt/i, label: "Chocolate Malt", ppg: 28, extractType: "specialty_grain" },
  { match: /roasted\s*barley/i, label: "Roasted Barley", ppg: 25, extractType: "specialty_grain" },
  { match: /black\s*patent/i, label: "Black Patent", ppg: 25, extractType: "specialty_grain" },
  { match: /\b(crystal|caramel)\b/i, label: "Crystal/Caramel Malt", ppg: 34, extractType: "specialty_grain" },

  // Flaked grains
  { match: /flaked\s*corn/i, label: "Flaked Corn", ppg: 39, extractType: "flaked_grain" },
  { match: /flaked\s*rye/i, label: "Flaked Rye", ppg: 36, extractType: "flaked_grain" },
  { match: /flaked\s*wheat/i, label: "Flaked Wheat", ppg: 36, extractType: "flaked_grain" },
  { match: /flaked\s*(oat|oats)/i, label: "Flaked Oats", ppg: 33, extractType: "flaked_grain" },

  // Raw / unmalted grains
  { match: /(yellow\s*dent|raw|cracked)\s*corn/i, label: "Raw / Yellow Dent Corn", ppg: 39, extractType: "raw_grain" },
  { match: /(raw|unmalted)\s*wheat/i, label: "Raw Wheat", ppg: 37, extractType: "raw_grain" },
  { match: /(raw|unmalted)\s*rye/i, label: "Raw Rye", ppg: 29, extractType: "raw_grain" },
  { match: /(raw|unmalted)\s*barley/i, label: "Raw Barley", ppg: 28, extractType: "raw_grain" },

  // Malted grains
  { match: /pilsner/i, label: "Pilsner Malt", ppg: 37, extractType: "malted_grain" },
  { match: /munich/i, label: "Munich Malt", ppg: 35, extractType: "malted_grain" },
  { match: /vienna/i, label: "Vienna Malt", ppg: 35, extractType: "malted_grain" },
  { match: /wheat\s*malt/i, label: "Wheat Malt", ppg: 37, extractType: "malted_grain" },
  { match: /rye\s*malt/i, label: "Rye Malt", ppg: 29, extractType: "malted_grain" },
  { match: /2[\s-]*row|two[\s-]*row/i, label: "2-Row Pale Malt", ppg: 37, extractType: "malted_grain" },
  { match: /6[\s-]*row|six[\s-]*row/i, label: "6-Row Pale Malt", ppg: 35, extractType: "malted_grain" },

  // Sugars
  { match: /\b(white|cane|table|granulated)\s*sugar\b/i, label: "Cane / White Sugar", ppg: 46, extractType: "sugar" },
  { match: /brown\s*sugar/i, label: "Brown Sugar", ppg: 45, extractType: "sugar" },
  { match: /molasses/i, label: "Molasses", ppg: 36, extractType: "sugar" },
  { match: /honey/i, label: "Honey", ppg: 35, extractType: "sugar" },

  // Extracts
  { match: /\b(dme|dry\s*malt\s*extract)\b/i, label: "Dry Malt Extract (DME)", ppg: 44, extractType: "extract_dry" },
  { match: /\b(lme|liquid\s*malt\s*extract)\b/i, label: "Liquid Malt Extract (LME)", ppg: 36, extractType: "extract_liquid" },
];

/**
 * Find the first grain default that matches the given item name.
 * Returns null if no pattern matches.
 */
export function findGrainDefault(name: string): GrainDefault | null {
  if (!name) return null;
  return GRAIN_DEFAULTS.find((g) => g.match.test(name)) ?? null;
}
