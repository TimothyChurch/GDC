import { convertUnitRatio } from './conversions'
import { toGallons } from './proofGallons'

// Re-export so callers projecting bulk-spirit volumes don't need a second import.
export { toGallons }

/**
 * Categorizes how an Item contributes fermentables.
 * Determines the efficiency multiplier applied to its PPG.
 */
export type ExtractType =
  | 'malted_grain'
  | 'raw_grain'
  | 'flaked_grain'
  | 'specialty_grain'
  | 'sugar'
  | 'extract_dry'
  | 'extract_liquid'
  | 'adjunct'

export const EXTRACT_TYPES: readonly ExtractType[] = [
  'malted_grain',
  'raw_grain',
  'flaked_grain',
  'specialty_grain',
  'sugar',
  'extract_dry',
  'extract_liquid',
  'adjunct',
] as const

export const EXTRACT_TYPE_LABELS: Record<ExtractType, string> = {
  malted_grain: 'Malted Grain',
  raw_grain: 'Raw Grain',
  flaked_grain: 'Flaked Grain',
  specialty_grain: 'Specialty/Roasted Grain',
  sugar: 'Sugar / Molasses / Honey',
  extract_dry: 'Dry Malt Extract (DME)',
  extract_liquid: 'Liquid Malt Extract (LME)',
  adjunct: 'Adjunct (non-fermentable)',
}

/**
 * Default per-pound water-equivalent displacement for each extract type when
 * fully wetted in the mash. Used as a fallback when an Item has no explicit
 * `displacement` set. Values in **gallons per pound**.
 *
 *   malted_grain / raw_grain / specialty_grain → 0.10 gal/lb (typical)
 *   flaked_grain                                 → 0.08 gal/lb (pre-cooked, less absorption)
 *   sugar / extract_dry / extract_liquid         → 0       (dissolves into solution)
 *   adjunct                                      → 0       (small additions, negligible)
 *
 * These are *suggestions*; users override per-Item. Sources: Palmer "How to
 * Brew" §16 (mash water absorption ~0.1 gal/lb) plus distillery convention.
 */
export const DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE: Record<ExtractType, number> = {
  malted_grain: 0.10,
  raw_grain: 0.10,
  flaked_grain: 0.08,
  specialty_grain: 0.10,
  sugar: 0,
  extract_dry: 0,
  extract_liquid: 0,
  adjunct: 0,
}

/** Resolve the displacement for an item — explicit value wins, then
 * default-by-extractType, else 0. */
export function getItemDisplacement(item: {
  displacement?: number
  extractType?: ExtractType
}): number {
  if (typeof item.displacement === 'number' && item.displacement >= 0) {
    return item.displacement
  }
  if (item.extractType) {
    return DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE[item.extractType] ?? 0
  }
  return 0
}

/**
 * Default `grainIn` flag for a recipe based on its TTB-style class label.
 * Used to prefill the toggle when the user creates or changes a recipe's
 * class. Returns null when the class is unknown (caller decides default).
 *
 *   bourbon / whiskey / whisky / rye / moonshine / white dog → true
 *   vodka / gin / liqueur / cordial                          → false
 *   rum (assumed molasses-based, lautered)                   → false
 *   anything else                                            → false
 */
export function getDefaultGrainInForClass(klass: string | undefined): boolean {
  if (!klass) return false
  const k = klass.toLowerCase()
  if (
    k.includes('whisky') ||
    k.includes('whiskey') ||
    k.includes('bourbon') ||
    k.includes('rye') ||
    k.includes('moonshine') ||
    k.includes('white dog')
  ) {
    return true
  }
  return false
}

const WEIGHT_UNITS = new Set(['lb', 'oz', 'g', 'kg'])

/**
 * Convert a weight to pounds using the project's standard conversion table.
 * Returns 0 for non-weight units (e.g. 'each', 'gallon') so that liquid
 * ingredients silently skip the grain-bill calculation.
 */
export function toPounds(amount: number, unit: string): number {
  if (!amount || !unit) return 0
  if (unit === 'lb') return amount
  if (!WEIGHT_UNITS.has(unit)) return 0
  return amount * convertUnitRatio(unit, 'lb')
}

/**
 * Effective extraction multiplier for an extract type.
 *
 * - Mashable grains (malted, raw, flaked, specialty) → mash efficiency
 * - Sugars and dry malt extract → 100% (no mash loss)
 * - Liquid malt extract → ~95% (slight extraction loss vs DME)
 * - Adjuncts (enzymes, hops, salts) → 0 (no fermentables)
 */
export function getExtractEfficiency(
  extractType: ExtractType,
  mashEfficiencyPct: number,
): number {
  switch (extractType) {
    case 'malted_grain':
    case 'raw_grain':
    case 'flaked_grain':
    case 'specialty_grain':
      return Math.max(0, mashEfficiencyPct) / 100
    case 'sugar':
    case 'extract_dry':
      return 1
    case 'extract_liquid':
      return 0.95
    case 'adjunct':
    default:
      return 0
  }
}

export interface FermentableInput {
  weightLb: number
  ppg: number
  extractType: ExtractType
}

