# GDC Cocktails

Tasting room cocktail menu. Recipes with ingredients, glassware, prep, and pricing.

## Schema (`server/models/cocktail.schema.ts`)

```
name         String (required)
glassware    String (required)        — e.g. "rocks", "coupe", "highball"
ingredients  [{ item: ObjectId, amount: Number, unit: String,
                sourceType: enum 'item'|'bottle' (default 'item') }]
cost         Number                   — calculated from ingredients (optional)
price        Number (required)        — retail price
menu         String                   — menu category/name
description  String
directions   String (required)
preparation  String (trimmed)
visible      Boolean (required, indexed)  — show on public menu?
img          String                   — Cloudinary URL
```

## TypeScript interface (`types/interfaces/Cocktail.ts`)

Mirrors schema with `CocktailIngredient` sub-interface. Public DTO (`PublicCocktail.ts`) replaces `ingredient.item: ObjectId` with `ingredient.name: string` for the public menu.

## Files

| File | Role |
|---|---|
| `server/models/cocktail.schema.ts` | Schema |
| `types/interfaces/Cocktail.ts`, `PublicCocktail.ts` | Interfaces |
| `server/api/cocktail/{index,[id],create}.{get,post,put,delete}.ts` | CRUD via factory |
| `server/api/cocktail/public.get.ts` | 300s SWR; resolves ingredient.item ObjectIds → names via batch Item/Bottle lookup |
| `stores/useCocktailStore.ts` (87 LOC) | `search()`, `toggleVisibility()`, `cocktailCost()` |
| `stores/usePublicCocktailStore.ts` (56 LOC) | Public read-only; client-side `search()` (name, description, menu, ingredient names) |
| `composables/useIngredientResolver.ts` | Resolve `ingredient.item` for both `sourceType: 'item'` (Item) and `'bottle'` (Bottle) |
| `composables/useCocktailOptions.ts` | Glassware, garnish, prep dropdown options |
| `composables/definitions.ts` | `estimateCocktailPrice()` markup helper |
| `components/Cocktail/CocktailCard.vue`, `CocktailCardGrid.vue` | Admin grid |
| `components/Card/CardCocktail.vue` | Public-facing card (used on home + menu pages) |
| `components/Panel/PanelCocktail.vue` | Edit form |
| `components/Table/TableCocktails.vue`, `TableCocktailExpand.vue` | List view + expandable detail row |
| `components/Site/SiteFeaturedCocktails.vue` | Home page rotating featured |
| `components/Site/Menu/SiteMenuMain.vue` | ⚠️ unused (legacy) |
| `pages/admin/cocktails/{index,grid,[_id]}.vue` | List (table OR grid) + detail |
| `pages/menu.vue`, `menu/{index,[_id]}.vue` | Public menu |

## Ingredient resolution (the dual-source pattern)

```ts
ingredient.sourceType === 'item'    → ingredient.item references Item._id
ingredient.sourceType === 'bottle'  → ingredient.item references Bottle._id
```

`useIngredientResolver` switches lookup based on `sourceType`:
- For items: fetches name + cost from `useItemStore`
- For bottles: fetches name + price from `useBottleStore`

This lets cocktails reference both raw inputs (lime juice, simple syrup) AND finished spirits (your own Gin).

## Public menu page (`pages/menu/index.vue`)

Uses `usePublicCocktailStore.cocktails` — server-resolved with ingredient names already populated. No further ObjectId lookups needed client-side. SWR cache 300s.

## Featured cocktails (home page)

`Site/SiteFeaturedCocktails.vue` uses `utils/seededShuffle.ts` for daily-rotating selection from visible cocktails — same set per day, different across days.

## Cost calculation

Optional `cost` field is meant for management (target margin). Computed via `useCocktailStore.cocktailCost()`:
- Sums `useIngredientResolver.totalIngredientCost(cocktail.ingredients)` (per ingredient: `amount * unitCost`)

Not auto-stored; admin manually updates `cost` field if they want to track it.

## Visibility toggle

`visible: false` hides from public menu without deleting. Use `cocktailStore.toggleVisibility(id)` from admin UI.

## Cocktail menu skill

The repo has a separate `cocktail-menu` skill (`.claude/skills/cocktail-menu/`) that uses sales data and menu theory to plan/optimize the menu. That skill is for menu strategy; this file (`gdc cocktails`) is for code/data structure.

## Common operations

### Adding a new cocktail

1. POST `/api/cocktail/create` with name, glassware, price, directions, ingredients[]
2. Each ingredient: `{ item: ObjectId, amount, unit, sourceType }`
3. Set `visible: true` to show on public menu
4. Optional: upload `img` via `/api/upload`
