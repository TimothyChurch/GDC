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

const deduplicatePipelines_post = defineEventHandler(async (event) => {
  await requireRole(event, "Admin");
  const batchResults = await deduplicateBatches();
  const recipeResults = await deduplicateRecipes();
  return {
    batches: batchResults,
    recipes: recipeResults
  };
});
async function deduplicateBatches() {
  const batches = await Batch.find({});
  let updated = 0;
  const details = [];
  for (const batch of batches) {
    const doc = batch;
    const pipeline = doc.pipeline;
    if (!pipeline || pipeline.length === 0) continue;
    const deduped = deduplicate(pipeline);
    if (deduped.length === pipeline.length) continue;
    const before = [...pipeline];
    doc.pipeline = deduped;
    if (doc.currentStage !== "Upcoming" && !deduped.includes(doc.currentStage)) {
      doc.currentStage = deduped[deduped.length - 1] || "Upcoming";
    }
    if (!doc.log) doc.log = [];
    doc.log.push({
      date: /* @__PURE__ */ new Date(),
      action: "Pipeline deduplicated (migration)",
      details: `${before.join(" \u2192 ")} \u2192 ${deduped.join(" \u2192 ")}`
    });
    await batch.save();
    updated++;
    details.push({ id: batch._id.toString(), before, after: deduped });
  }
  return { updated, total: batches.length, details };
}
async function deduplicateRecipes() {
  const recipes = await Recipe.find({});
  let updated = 0;
  const details = [];
  for (const recipe of recipes) {
    const doc = recipe;
    const pipeline = doc.pipeline;
    if (!pipeline || pipeline.length === 0) continue;
    const deduped = deduplicate(pipeline);
    if (deduped.length === pipeline.length) continue;
    const before = [...pipeline];
    doc.pipeline = deduped;
    await recipe.save();
    updated++;
    details.push({ id: recipe._id.toString(), name: doc.name, before, after: deduped });
  }
  return { updated, total: recipes.length, details };
}
function deduplicate(pipeline) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const stage of pipeline) {
    if (!seen.has(stage)) {
      seen.add(stage);
      result.push(stage);
    }
  }
  return result;
}

export { deduplicatePipelines_post as default };
//# sourceMappingURL=deduplicate-pipelines.post.mjs.map
