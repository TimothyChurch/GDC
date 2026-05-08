/**
 * Backfill outputs on stripping runs for batch 69cf18dce9ddd2bbb8d9ddac.
 *
 * Reconstructs each run's output from the batch log entries
 * ("Distilled X from Stripping Run, collected Y to Low Wines"), then
 * recomputes lowWines as the accumulation of all outputs.
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const BATCH_ID = "69cf18dce9ddd2bbb8d9ddac";
const DRY_RUN = process.argv.includes("--dry-run");

// Calculate proof gallons (US gallon × ABV × 2). Non-gallon units converted.
function toGallons(volume: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === "gallon" || u === "gal") return volume;
  if (u === "l" || u === "liter") return volume * 0.264172;
  if (u === "ml") return volume * 0.000264172;
  if (u === "fl oz") return volume * 0.0078125;
  return volume;
}
function proofGallons(volume: number, unit: string, abv: number): number {
  return +(toGallons(volume, unit) * (abv / 100) * 2).toFixed(4);
}

// Log entry distillate details for the outputs we know happened
const knownDistillations = [
  { runNumber: 1, volume: 159, volumeUnit: "L", abv: 62.6 },
  { runNumber: 2, volume: 99, volumeUnit: "L", abv: 27.8 },
];

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const db = mongoose.connection.db!;
  const Batches = db.collection("batches");

  const batch: any = await Batches.findOne({ _id: new mongoose.Types.ObjectId(BATCH_ID) });
  if (!batch) return console.log("not found");

  const runs: any[] = batch.stages?.strippingRun?.runs || [];
  console.log(`Found ${runs.length} stripping runs\n`);

  // The log entries we have show volumes/units but not abv. The current lowWines has abv=27.8 (from latest run).
  // We don't have run-specific ABV data, so prompt user to review in app. For now, carry abv = current lowWines.abv
  // to run 2 only; run 1 ABV stays unknown (0) unless user provides it.
  const currentLowWinesAbv = batch.stages?.lowWines?.abv || 0;
  const currentLowWinesUnit = batch.stages?.lowWines?.volumeUnit || "gallon";

  const updatedRuns = runs.map((r) => {
    const known = knownDistillations.find((k) => k.runNumber === r.runNumber);
    if (!known) return r;
    return {
      ...r,
      completed: true,
      output: {
        ...r.output,
        volume: known.volume,
        volumeUnit: known.volumeUnit,
        abv: known.abv,
      },
      total: {
        volume: known.volume,
        volumeUnit: known.volumeUnit,
        abv: known.abv,
        proofGallons: proofGallons(known.volume, known.volumeUnit, known.abv),
      },
    };
  });

  // Recompute lowWines from updated runs
  const runsWithOutput = updatedRuns.filter((r) => (r.output?.volume || 0) > 0);
  const totalVolGal = runsWithOutput.reduce(
    (s, r) => s + toGallons(r.output.volume, r.output.volumeUnit),
    0
  );
  const weightedAbv = runsWithOutput.reduce(
    (s, r) => s + toGallons(r.output.volume, r.output.volumeUnit) * (r.output.abv || 0),
    0
  );
  const avgAbv = totalVolGal > 0 ? +(weightedAbv / totalVolGal).toFixed(2) : 0;
  const totalVol = runsWithOutput.reduce((s, r) => s + (r.output.volume || 0), 0); // in the base unit of run[0]
  const unit = runsWithOutput[0]?.output?.volumeUnit || currentLowWinesUnit;

  const newLowWines = {
    ...batch.stages.lowWines,
    volume: totalVol,
    volumeUnit: unit,
    abv: avgAbv,
    proofGallons: proofGallons(totalVol, unit, avgAbv),
    sourceRuns: updatedRuns.length,
  };

  console.log("Updated runs:");
  for (const r of updatedRuns) {
    console.log(`  run #${r.runNumber}: ${r.output?.volume} ${r.output?.volumeUnit} @ ${r.output?.abv}% ABV (completed=${r.completed})`);
  }
  console.log("\nNew lowWines:", newLowWines);

  if (!DRY_RUN) {
    await Batches.updateOne(
      { _id: batch._id },
      { $set: { "stages.strippingRun.runs": updatedRuns, "stages.lowWines": newLowWines } }
    );
    console.log("\n✓ applied");
  } else {
    console.log("\n(dry run — no changes written)");
  }

  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
