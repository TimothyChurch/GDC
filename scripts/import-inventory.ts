/**
 * Import bottle inventory from Excel spreadsheet into MongoDB.
 *
 * Usage:
 *   npx tsx scripts/import-inventory.ts --dry-run   # Preview mapping + record count
 *   npx tsx scripts/import-inventory.ts              # Actually insert records
 */

import XLSX from "xlsx";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load env ────────────────────────────────────────────────────────
dotenv.config({ path: resolve(__dirname, "../.env") });

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@galvestondistillingco.pjkvjym.mongodb.net/`;

if (!MONGODB_USERNAME || !MONGODB_PASSWORD) {
  console.error("Missing MONGODB_USERNAME or MONGODB_PASSWORD in .env");
  process.exit(1);
}

const EXCEL_PATH = resolve(
  process.env.HOME || "/home/timothy",
  "Downloads/Inventory.xlsx"
);
const DRY_RUN = process.argv.includes("--dry-run");

// ── Mongoose models (standalone, not using Nuxt's defineMongooseModel) ──

const BottleSchema = new mongoose.Schema(
  {
    name: String,
    class: String,
    type: String,
    abv: Number,
    price: Number,
    volume: Number,
    volumeUnit: String,
    img: String,
    description: String,
    recipe: mongoose.Schema.Types.ObjectId,
    inStock: Boolean,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InventorySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Vessel" },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

const Bottle =
  mongoose.models.Bottle || mongoose.model("Bottle", BottleSchema);
const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

// ── Helpers ─────────────────────────────────────────────────────────

/** Convert Excel serial date number to JS Date */
function excelDateToJS(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

/** Normalize a name for matching: lowercase, trim, collapse whitespace */
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Detect which Excel rows (0-indexed, excluding header) are colored.
 * Colored rows are production numbers and should be skipped.
 */
function getColoredRows(ws: XLSX.WorkSheet): Set<number> {
  const colored = new Set<number>();
  const range = XLSX.utils.decode_range(ws["!ref"]!);

  // Check column A (c=0) for each data row (skip header row 0)
  for (let r = 1; r <= range.e.r; r++) {
    const cellAddr = XLSX.utils.encode_cell({ r, c: 0 });
    const cell = ws[cellAddr];
    if (!cell) continue;
    if (cell.s && cell.s.patternType === "solid") {
      colored.add(r - 1); // -1 because sheet_to_json is 0-indexed from data rows
    }
  }
  return colored;
}

// ── Explicit name overrides (spreadsheet name → DB bottle name) ─────
// Handles naming differences between the spreadsheet and the database.
// Set value to null to skip a column (no matching bottle in DB).
const NAME_OVERRIDES: Record<string, string | null> = {
  "Gin 1": "Gin No. 1",
  "Gin 2": "Gin No. 2",
  "Gin 3": "Gin No. 3",
  "All Spice Dram": "Allspice Dram",
  "Absinthe No 3": "Absinthe No. 3",
  "Cinnamon Vodka": "Cinnamon Spirit",
  "Ladies Pleasure": "Liqueur of Ladies' Pleasure",
  "Peach Schnapps": "Creme de Peche",
  "Peppermint Schnapps": "Peppermint Liqueur",
  "White Dog": "Sour Mash White Dog",
  Vodka: "Vodka No. 1",
  Maraschino: "Maraschino Liqueur",
};

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== LIVE INSERT ===");
  console.log();

  // 1. Read Excel (with cellStyles to detect colored rows)
  const wb = XLSX.readFile(EXCEL_PATH, { cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, {
    raw: true,
  });

  // Detect colored rows (production numbers — skip these)
  const coloredRows = getColoredRows(ws);

  console.log(`Excel: ${rows.length} total rows from "${wb.SheetNames[0]}"`);
  console.log(
    `  Colored (production) rows to skip: ${coloredRows.size}`
  );
  console.log(
    `  Inventory rows to import: ${rows.length - coloredRows.size}`
  );

  // Extract column headers (all keys except "Column 1" date col and "Column 43" totals)
  const allKeys = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
  const bottleColumns = [...allKeys].filter(
    (k) => k !== "Column 1" && k !== "Column 43"
  );
  console.log(`Excel: ${bottleColumns.length} bottle columns detected`);
  console.log();

  // 2. Connect to MongoDB
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");
  console.log();

  // 3. Fetch all bottles from DB
  const bottles = await Bottle.find({}).lean();
  console.log(`Database: ${bottles.length} bottles found`);
  console.log();

  // 4. Build name mapping: spreadsheet column → bottle document
  const mapping: Map<
    string,
    { bottleId: string; bottleName: string; matched: boolean }
  > = new Map();
  const unmatched: string[] = [];

  for (const col of bottleColumns) {
    // Check explicit overrides first
    if (col in NAME_OVERRIDES) {
      const override = NAME_OVERRIDES[col];
      if (override === null) {
        mapping.set(col, {
          bottleId: "",
          bottleName: "(skipped)",
          matched: false,
        });
        unmatched.push(col);
        continue;
      }
      const match = bottles.find(
        (b: any) => normalize(b.name) === normalize(override)
      );
      if (match) {
        mapping.set(col, {
          bottleId: match._id.toString(),
          bottleName: match.name,
          matched: true,
        });
        continue;
      }
    }

    const normalizedCol = normalize(col);
    const match = bottles.find(
      (b: any) => normalize(b.name) === normalizedCol
    );

    if (match) {
      mapping.set(col, {
        bottleId: match._id.toString(),
        bottleName: match.name,
        matched: true,
      });
    } else {
      mapping.set(col, { bottleId: "", bottleName: "", matched: false });
      unmatched.push(col);
    }
  }

  // 5. Display mapping
  console.log("=== COLUMN → BOTTLE MAPPING ===");
  console.log(
    "Spreadsheet Column".padEnd(30) +
      " → " +
      "Database Bottle".padEnd(35) +
      "ID"
  );
  console.log("-".repeat(90));

  for (const [col, info] of mapping) {
    if (info.matched) {
      console.log(
        col.padEnd(30) + " → " + info.bottleName.padEnd(35) + info.bottleId
      );
    } else {
      console.log(col.padEnd(30) + " → " + "*** NO MATCH ***");
    }
  }

  // 6. Show unmatched columns with their data
  if (unmatched.length > 0) {
    console.log();
    console.log("=== UNMATCHED COLUMNS (need your input) ===");
    console.log();

    for (const col of unmatched) {
      // Collect non-empty values from inventory rows only
      const values: Array<{ date: string; quantity: number }> = [];
      rows.forEach((row, idx) => {
        if (coloredRows.has(idx)) return; // skip production rows
        const val = row[col];
        if (val === undefined || val === null || val === "") return;
        const quantity = Number(val);
        if (isNaN(quantity)) return;
        const dateRaw = row["Column 1"];
        const date =
          typeof dateRaw === "number"
            ? excelDateToJS(dateRaw).toLocaleDateString()
            : String(dateRaw);
        values.push({ date, quantity });
      });

      console.log(
        `  "${col}" — ${values.length} inventory entries (non-production rows)`
      );
      if (values.length > 0) {
        // Show first 3 and last entry
        const preview = values.slice(0, 3);
        preview.forEach((v) =>
          console.log(`    ${v.date}: ${v.quantity}`)
        );
        if (values.length > 3) {
          console.log(`    ... (${values.length - 3} more)`);
          const last = values[values.length - 1];
          console.log(`    ${last.date}: ${last.quantity}`);
        }
      } else {
        console.log("    (no data in inventory rows)");
      }
      console.log();
    }

    console.log("Available bottle names in DB (not yet mapped):");
    const mappedBottleIds = new Set(
      [...mapping.values()]
        .filter((v) => v.matched)
        .map((v) => v.bottleId)
    );
    bottles
      .filter((b: any) => !mappedBottleIds.has(b._id.toString()))
      .map((b: any) => b.name)
      .sort()
      .forEach((name: string) => console.log(`  - "${name}"`));
  }

  console.log();

  // 7. Build inventory records (skip colored rows)
  const records: Array<{
    date: Date;
    item: mongoose.Types.ObjectId;
    quantity: number;
  }> = [];

  rows.forEach((row, rowIndex) => {
    // Skip colored rows (production numbers)
    if (coloredRows.has(rowIndex)) return;

    const dateRaw = row["Column 1"];
    if (!dateRaw) return;

    const date =
      typeof dateRaw === "number"
        ? excelDateToJS(dateRaw)
        : new Date(dateRaw as string);

    if (isNaN(date.getTime())) {
      console.warn(`Skipping row with invalid date: ${dateRaw}`);
      return;
    }

    for (const [col, info] of mapping) {
      if (!info.matched) continue;

      const val = row[col];
      if (val === undefined || val === null || val === "") continue;

      const quantity = Number(val);
      if (isNaN(quantity)) continue;

      records.push({
        date,
        item: new mongoose.Types.ObjectId(info.bottleId),
        quantity,
      });
    }
  });

  console.log(`Total records to insert: ${records.length}`);

  // 8. Check for existing duplicates
  const existingCount = await Inventory.countDocuments();
  console.log(`Existing inventory records in DB: ${existingCount}`);

  let duplicateCount = 0;
  const uniqueRecords: typeof records = [];

  const existingRecords = await Inventory.find(
    {},
    { date: 1, item: 1 }
  ).lean();
  const existingSet = new Set(
    existingRecords.map(
      (r: any) =>
        `${new Date(r.date).toISOString().split("T")[0]}_${r.item.toString()}`
    )
  );

  for (const rec of records) {
    const key = `${rec.date.toISOString().split("T")[0]}_${rec.item.toString()}`;
    if (existingSet.has(key)) {
      duplicateCount++;
    } else {
      uniqueRecords.push(rec);
    }
  }

  if (duplicateCount > 0) {
    console.log(
      `Skipping ${duplicateCount} records (already exist for same date+item)`
    );
  }
  console.log(`New records to insert: ${uniqueRecords.length}`);
  console.log();

  // Show date range
  if (uniqueRecords.length > 0) {
    const dates = uniqueRecords.map((r) => r.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    console.log(
      `Date range: ${minDate.toLocaleDateString()} → ${maxDate.toLocaleDateString()}`
    );
    console.log();
  }

  if (DRY_RUN) {
    console.log(
      "Dry run complete. Run without --dry-run to insert records."
    );
  } else if (uniqueRecords.length === 0) {
    console.log("No new records to insert.");
  } else {
    console.log(`Inserting ${uniqueRecords.length} records...`);
    const result = await Inventory.insertMany(uniqueRecords);
    console.log(
      `Successfully inserted ${result.length} inventory records.`
    );
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
