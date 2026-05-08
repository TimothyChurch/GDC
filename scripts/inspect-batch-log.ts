import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const batch: any = await mongoose.connection.db!.collection("batches")
    .findOne({ _id: new mongoose.Types.ObjectId("69cf18dce9ddd2bbb8d9ddac") });
  const log = batch?.log || [];
  console.log(`log entries: ${log.length}`);
  for (const e of log.slice(-25)) {
    const d = new Date(e.date).toISOString().replace("T", " ").slice(0, 19);
    console.log(`  ${d}  ${e.action}${e.details ? " — " + e.details : ""}`);
  }
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
