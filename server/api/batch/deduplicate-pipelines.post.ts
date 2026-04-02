import { Batch } from "~/server/models/batch.schema";
import { Recipe } from "~/server/models/recipe.schema";

/**
 * One-time migration endpoint to deduplicate batch and recipe pipelines.
 * Removes duplicate stage entries while preserving order.
 * Safe to run multiple times — only updates documents with duplicate stages.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const batchResults = await deduplicateBatches();
	const recipeResults = await deduplicateRecipes();

	return {
		batches: batchResults,
		recipes: recipeResults,
	};
});

async function deduplicateBatches() {
	const batches = await Batch.find({});

	let updated = 0;
	const details: { id: string; before: string[]; after: string[] }[] = [];

	for (const batch of batches) {
		const doc = batch as any;
		const pipeline: string[] = doc.pipeline;
		if (!pipeline || pipeline.length === 0) continue;

		const deduped = deduplicate(pipeline);
		if (deduped.length === pipeline.length) continue;

		const before = [...pipeline];
		doc.pipeline = deduped;

		// Ensure currentStage is still valid
		if (doc.currentStage !== "Upcoming" && !deduped.includes(doc.currentStage)) {
			doc.currentStage = deduped[deduped.length - 1] || "Upcoming";
		}

		if (!doc.log) doc.log = [];
		doc.log.push({
			date: new Date(),
			action: "Pipeline deduplicated (migration)",
			details: `${before.join(" → ")} → ${deduped.join(" → ")}`,
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
	const details: { id: string; name: string; before: string[]; after: string[] }[] = [];

	for (const recipe of recipes) {
		const doc = recipe as any;
		const pipeline: string[] = doc.pipeline;
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

function deduplicate(pipeline: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const stage of pipeline) {
		if (!seen.has(stage)) {
			seen.add(stage);
			result.push(stage);
		}
	}
	return result;
}
