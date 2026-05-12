import { d as defineEventHandler, k as requireRole, o as runOnceMigration, R as Recipe } from '../../../nitro/nitro.mjs';
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

const backfillPipelines_post = defineEventHandler(async (event) => {
  await requireRole(event, "Admin");
  const outcome = await runOnceMigration("backfill-recipe-pipelines", async () => {
    return await backfillPipelines();
  });
  if (outcome.alreadyApplied) {
    return {
      alreadyApplied: true,
      message: "Migration backfill-recipe-pipelines has already been applied.",
      appliedAt: outcome.appliedAt
    };
  }
  return outcome.result;
});
async function backfillPipelines() {
  const PIPELINE_MAP = {
    "Whisky": ["Mashing", "Fermenting", "Distilling", "Barrel Aging", "Storage", "Proofing", "Bottled"],
    "Brandy": ["Mashing", "Fermenting", "Distilling", "Barrel Aging", "Storage", "Proofing", "Bottled"],
    "Rum": ["Mashing", "Fermenting", "Distilling", "Barrel Aging", "Storage", "Proofing", "Bottled"],
    "Gin": ["Maceration", "Distilling", "Storage", "Proofing", "Bottled"],
    "Liqueur/Cordial": ["Maceration", "Filtering", "Blending", "Storage", "Proofing", "Bottled"],
    "Flavored Vodka": ["Maceration", "Filtering", "Storage", "Proofing", "Bottled"]
  };
  const DEFAULT_PIPELINE = ["Mashing", "Fermenting", "Distilling", "Storage", "Proofing", "Bottled"];
  const recipes = await Recipe.find({
    $or: [
      { pipeline: { $exists: false } },
      { pipeline: { $size: 0 } },
      { pipeline: null }
    ]
  });
  let updated = 0;
  for (const recipe of recipes) {
    const recipeClass = recipe.class;
    const pipeline = PIPELINE_MAP[recipeClass] || DEFAULT_PIPELINE;
    let templateName = "Custom";
    if (["Whisky", "Brandy", "Rum"].includes(recipeClass)) {
      templateName = "Grain Spirit (Barreled)";
    } else if (recipeClass === "Gin") {
      const recipeType = recipe.type;
      if (recipeType == null ? void 0 : recipeType.toLowerCase().includes("compounded")) {
        templateName = "Compounded Gin";
        recipe.pipeline = ["Maceration", "Filtering", "Storage", "Proofing", "Bottled"];
      } else {
        templateName = "Redistilled Gin";
      }
    } else if (recipeClass === "Liqueur/Cordial") {
      templateName = "Liqueur/Cordial";
    } else if (recipeClass === "Flavored Vodka") {
      templateName = "Compounded Gin";
    } else if (["Neutral Spirits or Alcohol"].includes(recipeClass)) {
      templateName = "Grain Spirit (Unbarreled)";
    }
    if (!recipe.pipeline || recipe.pipeline.length === 0) {
      recipe.pipeline = pipeline;
    }
    recipe.pipelineTemplate = templateName;
    await recipe.save();
    updated++;
  }
  return { updated, total: recipes.length };
}

export { backfillPipelines_post as default };
//# sourceMappingURL=backfill-pipelines.post.mjs.map
