import { d as defineEventHandler, l as requireRole, h as Batch, R as Recipe } from '../../../nitro/nitro.mjs';
import 'mongoose';
import 'yup';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'vue';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';

const migrateDistillingStages_post = defineEventHandler(async (event) => {
  await requireRole(event, "Admin");
  const batchResults = await migrateBatches();
  const recipeResults = await migrateRecipes();
  return {
    batches: batchResults,
    recipes: recipeResults
  };
});
const NEW_STAGES = ["Stripping Run", "Low Wines", "Spirit Run"];
function shouldMigrate(pipeline) {
  if (!pipeline.includes("Distilling")) return false;
  if (pipeline.includes("Stripping Run") || pipeline.includes("Spirit Run")) return false;
  const distIdx = pipeline.indexOf("Distilling");
  if (distIdx > 0 && pipeline[distIdx - 1] === "Maceration") return false;
  return true;
}
function replacePipeline(pipeline) {
  const idx = pipeline.indexOf("Distilling");
  if (idx < 0) return pipeline;
  return [...pipeline.slice(0, idx), ...NEW_STAGES, ...pipeline.slice(idx + 1)];
}
async function migrateBatches() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
  const batches = await Batch.find({});
  let updated = 0;
  let skipped = 0;
  const details = [];
  for (const batch of batches) {
    const doc = batch;
    const pipeline = doc.pipeline || [];
    if (!shouldMigrate(pipeline)) {
      skipped++;
      continue;
    }
    const oldPipeline = [...pipeline];
    doc.pipeline = replacePipeline(pipeline);
    const distillingData = (_a = doc.stages) == null ? void 0 : _a.distilling;
    if (distillingData) {
      const runs = distillingData.runs || [];
      const strippingRuns = runs.filter((r) => r.runType === "stripping");
      const spiritRuns = runs.filter((r) => r.runType === "spirit");
      if (strippingRuns.length > 0) {
        doc.stages.strippingRun = {
          startedAt: distillingData.startedAt,
          vessel: distillingData.vessel,
          notes: distillingData.notes,
          runs: strippingRuns
        };
        let lowWinesVol = 0;
        let lowWinesAbvWeighted = 0;
        for (const run of strippingRuns) {
          const vol = ((_b = run.output) == null ? void 0 : _b.volume) || ((_c = run.total) == null ? void 0 : _c.volume) || 0;
          const abv = ((_d = run.output) == null ? void 0 : _d.abv) || ((_e = run.total) == null ? void 0 : _e.abv) || 0;
          lowWinesVol += vol;
          lowWinesAbvWeighted += vol * abv;
        }
        const lowWinesAbv = lowWinesVol > 0 ? lowWinesAbvWeighted / lowWinesVol : 0;
        doc.stages.lowWines = {
          startedAt: distillingData.startedAt,
          volume: lowWinesVol,
          volumeUnit: ((_g = (_f = strippingRuns[0]) == null ? void 0 : _f.output) == null ? void 0 : _g.volumeUnit) || "gallon",
          abv: lowWinesAbv,
          sourceRuns: strippingRuns.length
        };
        if (strippingRuns.every((r) => r.completed)) {
          doc.stages.strippingRun.completedAt = /* @__PURE__ */ new Date();
        }
      }
      if (spiritRuns.length > 0) {
        doc.stages.spiritRun = {
          startedAt: ((_h = spiritRuns[0]) == null ? void 0 : _h.date) || distillingData.startedAt,
          vessel: distillingData.vessel,
          runs: spiritRuns
        };
        if (spiritRuns.every((r) => r.completed)) {
          doc.stages.spiritRun.completedAt = /* @__PURE__ */ new Date();
        }
        if (doc.stages.lowWines) {
          doc.stages.lowWines.completedAt = /* @__PURE__ */ new Date();
        }
      }
    }
    if (((_j = (_i = doc.stageVolumes) == null ? void 0 : _i.get) == null ? void 0 : _j.call(_i, "Distilling")) != null || ((_k = doc.stageVolumes) == null ? void 0 : _k.Distilling) != null) {
      const distVol = (_p = (_o = (_m = (_l = doc.stageVolumes) == null ? void 0 : _l.get) == null ? void 0 : _m.call(_l, "Distilling")) != null ? _o : (_n = doc.stageVolumes) == null ? void 0 : _n.Distilling) != null ? _p : 0;
      const hasSpirit = (((_r = (_q = doc.stages) == null ? void 0 : _q.spiritRun) == null ? void 0 : _r.runs) || []).length > 0;
      const hasStripping = (((_t = (_s = doc.stages) == null ? void 0 : _s.strippingRun) == null ? void 0 : _t.runs) || []).length > 0;
      const spiritComplete = hasSpirit && (((_v = (_u = doc.stages) == null ? void 0 : _u.spiritRun) == null ? void 0 : _v.runs) || []).every((r) => r.completed);
      if (spiritComplete) ; else if (hasSpirit) {
        (_y = (_x = (_w = doc.stageVolumes) == null ? void 0 : _w.set) == null ? void 0 : _x.call(_w, "Spirit Run", distVol)) != null ? _y : doc.stageVolumes["Spirit Run"] = distVol;
      } else if (hasStripping) {
        (_B = (_A = (_z = doc.stageVolumes) == null ? void 0 : _z.set) == null ? void 0 : _A.call(_z, "Low Wines", distVol)) != null ? _B : doc.stageVolumes["Low Wines"] = distVol;
      } else {
        (_E = (_D = (_C = doc.stageVolumes) == null ? void 0 : _C.set) == null ? void 0 : _D.call(_C, "Stripping Run", distVol)) != null ? _E : doc.stageVolumes["Stripping Run"] = distVol;
      }
      if ((_F = doc.stageVolumes) == null ? void 0 : _F.delete) {
        doc.stageVolumes.delete("Distilling");
      } else {
        delete doc.stageVolumes.Distilling;
      }
    }
    if (doc.currentStage === "Distilling") {
      const hasSpirit = (((_H = (_G = doc.stages) == null ? void 0 : _G.spiritRun) == null ? void 0 : _H.runs) || []).length > 0;
      const hasStripping = (((_J = (_I = doc.stages) == null ? void 0 : _I.strippingRun) == null ? void 0 : _J.runs) || []).length > 0;
      const spiritComplete = hasSpirit && (((_L = (_K = doc.stages) == null ? void 0 : _K.spiritRun) == null ? void 0 : _L.runs) || []).every((r) => r.completed);
      if (spiritComplete) {
        doc.currentStage = "Spirit Run";
      } else if (hasSpirit) {
        doc.currentStage = "Spirit Run";
      } else if (hasStripping) {
        doc.currentStage = "Low Wines";
      } else {
        doc.currentStage = "Stripping Run";
      }
    }
    if (!doc.log) doc.log = [];
    doc.log.push({
      date: /* @__PURE__ */ new Date(),
      action: "Distilling stage migrated to Stripping Run / Low Wines / Spirit Run",
      details: `Pipeline: ${oldPipeline.join(" \u2192 ")} \u2192 ${doc.pipeline.join(" \u2192 ")}`
    });
    await batch.save();
    updated++;
    details.push({
      id: batch._id.toString(),
      batchNumber: doc.batchNumber || "N/A",
      action: `Migrated. currentStage: ${doc.currentStage}`
    });
  }
  return { updated, skipped, total: batches.length, details };
}
async function migrateRecipes() {
  const recipes = await Recipe.find({});
  let updated = 0;
  let skipped = 0;
  const details = [];
  for (const recipe of recipes) {
    const doc = recipe;
    const pipeline = doc.pipeline || [];
    if (!shouldMigrate(pipeline)) {
      skipped++;
      continue;
    }
    const before = [...pipeline];
    doc.pipeline = replacePipeline(pipeline);
    await recipe.save();
    updated++;
    details.push({
      id: recipe._id.toString(),
      name: doc.name || "Unknown",
      before,
      after: doc.pipeline
    });
  }
  return { updated, skipped, total: recipes.length, details };
}

export { migrateDistillingStages_post as default };
//# sourceMappingURL=migrate-distilling-stages.post.mjs.map
