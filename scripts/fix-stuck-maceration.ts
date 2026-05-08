import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const BATCH_ID = "69e03dd87928a384647ae0e2";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const db = mongoose.connection.db!;
  const batch: any = await db.collection("batches").findOne({ _id: new mongoose.Types.ObjectId(BATCH_ID) });
  if (!batch) { console.log("batch not found"); await mongoose.disconnect(); return; }

  console.log(`Batch: ${batch.batchNumber || "N/A"}`);
  console.log(`currentStage: ${batch.currentStage}`);
  console.log(`status: ${batch.status}`);
  console.log(`pipeline: [${(batch.pipeline || []).join(", ")}]`);
  console.log(`stageVolumes:`, batch.stageVolumes);

  const sv = batch.stageVolumes || {};
  const macVol = sv.Maceration ?? sv["Maceration"] ?? 0;
  console.log(`\nMaceration volume: ${macVol}`);

  if (macVol <= 0) {
    console.log("No stuck Maceration volume found.");
    await mongoose.disconnect();
    return;
  }

  console.log(`\nWill remove stageVolumes.Maceration (${macVol})`);

  if (!DRY_RUN) {
    await db.collection("batches").updateOne(
      { _id: batch._id },
      {
        $unset: { "stageVolumes.Maceration": "" },
        $push: {
          log: {
            date: new Date(),
            action: "Removed stuck Maceration volume — batch is fully bottled",
            details: `Cleared ${macVol} from stageVolumes.Maceration`,
          },
        } as any,
      }
    );
    console.log("✓ done");
  } else {
    console.log("(dry run)");
  }

  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
