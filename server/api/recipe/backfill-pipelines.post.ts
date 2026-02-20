import { Recipe } from "~/server/models/recipe.schema";

/**
 * One-time migration endpoint to backfill pipeline field on existing recipes.
 * Maps recipe class → appropriate pipeline template.
 * Safe to run multiple times — only updates recipes without a pipeline.
 */
export default defineEventHandler(async (event) => {
	const PIPELINE_MAP: Record<string, string[]> = {
		'Whisky': ['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled'],
		'Brandy': ['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled'],
		'Rum': ['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled'],
		'Gin': ['Maceration', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
		'Liqueur/Cordial': ['Maceration', 'Filtering', 'Blending', 'Storage', 'Proofing', 'Bottled'],
		'Flavored Vodka': ['Maceration', 'Filtering', 'Storage', 'Proofing', 'Bottled'],
	};

	const DEFAULT_PIPELINE = ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'];

	// Find recipes that have no pipeline or an empty pipeline
	const recipes = await Recipe.find({
		$or: [
			{ pipeline: { $exists: false } },
			{ pipeline: { $size: 0 } },
			{ pipeline: null },
		],
	});

	let updated = 0;
	for (const recipe of recipes) {
		const recipeClass = recipe.class as string;
		const pipeline = PIPELINE_MAP[recipeClass] || DEFAULT_PIPELINE;

		// Determine template name for reference
		let templateName = 'Custom';
		if (['Whisky', 'Brandy', 'Rum'].includes(recipeClass)) {
			templateName = 'Grain Spirit (Barreled)';
		} else if (recipeClass === 'Gin') {
			// Check type for redistilled vs compounded
			const recipeType = recipe.type as string;
			if (recipeType?.toLowerCase().includes('compounded')) {
				templateName = 'Compounded Gin';
				recipe.pipeline = ['Maceration', 'Filtering', 'Storage', 'Proofing', 'Bottled'];
			} else {
				templateName = 'Redistilled Gin';
			}
		} else if (recipeClass === 'Liqueur/Cordial') {
			templateName = 'Liqueur/Cordial';
		} else if (recipeClass === 'Flavored Vodka') {
			templateName = 'Compounded Gin';
		} else if (['Neutral Spirits or Alcohol'].includes(recipeClass)) {
			templateName = 'Grain Spirit (Unbarreled)';
		}

		if (!recipe.pipeline || recipe.pipeline.length === 0) {
			recipe.pipeline = pipeline;
		}
		recipe.pipelineTemplate = templateName;
		await recipe.save();
		updated++;
	}

	return { updated, total: recipes.length };
});
