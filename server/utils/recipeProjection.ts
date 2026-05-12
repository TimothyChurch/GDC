import {
  buildFermentablesFromRecipe,
  calcGrainDisplacement,
  projectAll,
  toGallons,
  type ExtractType,
  type BulkSpiritInput,
} from "../../utils/grainBill";

interface RecipeLike {
  volume?: number;
  volumeUnit?: string;
  items?: Array<{ _id?: any; amount?: number; unit?: string }>;
  bulkSpirits?: Array<{ bulkSpirit?: any; volume?: number; volumeUnit?: string }>;
  mashEfficiency?: number;
  attenuation?: number;
  distillationYield?: number;
  grainIn?: boolean;
}

interface ProductionDefaults {
  mashEfficiency: number;
  fermentationAttenuation: number;
  distillationYield: number;
}

const FALLBACK_DEFAULTS: ProductionDefaults = {
  mashEfficiency: 75,
  fermentationAttenuation: 80,
  distillationYield: 80,
};

async function getProductionDefaults(): Promise<ProductionDefaults> {
  try {
    const doc: any = await Settings.findOne().lean();
    const p = doc?.production;
    return {
      mashEfficiency: typeof p?.mashEfficiency === "number" ? p.mashEfficiency : FALLBACK_DEFAULTS.mashEfficiency,
      fermentationAttenuation: typeof p?.fermentationAttenuation === "number" ? p.fermentationAttenuation : FALLBACK_DEFAULTS.fermentationAttenuation,
      distillationYield: typeof p?.distillationYield === "number" ? p.distillationYield : FALLBACK_DEFAULTS.distillationYield,
    };
  } catch {
    return FALLBACK_DEFAULTS;
  }
}

/**
 * Compute projected OG / FG / wash ABV / proof gallons for a recipe.
 * Resolves Items by id for fermentable PPG lookup, and BulkSpirits by id
 * for current-ABV lookup so that gin / redistillation recipes also project.
 */
export async function computeRecipeProjection(recipe: RecipeLike): Promise<{
  projectedOG: number | null;
  projectedFG: number | null;
  projectedWashAbv: number | null;
  projectedProofGallons: number | null;
  projectedFermentableLb: number | null;
}> {
  const hasItems = (recipe?.items?.length ?? 0) > 0;
  const hasBulkSpirits = (recipe?.bulkSpirits?.length ?? 0) > 0;

  if (!hasItems && !hasBulkSpirits) {
    return {
      projectedOG: null,
      projectedFG: null,
      projectedWashAbv: null,
      projectedProofGallons: null,
      projectedFermentableLb: null,
    };
  }

  const defaults = await getProductionDefaults();
  const mashEff = recipe.mashEfficiency ?? defaults.mashEfficiency;
  const atten = recipe.attenuation ?? defaults.fermentationAttenuation;
  const distYield = recipe.distillationYield ?? defaults.distillationYield;

  // ── Fermentables (grain bill) ─────────────────────────────────
  let fermentables: Array<ReturnType<typeof buildFermentablesFromRecipe>[number]> = [];
  let grainDisplacementGal = 0;
  if (hasItems && recipe.items) {
    const itemIds = recipe.items.map((i) => i?._id).filter(Boolean).map(String);
    const items: any[] = await Item.find({ _id: { $in: itemIds } })
      .select("ppg extractType fermentable displacement")
      .lean();

    const lookup = new Map<
      string,
      { ppg?: number; extractType?: ExtractType; fermentable?: boolean; displacement?: number }
    >();
    for (const it of items) {
      lookup.set(String(it._id), {
        ppg: it.ppg,
        extractType: it.extractType as ExtractType | undefined,
        fermentable: it.fermentable,
        displacement: it.displacement,
      });
    }

    const normalizedItems = recipe.items.map((i) => ({
      _id: String(i._id),
      amount: Number(i.amount) || 0,
      unit: String(i.unit || ""),
    }));

    fermentables = buildFermentablesFromRecipe(normalizedItems, lookup);
    grainDisplacementGal = calcGrainDisplacement(normalizedItems, lookup);
  }

  // ── Bulk spirits (gin / redistillation) ───────────────────────
  let bulkSpiritInputs: BulkSpiritInput[] = [];
  if (hasBulkSpirits && recipe.bulkSpirits) {
    const bsIds = recipe.bulkSpirits
      .map((b) => b?.bulkSpirit)
      .filter(Boolean)
      .map(String);

    const bulkSpiritDocs: any[] = await BulkSpirit.find({ _id: { $in: bsIds } })
      .select("abv")
      .lean();
    const abvLookup = new Map<string, number>();
    for (const bs of bulkSpiritDocs) {
      if (typeof bs.abv === "number") abvLookup.set(String(bs._id), bs.abv);
    }

    for (const ref of recipe.bulkSpirits) {
      if (!ref?.bulkSpirit || !ref?.volume) continue;
      const abv = abvLookup.get(String(ref.bulkSpirit));
      if (!abv) continue;
      bulkSpiritInputs.push({
        volumeGal: toGallons(ref.volume, ref.volumeUnit || "gallon"),
        abv,
      });
    }
  }

  const result = projectAll({
    fermentables,
    bulkSpirits: bulkSpiritInputs,
    washVolume: recipe.volume ?? 0,
    washVolumeUnit: recipe.volumeUnit ?? "gallon",
    mashEfficiencyPct: mashEff,
    attenuationPct: atten,
    distillationYieldPct: distYield,
    grainIn: !!recipe.grainIn,
    grainDisplacementGal,
  });

  // For bulk-spirit-only recipes (no fermentation), wash projections aren't
  // meaningful — null them out so the UI hides the wash panel.
  const hasGrainBill = result.fermentableLb > 0;
  return {
    projectedOG: hasGrainBill ? result.og : null,
    projectedFG: hasGrainBill ? result.fg : null,
    projectedWashAbv: hasGrainBill ? result.washAbv : null,
    projectedProofGallons: result.projectedPG > 0 ? result.projectedPG : null,
    projectedFermentableLb: hasGrainBill ? result.fermentableLb : null,
  };
}
