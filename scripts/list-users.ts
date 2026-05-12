import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const users = mongoose.connection.db!.collection("users");
  const all = await users.find({}, { projection: { email: 1, firstName: 1, lastName: 1, role: 1 } }).toArray();

  console.log(`Found ${all.length} user(s):`);
  for (const u of all) {
    console.log(`  ${u.email}  —  ${u.firstName ?? ""} ${u.lastName ?? ""}  —  role: ${u.role ?? "(none)"}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
