import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const db = mongoose.connection.db!;
  const batch: any = await db.collection("batches").findOne({ _id: new mongoose.Types.ObjectId("69cf18dce9ddd2bbb8d9ddac") });
  if (!batch) return console.log("not found");

  console.log("strippingRun stage:");
  console.log(JSON.stringify(batch.stages?.strippingRun, null, 2));
  console.log("\nlowWines stage:");
  console.log(JSON.stringify(batch.stages?.lowWines, null, 2));

  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
