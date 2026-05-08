/**
 * One-off migration: updates the Neutral Spirit recipe(s) and batch 69cf18dce9ddd2bbb8d9ddac
 * from the old single-"Distilling" pipeline to the new
 * Stripping Run / Low Wines / Spirit Run pipeline.
 *
 * Mirrors the logic in server/api/batch/migrate-distilling-stages.post.ts but
 * targets only these specific documents (no admin auth needed).
 *
 * Usage:
 *   npx tsx scripts/migrate-neutral-pipeline.ts --dry-run
 *   npx tsx scripts/migrate-neutral-pipeline.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.NUXT_ENV_MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing NUXT_ENV_MONGODB_URI in .env");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const TARGET_BATCH_ID = "69cf18dce9ddd2bbb8d9ddac";
const NEW_STAGES = ["Stripping Run", "Low Wines", "Spirit Run"];

function shouldMigrate(pipeline: string[]): boolean {
  if (!pipeline?.includes("Distilling")) return false;
  if (pipeline.includes("Stripping Run") || pipeline.includes("Spirit Run")) return false;
  const distIdx = pipeline.indexOf("Distilling");
  if (distIdx > 0 && pipeline[distIdx - 1] === "Maceration") return false;
  return true;
}

function replacePipeline(pipeline: string[]): string[] {
  const idx = pipeline.indexOf("Distilling");
  if (idx < 0) return pipeline;
  return [...pipeline.slice(0, idx), ...NEW_STAGES, ...pipeline.slice(idx + 1)];
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  console.log(`Connected to MongoDB${DRY_RUN ? " (DRY RUN)" : ""}\n`);

  const db = mongoose.connection.db!;
  const Recipes = db.collection("recipes");
  const Batches = db.collection("batches");

  // ── Recipes ─────────────────────────────────────────────────────────
  const neutralRecipes = await Recipes.find({
    $or: [{ class: /neutral/i }, { name: /neutral/i }, { type: /neutral/i }],
  }).toArray();

  console.log(`Found ${neutralRecipes.length} Neutral recipe(s):`);
  for (const r of neutralRecipes) {
    const pipeline: string[] = r.pipeline || [];
    console.log(`  • ${r.name} (${r._id}) — pipeline: [${pipeline.join(", ")}]`);
    if (!shouldMigrate(pipeline)) {
      console.log("    → skip (already migrated or not applicable)");
      continue;
    }
    const newPipeline = replacePipeline(pipeline);
    console.log(`    → update: [${newPipeline.join(", ")}]`);
    if (!DRY_RUN) {
      await Recipes.updateOne({ _id: r._id }, { $set: { pipeline: newPipeline } });
    }
  }

  // ── Target batch ────────────────────────────────────────────────────
  console.log(`\nLooking up batch ${TARGET_BATCH_ID}…`);
  const batch: any = await Batches.findOne({ _id: new mongoose.Types.ObjectId(TARGET_BATCH_ID) });
  if (!batch) {
    console.error(`  ✗ batch not found`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const pipeline: string[] = batch.pipeline || [];
  console.log(`  batchNumber: ${batch.batchNumber || "N/A"}`);
  console.log(`  currentStage: ${batch.currentStage}`);
  console.log(`  pipeline: [${pipeline.join(", ")}]`);

  if (!shouldMigrate(pipeline)) {
    console.log(`  → skip (already migrated or not applicable)`);
    await mongoose.disconnect();
    return;
  }

  const oldPipeline = [...pipeline];
  const update: Record<string, any> = {};
  const unset: Record<string, any> = {};

  update.pipeline = replacePipeline(pipeline);

  const distillingData = batch.stages?.distilling;
  if (distillingData) {
    const runs = distillingData.runs || [];
    const strippingRuns = runs.filter((r: any) => r.runType === "stripping");
    const spiritRuns = runs.filter((r: any) => r.runType === "spirit");

    if (strippingRuns.length > 0) {
      update["stages.strippingRun"] = {
        startedAt: distillingData.startedAt,
        vessel: distillingData.vessel,
        notes: distillingData.notes,
        runs: strippingRuns,
        ...(strippingRuns.every((r: any) => r.completed) ? { completedAt: new Date() } : {}),
      };

      let lowWinesVol = 0;
      let lowWinesAbvWeighted = 0;
      for (const run of strippingRuns) {
        const vol = run.output?.volume || run.total?.volume || 0;
        const abv = run.output?.abv || run.total?.abv || 0;
        lowWinesVol += vol;
        lowWinesAbvWeighted += vol * abv;
      }
      const lowWinesAbv = lowWinesVol > 0 ? lowWinesAbvWeighted / lowWinesVol : 0;

      const lowWinesStage: any = {
        startedAt: distillingData.startedAt,
        volume: lowWinesVol,
        volumeUnit: strippingRuns[0]?.output?.volumeUnit || "gallon",
        abv: lowWinesAbv,
        sourceRuns: strippingRuns.length,
      };
      if (spiritRuns.length > 0) lowWinesStage.completedAt = new Date();
      update["stages.lowWines"] = lowWinesStage;
    }

    if (spiritRuns.length > 0) {
      update["stages.spiritRun"] = {
        startedAt: spiritRuns[0]?.date || distillingData.startedAt,
        vessel: distillingData.vessel,
        runs: spiritRuns,
        ...(spiritRuns.every((r: any) => r.completed) ? { completedAt: new Date() } : {}),
      };
    }
  }

  // stageVolumes: migrate "Distilling" key
  const sv = batch.stageVolumes || {};
  const distVol = sv.Distilling ?? 0;
  if (distVol != null && "Distilling" in sv) {
    const hasSpirit = (batch.stages?.spiritRun?.runs || update["stages.spiritRun"]?.runs || []).length > 0;
    const hasStripping = (batch.stages?.strippingRun?.runs || update["stages.strippingRun"]?.runs || []).length > 0;
    const spiritRunsAll = update["stages.spiritRun"]?.runs || batch.stages?.spiritRun?.runs || [];
    const spiritComplete = hasSpirit && spiritRunsAll.every((r: any) => r.completed);

    if (!spiritComplete) {
      if (hasSpirit) update["stageVolumes.Spirit Run"] = distVol;
      else if (hasStripping) update["stageVolumes.Low Wines"] = distVol;
      else update["stageVolumes.Stripping Run"] = distVol;
    }
    unset["stageVolumes.Distilling"] = "";
  }

  // currentStage
  if (batch.currentStage === "Distilling") {
    const hasSpirit = (update["stages.spiritRun"]?.runs || []).length > 0;
    const hasStripping = (update["stages.strippingRun"]?.runs || []).length > 0;
    update.currentStage = hasSpirit ? "Spirit Run" : hasStripping ? "Low Wines" : "Stripping Run";
  }

  // log entry
  const logEntry = {
    date: new Date(),
    action: "Distilling stage migrated to Stripping Run / Low Wines / Spirit Run",
    details: `Pipeline: ${oldPipeline.join(" → ")} → ${update.pipeline.join(" → ")}`,
  };

  console.log(`\n  → $set keys: ${Object.keys(update).join(", ")}`);
  if (Object.keys(unset).length) console.log(`  → $unset keys: ${Object.keys(unset).join(", ")}`);
  console.log(`  → new currentStage: ${update.currentStage ?? batch.currentStage}`);
  console.log(`  → new pipeline: [${update.pipeline.join(", ")}]`);

  if (!DRY_RUN) {
    const ops: any = { $set: update, $push: { log: logEntry } };
    if (Object.keys(unset).length) ops.$unset = unset;
    await Batches.updateOne({ _id: batch._id }, ops);
    console.log(`  ✓ batch updated`);
  }

  await mongoose.disconnect();
  console.log(`\nDone${DRY_RUN ? " (dry run — no changes written)" : ""}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
