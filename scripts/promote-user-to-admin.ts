import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const TARGET_EMAIL = "timothy@galvestondistillingco.com";

async function main() {
  await mongoose.connect(process.env.NUXT_ENV_MONGODB_URI!);
  const users = mongoose.connection.db!.collection("users");

  // Match case-insensitively to handle stored mixed-case emails.
  const filter = { email: { $regex: `^${TARGET_EMAIL}$`, $options: "i" } };
  const before = await users.findOne(filter);
  if (!before) {
    console.error(`No user found with email ${TARGET_EMAIL}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Found user: ${before.email}  (current role: ${before.role ?? "(none)"})`);

  const result = await users.updateOne(filter, { $set: { role: "Admin" } });

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

  const after = await users.findOne({ email: TARGET_EMAIL });
  console.log(`New role: ${after?.role}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
