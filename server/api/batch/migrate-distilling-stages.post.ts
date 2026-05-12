import { Batch } from "~/server/models/batch.schema";
import { Recipe } from "~/server/models/recipe.schema";

/**
 * Migration endpoint: splits the "Distilling" stage into Stripping Run / Low Wines / Spirit Run
 * for grain spirit and neutral spirit batches. Redistilled Gin batches keep "Distilling".
 *
 * Safe to run multiple times (idempotent) — skips batches already migrated.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const outcome = await runOnceMigration('migrate-distilling-stages', async () => {
		const batchResults = await migrateBatches();
		const recipeResults = await migrateRecipes();
		return { batches: batchResults, recipes: recipeResults };
	});

	if (outcome.alreadyApplied) {
		return {
			alreadyApplied: true,
			message: 'Migration migrate-distilling-stages has already been applied.',
			appliedAt: outcome.appliedAt,
		};
	}
	return outcome.result;
});

const NEW_STAGES = ["Stripping Run", "Low Wines", "Spirit Run"];

function shouldMigrate(pipeline: string[]): boolean {
	// Only migrate pipelines that have "Distilling" and are NOT redistilled gin type
	// (Redistilled Gin starts with Maceration -> Distilling)
	if (!pipeline.includes("Distilling")) return false;
	// Already migrated
	if (pipeline.includes("Stripping Run") || pipeline.includes("Spirit Run")) return false;
	// Skip redistilled gin — pipeline starts with Maceration then Distilling
	const distIdx = pipeline.indexOf("Distilling");
	if (distIdx > 0 && pipeline[distIdx - 1] === "Maceration") return false;
	return true;
}

function replacePipeline(pipeline: string[]): string[] {
	const idx = pipeline.indexOf("Distilling");
	if (idx < 0) return pipeline;
	return [...pipeline.slice(0, idx), ...NEW_STAGES, ...pipeline.slice(idx + 1)];
}

async function migrateBatches() {
	const batches = await Batch.find({});

	let updated = 0;
	let skipped = 0;
	const details: { id: string; batchNumber: string; action: string }[] = [];

	for (const batch of batches) {
		const doc = batch as any;
		const pipeline: string[] = doc.pipeline || [];

		if (!shouldMigrate(pipeline)) {
			skipped++;
			continue;
		}

		const oldPipeline = [...pipeline];
		doc.pipeline = replacePipeline(pipeline);

		// Migrate stage data from distilling to new stages
		const distillingData = doc.stages?.distilling;
		if (distillingData) {
			const runs = distillingData.runs || [];
			const strippingRuns = runs.filter((r: any) => r.runType === 'stripping');
			const spiritRuns = runs.filter((r: any) => r.runType === 'spirit');

			// Populate strippingRun stage
			if (strippingRuns.length > 0) {
				doc.stages.strippingRun = {
					startedAt: distillingData.startedAt,
					vessel: distillingData.vessel,
					notes: distillingData.notes,
					runs: strippingRuns,
				};

				// Calculate low wines from stripping output
				let lowWinesVol = 0;
				let lowWinesAbvWeighted = 0;
				for (const run of strippingRuns) {
					const vol = run.output?.volume || run.total?.volume || 0;
					const abv = run.output?.abv || run.total?.abv || 0;
					lowWinesVol += vol;
					lowWinesAbvWeighted += vol * abv;
				}
				const lowWinesAbv = lowWinesVol > 0 ? lowWinesAbvWeighted / lowWinesVol : 0;

				doc.stages.lowWines = {
					startedAt: distillingData.startedAt,
					volume: lowWinesVol,
					volumeUnit: strippingRuns[0]?.output?.volumeUnit || 'gallon',
					abv: lowWinesAbv,
					sourceRuns: strippingRuns.length,
				};
				if (strippingRuns.every((r: any) => r.completed)) {
					doc.stages.strippingRun.completedAt = new Date();
				}
			}

			// Populate spiritRun stage
			if (spiritRuns.length > 0) {
				doc.stages.spiritRun = {
					startedAt: spiritRuns[0]?.date || distillingData.startedAt,
					vessel: distillingData.vessel,
					runs: spiritRuns,
				};
				if (spiritRuns.every((r: any) => r.completed)) {
					doc.stages.spiritRun.completedAt = new Date();
				}
				if (doc.stages.lowWines) {
					doc.stages.lowWines.completedAt = new Date();
				}
			}
		}

		// Update stageVolumes: move "Distilling" volume to appropriate new stage
		if (doc.stageVolumes?.get?.('Distilling') != null || doc.stageVolumes?.Distilling != null) {
			const distVol = doc.stageVolumes?.get?.('Distilling') ?? doc.stageVolumes?.Distilling ?? 0;
			const hasSpirit = (doc.stages?.spiritRun?.runs || []).length > 0;
			const hasStripping = (doc.stages?.strippingRun?.runs || []).length > 0;
			const spiritComplete = hasSpirit && (doc.stages?.spiritRun?.runs || []).every((r: any) => r.completed);

			if (spiritComplete) {
				// Distilling is done — volume should already be in the next stage
			} else if (hasSpirit) {
				doc.stageVolumes?.set?.('Spirit Run', distVol) ?? (doc.stageVolumes['Spirit Run'] = distVol);
			} else if (hasStripping) {
				doc.stageVolumes?.set?.('Low Wines', distVol) ?? (doc.stageVolumes['Low Wines'] = distVol);
			} else {
				doc.stageVolumes?.set?.('Stripping Run', distVol) ?? (doc.stageVolumes['Stripping Run'] = distVol);
			}
			if (doc.stageVolumes?.delete) {
				doc.stageVolumes.delete('Distilling');
			} else {
				delete doc.stageVolumes.Distilling;
			}
		}

		// Update currentStage
		if (doc.currentStage === 'Distilling') {
			const hasSpirit = (doc.stages?.spiritRun?.runs || []).length > 0;
			const hasStripping = (doc.stages?.strippingRun?.runs || []).length > 0;
			const spiritComplete = hasSpirit && (doc.stages?.spiritRun?.runs || []).every((r: any) => r.completed);

			if (spiritComplete) {
				doc.currentStage = 'Spirit Run';
			} else if (hasSpirit) {
				doc.currentStage = 'Spirit Run';
			} else if (hasStripping) {
				doc.currentStage = 'Low Wines';
			} else {
				doc.currentStage = 'Stripping Run';
			}
		}

		// Log the migration
		if (!doc.log) doc.log = [];
		doc.log.push({
			date: new Date(),
			action: "Distilling stage migrated to Stripping Run / Low Wines / Spirit Run",
			details: `Pipeline: ${oldPipeline.join(" → ")} → ${doc.pipeline.join(" → ")}`,
		});

		await batch.save();
		updated++;
		details.push({
			id: batch._id.toString(),
			batchNumber: doc.batchNumber || 'N/A',
			action: `Migrated. currentStage: ${doc.currentStage}`,
		});
	}

	return { updated, skipped, total: batches.length, details };
}

async function migrateRecipes() {
	const recipes = await Recipe.find({});

	let updated = 0;
	let skipped = 0;
	const details: { id: string; name: string; before: string[]; after: string[] }[] = [];

	for (const recipe of recipes) {
		const doc = recipe as any;
		const pipeline: string[] = doc.pipeline || [];

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
			name: doc.name || 'Unknown',
			before,
			after: doc.pipeline,
		});
	}

	return { updated, skipped, total: recipes.length, details };
}
