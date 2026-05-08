# GDC Recipes

Templates that drive Batch creation. A recipe defines ingredients, target ABV, expected pipeline, and bulk-spirit inputs.

## Schema (`server/models/recipe.schema.ts`)

```
name             String (required, indexed)
class            String (required, indexed)   — Whiskey, Gin, Vodka, Rum, etc.
type             String (indexed)             — sub-style
volume           Number (required)            — target batch volume
volumeUnit       String (required)
items            [{ _id: ObjectId, amount, unit }]      — raw materials (Items)
bulkSpirits      [{ bulkSpirit: ObjectId→BulkSpirit, volume, volumeUnit }]
directions       String
notes            String
targetAbv        Number
macerationDays   Number
pipeline         String[] (required)          — stage sequence; default ['Mashing','Fermenting','Distilling','Storage','Proofing','Bottled']
pipelineTemplate String                       — optional named template (see batchPipeline.ts)
```

`items` references Item by `_id` (not `item` — historical naming).

## TypeScript interface (`types/interfaces/Recipe.ts`)

Mirrors schema with `RecipeBulkSpirit` sub-interface.

## Pipeline templates (`composables/batchPipeline.ts`)

Pre-built named pipelines:
- "Grain Spirit Barreled"
- "Grain Spirit Unbarreled"
- "Neutral Spirit"
- "Redistilled Gin"
- "Macerated Gin"
- "Rum"
- (others — check `PIPELINE_TEMPLATES` constant)

Recipes pick one and the batch inherits it. `POST /api/recipe/backfill-pipelines` is an Admin migration that retroactively assigns templates by `class`.

## Files

| File | Role |
|---|---|
| `server/models/recipe.schema.ts` | Schema |
| `types/interfaces/Recipe.ts` | TS interface |
| `server/api/recipe/{index,[_id],create}.{get,post,put,delete}.ts` | CRUD |
| `server/api/recipe/backfill-pipelines.post.ts` | Admin migration |
| `stores/useRecipeStore.ts` (33 LOC) | Thinnest store — pure CRUD |
| `composables/useIngredientResolver.ts` | Resolve item ids → names + costs (works for items OR bottles as ingredients) |
| `composables/useRecipeColors.ts` | Color scheme per recipe class for charts/UI |
| `components/Panel/PanelRecipe.vue` | Edit form (slide-over) |
| `components/Recipe/RecipePipelineBuilder.vue` | Visual pipeline editor |
| `components/Table/TableRecipes.vue` | List view |
| `components/Batch/BatchRecipeCard.vue`, `BatchRecipeLegend.vue` | Display recipe within batch context |
| `pages/admin/recipes/{index,[_id]}.vue` | List + detail |

## Cost calculation

`utils/helpers.ts.recipePrice(recipe, items, purchaseOrders)`:
- Iterates `recipe.items`, looks up each Item's latest cost
- Sums based on `amount * unit`
- Adds bulk spirit costs via `bulkSpiritIngredientCost()`

`composables/useIngredientResolver.ts.totalIngredientCost()` is the reactive equivalent for components.

## Bulk spirits as ingredients

A recipe can require pre-distilled bulk spirit as input (e.g. a gin redistillation needs neutral spirit base). Each `recipe.bulkSpirits` entry pulls from the BulkSpirit ledger when the batch is created (via `useBatchStore.withdrawBulkSpirits()`).

## Common operations

### Adding a new recipe class

1. Add to `LIQUOR_CLASSES` in `composables/definitions.ts`
2. Optional: add a color to `useRecipeColors`
3. Optional: add a pipeline template to `PIPELINE_TEMPLATES` in `composables/batchPipeline.ts`
4. Run `POST /api/recipe/backfill-pipelines` to assign to existing recipes (Admin)

### Creating a batch from a recipe

`useBatchStore.createBatch({ recipe, batchSize, batchSizeUnit })` copies `recipe.pipeline` to `batch.pipeline`, computes initial `recipeCost`, sets `currentStage` to `'Upcoming'` and `status` to `'active'`.

## Related

- See `batches.md` for what happens after a recipe becomes a batch
- See `inventory.md` for how Item ingredients are deducted on stage advancement
