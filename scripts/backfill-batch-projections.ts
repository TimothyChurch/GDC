import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import {
  buildFermentablesFromRecipe,
  projectAll,
  toGallons,
  type ExtractType,
  type BulkSpiritInput,
} from "../utils/grainBill";
import { convertUnitRatio } from "../utils/conversions";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
});

interface Defaults {
  mashEfficiency: number;
  fermentationAttenuation: number;
  distillationYield: number;
}

const FALLBACK: Defaults = {
  mashEfficiency: 75,
  fermentationAttenuation: 80,
  distillationYield: 80,
};

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const db = mongoose.connection.db!;
  const settingsCol = db.collection("settings");
  const itemsCol = db.collection("items");
  const bulkSpiritsCol = db.collection("bulkspirits");
  const recipesCol = db.collection("recipes");
  const batchesCol = db.collection("batches");

  // ── 1. Load settings defaults ────────────────────────────────────
  const settings: any = await settingsCol.findOne({});
  const defaults: Defaults = {
    mashEfficiency: settings?.production?.mashEfficiency ?? FALLBACK.mashEfficiency,
    fermentationAttenuation: settings?.production?.fermentationAttenuation ?? FALLBACK.fermentationAttenuation,
    distillationYield: settings?.production?.distillationYield ?? FALLBACK.distillationYield,
  };
  console.log(`Using defaults: mashEff=${defaults.mashEfficiency}%, atten=${defaults.fermentationAttenuation}%, distYield=${defaults.distillationYield}%`);

  // ── 2. Build item lookup ─────────────────────────────────────────
  const items: any[] = await itemsCol
    .find({}, { projection: { _id: 1, ppg: 1, extractType: 1, fermentable: 1, name: 1 } })
    .toArray();
  const itemLookup = new Map<string, { ppg?: number; extractType?: ExtractType; fermentable?: boolean }>();
  for (const it of items) {
    itemLookup.set(String(it._id), {
      ppg: it.ppg,
      extractType: it.extractType as ExtractType | undefined,
      fermentable: it.fermentable,
    });
  }
  const fermentableCount = items.filter((i) => i.fermentable && i.ppg).length;
  console.log(`Loaded ${items.length} items (${fermentableCount} fermentable with PPG).`);

  // ── 2b. Build bulk-spirit ABV lookup ─────────────────────────────
  const bulkSpirits: any[] = await bulkSpiritsCol
    .find({}, { projection: { _id: 1, abv: 1, name: 1 } })
    .toArray();
  const bulkSpiritAbv = new Map<string, number>();
  for (const bs of bulkSpirits) {
    if (typeof bs.abv === "number") bulkSpiritAbv.set(String(bs._id), bs.abv);
  }
  console.log(`Loaded ${bulkSpirits.length} bulk spirits (${bulkSpiritAbv.size} with ABV).`);

  // ── 3. Recompute every recipe's projection snapshot ──────────────
  const recipes: any[] = await recipesCol.find({}).toArray();
  const recipeProjectionById = new Map<string, ReturnType<typeof projectAll> | null>();
  let recipesUpdated = 0;
  let recipesSkippedNoBill = 0;
  let recipesGrainPath = 0;
  let recipesBulkSpiritPath = 0;
  let recipesCombined = 0;

  for (const r of recipes) {
    const hasItems = (r.items?.length ?? 0) > 0;
    const hasBulkSpirits = (r.bulkSpirits?.length ?? 0) > 0;
    if (!hasItems && !hasBulkSpirits) {
      recipeProjectionById.set(String(r._id), null);
      recipesSkippedNoBill++;
      continue;
    }

    const fermentables = hasItems
      ? buildFermentablesFromRecipe(
          r.items.map((i: any) => ({
            _id: String(i._id),
            amount: Number(i.amount) || 0,
            unit: String(i.unit || ""),
          })),
          itemLookup,
        )
      : [];

    const bulkSpiritInputs: BulkSpiritInput[] = [];
    if (hasBulkSpirits && r.bulkSpirits) {
      for (const ref of r.bulkSpirits) {
        if (!ref?.bulkSpirit || !ref?.volume) continue;
        const abv = bulkSpiritAbv.get(String(ref.bulkSpirit));
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
      washVolume: r.volume ?? 0,
      washVolumeUnit: r.volumeUnit ?? "gallon",
      mashEfficiencyPct: r.mashEfficiency ?? defaults.mashEfficiency,
      attenuationPct: r.attenuation ?? defaults.fermentationAttenuation,
      distillationYieldPct: r.distillationYield ?? defaults.distillationYield,
    });

    const hasGrainBill = result.fermentableLb > 0;
    const hasBulkSpiritPG = result.bulkSpiritPG > 0;

    await recipesCol.updateOne(
      { _id: r._id },
      {
        $set: {
          projectedOG: hasGrainBill ? result.og : null,
          projectedFG: hasGrainBill ? result.fg : null,
          projectedWashAbv: hasGrainBill ? result.washAbv : null,
          projectedProofGallons: result.projectedPG > 0 ? result.projectedPG : null,
          projectedFermentableLb: hasGrainBill ? result.fermentableLb : null,
        },
      },
    );
    recipeProjectionById.set(String(r._id), result);
    recipesUpdated++;
    if (hasGrainBill && hasBulkSpiritPG) recipesCombined++;
    else if (hasGrainBill) recipesGrainPath++;
    else if (hasBulkSpiritPG) recipesBulkSpiritPath++;
  }
  console.log(
    `Recipes: updated ${recipesUpdated} (${recipesGrainPath} grain, ${recipesBulkSpiritPath} bulk-spirit, ${recipesCombined} combined); skipped ${recipesSkippedNoBill} (no bill).`,
  );

  // ── 4. Apply projection to active batches ────────────────────────
  const batches: any[] = await batchesCol.find({ status: "active" }).toArray();
  console.log(`Examining ${batches.length} active batches…`);

  let batchesUpdated = 0;
  const skipped: string[] = [];
  const filled: Array<{ batch: string; recipe: string; fields: string[] }> = [];

  for (const b of batches) {
    const projection = recipeProjectionById.get(String(b.recipe));
    const recipe = recipes.find((r) => String(r._id) === String(b.recipe));
    if (!recipe) {
      skipped.push(`${b.batchNumber || b._id} (recipe missing)`);
      continue;
    }
    if (!projection) {
      skipped.push(`${b.batchNumber || b._id} (recipe has no bill)`);
      continue;
    }
    if (projection.fermentableLb <= 0) {
      // Bulk-spirit-only recipe — no fermenting stage to prefill on the batch.
      skipped.push(
        `${b.batchNumber || b._id} (bulk-spirit recipe — no fermenting prefill needed)`,
      );
      continue;
    }

    const scale = computeBatchScale(
      b.batchSize,
      b.batchSizeUnit || recipe.volumeUnit,
      recipe.volume,
      recipe.volumeUnit,
    );
    const projectedWashVol = +(recipe.volume * scale).toFixed(2);

    const stages = b.stages || {};
    const f = stages.fermenting || {};
    const fieldsToSet: Record<string, any> = {};
    const filledFields: string[] = [];

    if (f.originalGravity == null && projection.og > 1) {
      fieldsToSet["stages.fermenting.originalGravity"] = projection.og;
      filledFields.push("OG");
    }
    if (f.finalGravity == null && projection.fg > 1) {
      fieldsToSet["stages.fermenting.finalGravity"] = projection.fg;
      filledFields.push("FG");
    }
    if (f.estimatedAbv == null && projection.washAbv > 0) {
      fieldsToSet["stages.fermenting.estimatedAbv"] = projection.washAbv;
      filledFields.push("ABV");
    }
    if (f.washVolume == null && projectedWashVol > 0) {
      fieldsToSet["stages.fermenting.washVolume"] = projectedWashVol;
      fieldsToSet["stages.fermenting.washVolumeUnit"] = recipe.volumeUnit;
      filledFields.push(`Wash(${projectedWashVol} ${recipe.volumeUnit})`);
    }

    if (Object.keys(fieldsToSet).length === 0) {
      skipped.push(`${b.batchNumber || b._id} (all fields already set)`);
      continue;
    }

    await batchesCol.updateOne({ _id: b._id }, { $set: fieldsToSet });
    batchesUpdated++;
    filled.push({
      batch: b.batchNumber || String(b._id),
      recipe: recipe.name || String(recipe._id),
      fields: filledFields,
    });
  }

  console.log(`\n── Summary ──`);
  console.log(`Batches updated: ${batchesUpdated}`);
  console.log(`Batches skipped: ${skipped.length}`);
  if (filled.length) {
    console.log(`\nFilled fields:`);
    for (const f of filled) {
      console.log(`  ${f.batch}  [${f.recipe}]  →  ${f.fields.join(", ")}`);
    }
  }
  if (skipped.length) {
    console.log(`\nSkipped batches:`);
    for (const s of skipped) console.log(`  ${s}`);
  }

  await mongoose.disconnect();
}

/**
 * Compute scale factor from batch size to recipe size.
 * Returns batchSize_in_recipe_units / recipe.volume.
 */
function computeBatchScale(
  batchSize: number,
  batchSizeUnit: string,
  recipeVolume: number,
  recipeVolumeUnit: string,
): number {
  if (!batchSize || !recipeVolume) return 1;
  if (batchSizeUnit === recipeVolumeUnit) return batchSize / recipeVolume;
  const ratio = convertUnitRatio(batchSizeUnit, recipeVolumeUnit) || 1;
  return (batchSize * ratio) / recipeVolume;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