export interface GravityProjection {
  og: number
  totalPoints: number
  fermentableLb: number
}

/**
 * Project a wash's original gravity from a fermentable bill.
 *
 * OG = 1 + (Σ lb × PPG × type_efficiency) / wash_gal / 1000
 *
 * @param fermentables  array of normalized fermentable inputs
 * @param washGal       wash volume in US gallons
 * @param mashEfficiencyPct  whole-number percentage (e.g. 75)
 */
export function projectGravity(
  fermentables: FermentableInput[],
  washGal: number,
  mashEfficiencyPct: number,
): GravityProjection {
  if (!washGal || washGal <= 0 || !fermentables.length) {
    return { og: 1, totalPoints: 0, fermentableLb: 0 }
  }
  let totalPoints = 0
  let fermentableLb = 0
  for (const f of fermentables) {
    if (!f.weightLb || f.weightLb <= 0) continue
    if (!f.ppg || f.ppg <= 0) continue
    const eff = getExtractEfficiency(f.extractType, mashEfficiencyPct)
    if (eff <= 0) continue
    totalPoints += f.weightLb * f.ppg * eff
    fermentableLb += f.weightLb
  }
  const og = 1 + totalPoints / washGal / 1000
  return {
    og: +og.toFixed(4),
    totalPoints: +totalPoints.toFixed(2),
    fermentableLb: +fermentableLb.toFixed(2),
  }
}

/** Project final gravity from OG and yeast attenuation. */
export function projectFG(og: number, attenuationPct: number): number {
  if (og <= 1) return og
  const clampedAtten = Math.max(0, Math.min(100, attenuationPct))
  const fg = og - (og - 1) * (clampedAtten / 100)
  return +fg.toFixed(4)
}

/** Project wash ABV from OG and FG. ABV ≈ (OG − FG) × 131.25 */
export function projectWashAbv(og: number, fg: number): number {
  if (og <= fg) return 0
  return +((og - fg) * 131.25).toFixed(2)
}

/**
 * Project distilled output proof gallons from a wash.
 *
 * input_PG  = wash_gal × ABV% × 2 / 100
 * output_PG = input_PG × distillation_yield%
 *
 * Pot stills typically yield 70–85%; reflux/column 85–92%.
 */
export function projectDistillationPG(
  washGal: number,
  washAbvPct: number,
  yieldPct: number,
): number {
  if (!washGal || !washAbvPct) return 0
  const inputPG = (washGal * washAbvPct * 2) / 100
  const outputPG = inputPG * (Math.max(0, yieldPct) / 100)
  return +outputPG.toFixed(2)
}

/**
 * A bulk-spirit input row, already converted to canonical units (gallons + %).
 * Used by gin / redistillation / liqueur recipes that take pre-distilled
 * neutral spirit as their charge instead of a fermented wash.
 */
export interface BulkSpiritInput {
  volumeGal: number
  abv: number
}

export interface BulkSpiritProjection {
  totalVolGal: number
  weightedAvgAbv: number
  inputPG: number
}

/**
 * Aggregate bulk-spirit charges into a single volume / ABV / proof-gallon
 * triple. Volume-weighted ABV average. Returns zeros for an empty list.
 */
export function projectBulkSpiritInput(
  spirits: BulkSpiritInput[],
): BulkSpiritProjection {
  if (!spirits?.length) {
    return { totalVolGal: 0, weightedAvgAbv: 0, inputPG: 0 }
  }
  let totalVol = 0
  let totalPG = 0
  for (const s of spirits) {
    if (!s.volumeGal || s.volumeGal <= 0 || !s.abv || s.abv <= 0) continue
    totalVol += s.volumeGal
    totalPG += (s.volumeGal * s.abv * 2) / 100
  }
  const weightedAvgAbv = totalVol > 0 ? (totalPG * 50) / totalVol : 0
  return {
    totalVolGal: +totalVol.toFixed(2),
    weightedAvgAbv: +weightedAvgAbv.toFixed(2),
    inputPG: +totalPG.toFixed(2),
  }
}

export interface ProjectAllInput {
  fermentables: FermentableInput[]
  bulkSpirits?: BulkSpiritInput[]
  washVolume: number
  washVolumeUnit: string
  mashEfficiencyPct: number
  attenuationPct: number
  distillationYieldPct: number
  /** When true, grain displacement is subtracted from the wash volume to
   * derive the *effective liquid* volume used for OG / wash PG. Default false
   * (preserves existing behavior for grain-out recipes). */
  grainIn?: boolean
  /** Total volume (gal) of liquid displaced by grain when fully wetted.
   * Required when `grainIn === true`. Compute via `calcGrainDisplacement`. */
  grainDisplacementGal?: number
}

export interface ProjectAllOutput {
  // Grain-bill / fermentation projection
  og: number
  fg: number
  washAbv: number
  washVolGal: number
  fermentableLb: number
  totalPoints: number
  washInputPG: number
  // Bulk-spirit projection
  bulkSpiritVolGal: number
  bulkSpiritAbv: number
  bulkSpiritPG: number
  // Combined output
  projectedPG: number
  // Grain-in correction (zero / no-op when grainIn=false)
  grainDisplacementGal: number
  effectiveWashVolGal: number
}

