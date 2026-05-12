import { GRAIN_DEFAULTS } from "~/data/grainDefaults";

/**
 * One-time migration: walk every Item with category 'Base Ingredient' and
 * apply PPG / extractType / fermentable defaults from `data/grainDefaults.ts`
 * by name regex match. Items that already have ppg set are left untouched.
 *
 * Idempotent — safe to re-run, but gated by runOnceMigration anyway since
 * it's listed in the admin Settings UI.
 */
export default defineEventHandler(async (event) => {
  await requireRole(event, "Admin");

  const outcome = await runOnceMigration("seed-grain-defaults-v1", async () => {
    return await seedGrainDefaults();
  });

  if (outcome.alreadyApplied) {
    return {
      alreadyApplied: true,
      message: "Grain defaults have already been seeded.",
      appliedAt: outcome.appliedAt,
    };
  }
  return outcome.result;
});

async function seedGrainDefaults() {
  const items: any[] = await Item.find({
    category: "Base Ingredient",
    $or: [{ ppg: { $exists: false } }, { ppg: null }, { ppg: 0 }],
  });

  const matched: Array<{ name: string; ppg: number; extractType: string }> = [];
  const unmatched: string[] = [];

  for (const item of items) {
    const name: string = item.name || "";
    const def = GRAIN_DEFAULTS.find((g) => g.match.test(name)) ?? null;
    if (!def) {
      unmatched.push(name);
      continue;
    }
    item.ppg = def.ppg;
    item.extractType = def.extractType as any;
    item.fermentable = true;
    await item.save();
    matched.push({ name, ppg: def.ppg, extractType: def.extractType });
  }

  return {
    alreadyApplied: false,
    examined: items.length,
    matchedCount: matched.length,
    unmatchedCount: unmatched.length,
    matched,
    unmatched,
  };
}
