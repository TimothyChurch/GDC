import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
dotenv.config({ path: resolve(dirname(__filename), "../.env") });

const BATCH_ID = "69cf18dce9ddd2bbb8d9ddac";

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const db = mongoose.connection.db!;
  const batch: any = await db.collection("batches").findOne({ _id: new mongoose.Types.ObjectId(BATCH_ID) });
  if (!batch) return console.log("batch not found");

  console.log(`Batch: ${batch.batchNumber || "N/A"} | currentStage: ${batch.currentStage}`);
  console.log(`pipeline: ${JSON.stringify(batch.pipeline)}`);
  console.log(`stageVolumes:`, batch.stageVolumes);
  console.log(`\nstage vessels:`);
  for (const [k, v] of Object.entries(batch.stages || {})) {
    const vessel = (v as any)?.vessel;
    if (vessel) console.log(`  ${k}: ${vessel}`);
  }

  const vessels: any[] = await db.collection("vessels")
    .find({ "contents.batch": BATCH_ID }).toArray();

  console.log(`\nVessels containing this batch (${vessels.length}):`);
  for (const v of vessels) {
    const entry = v.contents.find((c: any) => c.batch === BATCH_ID);
    console.log(`  • ${v.name} (${v.type}) [${v._id}] — vol ${entry?.volume} ${entry?.volumeUnit} @ ${entry?.abv}% ABV`);
  }

  console.log(`\nAll fermenters:`);
  const ferms: any[] = await db.collection("vessels").find({ type: "Fermenter" }).toArray();
  for (const v of ferms) {
    console.log(`  • ${v.name} [${v._id}] — contents: ${JSON.stringify(v.contents?.map((c: any) => ({ batch: c.batch, vol: c.volume })) || [])}`);
  }

  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