/**
 * Total volume (gal) displaced by the fermentable grain in a recipe.
 *
 * Iterates fermentable items only, converts each to lb, then multiplies by
 * the item's displacement (or default-by-extractType when unset).
 */
export function calcGrainDisplacement(
  recipeItems: Array<{ _id: string; amount: number; unit: string }>,
  itemsLookup: Map<
    string,
    { displacement?: number; extractType?: ExtractType; fermentable?: boolean }
  >,
): number {
  let totalGal = 0
  for (const ri of recipeItems) {
    if (!ri?._id) continue
    const item = itemsLookup.get(String(ri._id))
    if (!item || !item.fermentable) continue
    const weightLb = toPounds(ri.amount, ri.unit)
    if (weightLb <= 0) continue
    const dispPerLb = getItemDisplacement(item)
    if (dispPerLb <= 0) continue
    totalGal += weightLb * dispPerLb
  }
  return +totalGal.toFixed(3)
}

/**
 * Subtract grain displacement from a reported bulk volume to get the
 * effective *liquid* volume used for PG calculations.
 *
 * For grain-in batches, the operator-reported wash/charge volume includes
 * suspended grain. Multiplying that bulk volume by ABV overstates proof
 * gallons. This helper does the correction; for grain-out batches it's a
 * no-op (returns reportedVolGal unchanged).
 *
 * Clamped to 0 — if a user enters a tiny volume with a huge grain bill, we
 * prefer "0 PG" over a negative number.
 */
export function getEffectiveLiquidVolume(
  reportedVolGal: number,
  grainDisplacementGal: number,
  grainIn: boolean,
): number {
  if (!grainIn) return reportedVolGal
  return Math.max(0, reportedVolGal - (grainDisplacementGal || 0))
}

/**
 * End-to-end projection. Combines the grain-bill path (mash → ferment →
 * wash PG) with the bulk-spirit path (already-distilled charge) to produce
 * a single projected output PG.
 *
 *   total_input_PG  = wash_PG + bulk_spirit_PG
 *   projected_PG    = total_input_PG × distillation_yield
 *
 * Either path may be empty — gin/redistillation recipes have only bulk
 * spirits; whiskey/vodka recipes have only fermentables.
 */
export function projectAll(input: ProjectAllInput): ProjectAllOutput {
  const washVolGal = toGallons(input.washVolume, input.washVolumeUnit)

  // Grain-in correction: subtract grain displacement from the wash volume
  // to get the effective liquid volume used for OG, ABV, and wash PG.
  const grainIn = !!input.grainIn
  const grainDisplacementGal = grainIn ? Math.max(0, input.grainDisplacementGal ?? 0) : 0
  const effectiveWashVolGal = getEffectiveLiquidVolume(washVolGal, grainDisplacementGal, grainIn)

  const { og, totalPoints, fermentableLb } = projectGravity(
    input.fermentables,
    effectiveWashVolGal,
    input.mashEfficiencyPct,
  )
  const fg = projectFG(og, input.attenuationPct)
  const washAbv = projectWashAbv(og, fg)
  const washInputPG = fermentableLb > 0 ? +(effectiveWashVolGal * washAbv * 2 / 100).toFixed(2) : 0

  const bs = projectBulkSpiritInput(input.bulkSpirits ?? [])

  const combinedInputPG = washInputPG + bs.inputPG
  const projectedPG = +(combinedInputPG * (Math.max(0, input.distillationYieldPct) / 100)).toFixed(2)

  return {
    og,
    fg,
    washAbv,
    washVolGal: +washVolGal.toFixed(2),
    fermentableLb,
    totalPoints,
    washInputPG,
    bulkSpiritVolGal: bs.totalVolGal,
    bulkSpiritAbv: bs.weightedAvgAbv,
    bulkSpiritPG: bs.inputPG,
    projectedPG,
    grainDisplacementGal: +grainDisplacementGal.toFixed(2),
    effectiveWashVolGal: +effectiveWashVolGal.toFixed(2),
  }
}

/**
 * Resolve recipe items + an Item lookup into normalized FermentableInput[].
 *
 * Skips: missing item refs, non-fermentable items, items with no PPG, and
 * items whose unit isn't a weight unit.
 */
export function buildFermentablesFromRecipe(
  recipeItems: Array<{ _id: string; amount: number; unit: string }>,
  itemsLookup: Map<
    string,
    { ppg?: number; extractType?: ExtractType; fermentable?: boolean }
  >,
): FermentableInput[] {
  const out: FermentableInput[] = []
  for (const ri of recipeItems) {
    if (!ri?._id) continue
    const item = itemsLookup.get(String(ri._id))
    if (!item || !item.fermentable || !item.ppg) continue
    const weightLb = toPounds(ri.amount, ri.unit)
    if (weightLb <= 0) continue
    out.push({
      weightLb,
      ppg: item.ppg,
      extractType: item.extractType ?? 'adjunct',
    })
  }
  return out
}
