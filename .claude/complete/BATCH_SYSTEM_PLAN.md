# Batch Lifecycle System Redesign

## Comprehensive Plan for GDC Distillery Management

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Batch Pathways](#2-batch-pathways)
3. [Architecture: Recipe-Driven Pipelines](#3-architecture-recipe-driven-pipelines)
4. [Data Model Changes](#4-data-model-changes)
5. [Stage Definitions & Tracking Requirements](#5-stage-definitions--tracking-requirements)
6. [Implementation Plan](#6-implementation-plan)
7. [UI/UX Design](#7-uiux-design)
8. [Migration Strategy](#8-migration-strategy)

---

## 1. Problem Statement

The current batch system assumes a single linear pipeline:

```
Upcoming → Brewing → Fermenting → Distilling → Storage → Barreled → Bottled
```

This doesn't reflect reality. GDC makes multiple spirit categories that follow different production paths. Additionally, the current stage data structures are thin — they lack critical fields for production tracking, TTB compliance, and quality control.

### Current Limitations

- **Hardcoded linear pipeline** — `BATCH_STAGES` is a fixed array; every batch must traverse every stage
- **No recipe-to-pipeline mapping** — recipes don't define which stages they require
- **Missing stages** — no support for maceration/botanical infusion, filtering, blending, or proofing
- **Thin stage data** — brewing has just vessel/date/notes; distilling lacks temperature tracking; no pH or gravity on mash
- **No "Storage" data structure** — the schema has a `storage` status but no corresponding data fields
- **Single barrel support** — `barreled` only tracks one barrel; blending across barrels isn't modeled
- **No proofing stage** — water addition to target proof is a critical step with no tracking
- **No batch log/timeline** — no way to see a chronological history of all actions on a batch

---

## 2. Batch Pathways

### Pathway 1: Grain-to-Glass (Whiskey, Bourbon, Rye)
```
Mash → Ferment → Distill → Barrel → Storage → Proof → Bottle
```

### Pathway 2: Grain-to-Glass, Unbarreled (Vodka, Moonshine, White Whiskey)
```
Mash → Ferment → Distill → Storage → Proof → Bottle
```

### Pathway 3: Redistilled Gin
```
Macerate (botanicals + neutral spirit) → Redistill → Storage → Proof → Bottle
```

### Pathway 4: Compounded/Filtered Gin
```
Macerate (botanicals + neutral spirit) → Filter → Storage → Proof → Bottle
```

### Pathway 5: Liqueurs/Cordials
```
Macerate (flavor ingredients + base spirit) → Filter → Sweeten/Blend → Proof → Bottle
```

### Pathway 6: Rum (future)
```
Mash → Ferment → Distill → Barrel → Storage → Proof → Bottle
```

### Key Observations
- **Mash**, **Ferment**, **Distill** always appear together (grain spirits)
- **Macerate** replaces Mash+Ferment for gin/liqueur production
- **Barrel** is optional (whiskey yes, vodka no, gin no)
- **Filter** is optional but common for gin and vodka
- **Proof** (water addition to target ABV) applies to virtually everything
- **Storage** appears in every pathway (holding tank between operations)
- **Bottle** is the universal terminal stage
- **Blend** may occur at various points (blending barrels, blending batches)

---

## 3. Architecture: Recipe-Driven Pipelines

### Core Concept: Recipes Define Pipelines

Each recipe will declare an ordered list of **stages** that batches of that recipe must follow. When a batch is created from a recipe, it inherits the pipeline. The batch then progresses through only those stages.

### Stage Registry

Define all possible stages as a canonical set:

```typescript
export const ALL_STAGES = [
  'Upcoming',    // Planned, not yet started
  'Mashing',     // Grain mashing (renamed from "Brewing" for accuracy)
  'Fermenting',  // Yeast fermentation
  'Distilling',  // Still run(s)
  'Maceration',  // Botanical/flavor infusion
  'Filtering',   // Charcoal, chill, or other filtration
  'Barrel Aging', // Oak barrel maturation (renamed from "Barreled")
  'Storage',     // Holding in tank/vessel
  'Blending',    // Combining spirits from multiple sources
  'Proofing',    // Water addition to target ABV
  'Bottled',     // Terminal — linked to production record
] as const;
```

### Pipeline Templates

Pre-defined templates that can be selected when creating a recipe:

```typescript
export const PIPELINE_TEMPLATES = {
  'Grain Spirit (Barreled)': ['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled'],
  'Grain Spirit (Unbarreled)': ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
  'Redistilled Gin': ['Maceration', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
  'Compounded Gin': ['Maceration', 'Filtering', 'Storage', 'Proofing', 'Bottled'],
  'Liqueur/Cordial': ['Maceration', 'Filtering', 'Blending', 'Storage', 'Proofing', 'Bottled'],
  'Custom': [], // user picks stages manually
};
```

### How It Works

1. **Recipe creation** — user selects a pipeline template (or builds custom), which populates `recipe.pipeline`
2. **Batch creation** — batch copies `recipe.pipeline` into `batch.pipeline`
3. **Batch detail page** — stepper shows only the stages in `batch.pipeline`
4. **Advance action** — next stage is determined by `batch.pipeline[currentIndex + 1]`, not by a global constant
5. **Dashboard pipeline widget** — groups batches by their current stage (across all pipeline types)

---

## 4. Data Model Changes

### 4.1 Recipe — Add Pipeline

```typescript
// types/interfaces/Recipe.ts — additions
export interface Recipe {
  // ... existing fields ...
  pipeline: string[];          // Ordered array of stage names from ALL_STAGES
  pipelineTemplate?: string;   // Which template was used (for reference)
}
```

**Schema addition** (`server/models/recipe.schema.ts`):
```javascript
pipeline: {
  type: [String],
  required: true,
  default: ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
},
pipelineTemplate: String,
```

### 4.2 Batch — Major Restructure

The current approach of having top-level named fields (`brewing`, `fermenting`, `distilling`, `barreled`, `bottled`) is rigid. Instead, introduce a **`stages` map** keyed by stage name, where each value contains stage-specific data. The batch also stores its own `pipeline` (copied from recipe at creation).

```typescript
// types/interfaces/Batch.ts — new structure

export interface BatchStageBase {
  startedAt?: Date;
  completedAt?: Date;
  vessel?: string;       // ObjectId ref to Vessel
  notes?: string;
}

export interface MashingStage extends BatchStageBase {
  strikeWaterVolume?: number;
  strikeWaterVolumeUnit?: string;
  strikeWaterTemp?: number;
  strikeWaterTempUnit?: string;
  mashTemp?: number;
  mashTempUnit?: string;
  mashDuration?: number;        // minutes
  pH?: number;
  preBoilGravity?: number;
  postBoilGravity?: number;
}

export interface FermentingStage extends BatchStageBase {
  yeastStrain?: string;
  pitchTemp?: number;
  pitchTempUnit?: string;
  readings: {
    date: Date;
    temperature: number;
    temperatureUnit: string;
    gravity: number;
    pH?: number;
    notes?: string;
  }[];
  originalGravity?: number;
  finalGravity?: number;
  estimatedAbv?: number;
  washVolume?: number;
  washVolumeUnit?: string;
}

export interface DistillingStage extends BatchStageBase {
  runType?: 'stripping' | 'spirit' | 'single';   // stripping run vs spirit run
  runNumber?: number;                               // for multiple runs
  chargeVolume?: number;
  chargeVolumeUnit?: string;
  chargeAbv?: number;
  additions: {
    tails: {
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
    feints?: {
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
  };
  collected: {
    foreshots?: {
      vessel?: string;
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
    heads: {
      vessel?: string;
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
    hearts: {
      vessel?: string;
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
    tails: {
      vessel?: string;
      volume?: number;
      volumeUnit?: string;
      abv?: number;
    };
    total: {
      volume?: number;
      volumeUnit?: string;
      abv?: number;
      proofGallons?: number;   // critical for TTB
    };
  };
  temperatures?: {
    time: Date;
    location: string;          // 'column top', 'condenser out', etc.
    value: number;
    unit: string;
  }[];
}

export interface MacerationStage extends BatchStageBase {
  baseSpirit: {
    source?: string;           // where the neutral spirit came from (batch ID or description)
    volume?: number;
    volumeUnit?: string;
    abv?: number;
  };
  botanicals: {
    item?: string;             // ObjectId ref to Item
    name?: string;             // fallback display name
    weight?: number;
    weightUnit?: string;
  }[];
  method?: 'direct' | 'vapor basket' | 'both';
  startDate?: Date;
  endDate?: Date;
  temperature?: number;
  temperatureUnit?: string;
  duration?: number;           // hours
}

export interface FilteringStage extends BatchStageBase {
  method?: string;             // 'charcoal', 'chill', 'plate', 'gravity', etc.
  preVolume?: number;
  preVolumeUnit?: string;
  preAbv?: number;
  postVolume?: number;
  postVolumeUnit?: string;
  postAbv?: number;
  filterMedia?: string;        // description of filter media used
  passes?: number;             // number of filter passes
}

export interface BarrelAgingStage extends BatchStageBase {
  barrelType?: string;         // 'new charred oak', 'used bourbon', 'port cask', etc.
  barrelSize?: string;         // '53 gal', '30 gal', '15 gal', etc.
  charLevel?: string;          // '#1', '#2', '#3', '#4', 'alligator'
  previousUse?: string;        // what was in the barrel before
  warehouseLocation?: string;  // rick/tier/position
  entry: {
    date?: Date;
    volume?: number;
    volumeUnit?: string;
    abv?: number;
    proofGallons?: number;
  };
  exit: {
    date?: Date;
    volume?: number;
    volumeUnit?: string;
    abv?: number;
    proofGallons?: number;
  };
  samplings?: {
    date: Date;
    abv?: number;
    volume?: number;
    volumeUnit?: string;
    notes?: string;
  }[];
  targetAge?: number;          // months
}

export interface StorageStage extends BatchStageBase {
  volume?: number;
  volumeUnit?: string;
  abv?: number;
  proofGallons?: number;
}

export interface BlendingStage extends BatchStageBase {
  components: {
    source: string;            // batch ID or description
    volume?: number;
    volumeUnit?: string;
    abv?: number;
  }[];
  resultVolume?: number;
  resultVolumeUnit?: string;
  resultAbv?: number;
}

export interface ProofingStage extends BatchStageBase {
  startAbv?: number;
  targetAbv?: number;
  startVolume?: number;
  startVolumeUnit?: string;
  waterAdded?: number;
  waterAddedUnit?: string;
  finalVolume?: number;
  finalVolumeUnit?: string;
  finalAbv?: number;
  finalProofGallons?: number;
  waterSource?: string;        // 'RO', 'distilled', 'municipal', etc.
}

export interface BottledStage extends BatchStageBase {
  productionRecord?: string;   // ObjectId ref to Production
  bottleCount?: number;
  bottleSize?: string;
  lotNumber?: string;
  labeledAbv?: number;
}

export type BatchStageData =
  | MashingStage
  | FermentingStage
  | DistillingStage
  | MacerationStage
  | FilteringStage
  | BarrelAgingStage
  | StorageStage
  | BlendingStage
  | ProofingStage
  | BottledStage;

export interface Batch {
  _id: string;
  batchNumber?: string;
  recipe: string;              // ObjectId ref to Recipe
  pipeline: string[];          // Ordered stage names (copied from recipe)
  currentStage: string;        // Current active stage name
  status: 'active' | 'completed' | 'cancelled';
  batchSize: number;
  batchSizeUnit: string;
  recipeCost: number;
  batchCost?: number;
  notes?: string;

  // Stage data map — only stages in pipeline will have entries
  stages: {
    mashing?: MashingStage;
    fermenting?: FermentingStage;
    distilling?: DistillingStage;
    maceration?: MacerationStage;
    filtering?: FilteringStage;
    barrelAging?: BarrelAgingStage;
    storage?: StorageStage;
    blending?: BlendingStage;
    proofing?: ProofingStage;
    bottled?: BottledStage;
  };

  // Activity log — chronological record of all actions
  log?: {
    date: Date;
    action: string;            // 'created', 'advanced to Fermenting', 'reading added', etc.
    user?: string;             // who performed the action
    details?: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
}
```

### 4.3 Stage Key Mapping

```typescript
// composables/batchPipeline.ts

export const STAGE_KEY_MAP: Record<string, keyof Batch['stages']> = {
  'Mashing': 'mashing',
  'Fermenting': 'fermenting',
  'Distilling': 'distilling',
  'Maceration': 'maceration',
  'Filtering': 'filtering',
  'Barrel Aging': 'barrelAging',
  'Storage': 'storage',
  'Blending': 'blending',
  'Proofing': 'proofing',
  'Bottled': 'bottled',
};

export const STAGE_DISPLAY: Record<string, { icon: string; color: string }> = {
  'Upcoming':     { icon: 'i-lucide-calendar-clock', color: 'blue' },
  'Mashing':      { icon: 'i-lucide-flame', color: 'orange' },
  'Fermenting':   { icon: 'i-lucide-beaker', color: 'yellow' },
  'Distilling':   { icon: 'i-lucide-flask-conical', color: 'copper' },
  'Maceration':   { icon: 'i-lucide-leaf', color: 'emerald' },
  'Filtering':    { icon: 'i-lucide-filter', color: 'sky' },
  'Barrel Aging': { icon: 'i-lucide-cylinder', color: 'amber' },
  'Storage':      { icon: 'i-lucide-warehouse', color: 'purple' },
  'Blending':     { icon: 'i-lucide-git-merge', color: 'pink' },
  'Proofing':     { icon: 'i-lucide-droplets', color: 'cyan' },
  'Bottled':      { icon: 'i-lucide-wine', color: 'green' },
};
```

---

## 5. Stage Definitions & Tracking Requirements

### 5.1 Mashing (renamed from "Brewing")

**What happens:** Grain is mixed with hot water ("strike water") to convert starches to fermentable sugars. The resulting liquid ("wort" or "mash") is then transferred to a fermenter.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel | Which mash tun was used |
| Start date | When mashing began |
| Strike water volume + temp | Critical for conversion |
| Mash temperature | Determines fermentable sugar profile |
| Mash duration | How long conversion ran |
| pH | Important for enzyme activity |
| Pre-boil gravity | SG reading before boil (if applicable) |
| Post-boil gravity | SG reading after boil |
| Notes | Observations, issues, deviations |

**TTB relevance:** Materials used and quantities feed into Form 5110.11 (Production Report).

### 5.2 Fermenting

**What happens:** Yeast is added to convert sugars to alcohol. Takes 3-14 days depending on recipe.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel | Which fermenter |
| Yeast strain | Which yeast was pitched |
| Pitch temperature | Temp when yeast was added |
| Time-series readings | Date, gravity, temperature, pH — track fermentation curve |
| Original gravity (OG) | Starting gravity |
| Final gravity (FG) | Ending gravity |
| Estimated ABV | Calculated from OG/FG |
| Wash volume | Volume going to still |
| Notes | Off-flavors, stuck fermentation, interventions |

**TTB relevance:** Fermented material volume and composition for production report.

### 5.3 Distilling

**What happens:** Fermented wash (or macerated spirit) is heated in a still. Alcohol vapors are collected and condensed. The distillate is separated into fractions (heads, hearts, tails).

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel (still) | Which still was used |
| Run type | Stripping run vs spirit run (some spirits require multiple distillations) |
| Run number | Which run this is (1st, 2nd, etc.) |
| Charge volume + ABV | What went into the still |
| Tails/feints added back | Recycled material from previous runs |
| Foreshots | First dangerous cut (methanol-heavy, discarded) |
| Heads (vessel, volume, ABV) | Light congeners — saved or discarded |
| Hearts (vessel, volume, ABV) | The good stuff |
| Tails (vessel, volume, ABV) | Heavy congeners — often recycled |
| Total collected (volume, ABV, proof gallons) | Summary of all collected |
| Temperature readings | Column/vapor/condenser temps over time |
| Notes | Cut decisions, observations |

**TTB relevance:** Proof gallons produced is the primary metric for Form 5110.11. Heads/tails disposition matters.

### 5.4 Maceration

**What happens:** Botanicals (or other flavor ingredients) are steeped in a base spirit. Used for gin, liqueurs, and flavored spirits.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel | Maceration vessel/tank |
| Base spirit (source, volume, ABV) | What neutral/base spirit is being used |
| Botanical bill | List of botanicals with weights |
| Method | Direct maceration vs vapor basket vs both |
| Start/end dates | Duration of maceration |
| Temperature | Some macerations are temperature-controlled |
| Duration (hours) | Total steep time |
| Notes | Color changes, aroma observations |

**TTB relevance:** Materials used feed into processing report (Form 5110.28).

### 5.5 Filtering

**What happens:** Spirit is passed through a filtration medium to remove particulates, adjust character, or clarify.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel | Filter system used |
| Method | Charcoal, chill, plate, gravity, etc. |
| Pre-filter volume + ABV | What went in |
| Post-filter volume + ABV | What came out (volume loss is normal) |
| Filter media description | Type, brand, mesh size |
| Number of passes | How many times through the filter |
| Notes | Clarity observations, taste changes |

**TTB relevance:** Processing operations for Form 5110.28.

### 5.6 Barrel Aging

**What happens:** Spirit is placed in oak barrels (or other wood) for maturation. Required for bourbon (2+ years for "straight"), optional for other spirits.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel (barrel) | Which barrel |
| Barrel metadata | Type, size, char level, previous use |
| Warehouse location | Rick/tier/position for inventory management |
| Entry (date, volume, ABV, proof gallons) | What went in |
| Exit (date, volume, ABV, proof gallons) | What came out |
| Sampling records | Date, ABV, volume pulled, tasting notes |
| Target age (months) | When to plan for dumping |
| Angel's share | Calculated loss over time |
| Notes | Any observations during aging |

**TTB relevance:** Storage report tracks barrel inventory, received/removed/on-hand in proof gallons. Angel's share reported as losses.

### 5.7 Storage

**What happens:** Spirit is held in a tank or other vessel between operations or while awaiting next step.

**Data to track:**
| Field | Why |
|-------|-----|
| Vessel | Storage tank |
| Volume + ABV | Current state |
| Proof gallons | For TTB |
| Notes | Any observations |

### 5.8 Blending

**What happens:** Multiple spirits or barrels are combined to create a final product.

**Data to track:**
| Field | Why |
|-------|-----|
| Components | Array of source batches/barrels with volumes and ABVs |
| Result volume + ABV | What the blend yielded |
| Vessel | Where the blend was combined |
| Notes | Taste profile goals, ratios |

**TTB relevance:** Blending operations for processing report.

### 5.9 Proofing

**What happens:** Water is added to reduce ABV to bottling proof (typically 40% / 80 proof, but varies).

**Data to track:**
| Field | Why |
|-------|-----|
| Starting ABV + volume | Pre-proofing state |
| Target ABV | Desired final proof |
| Water added + water source | Volume and type of water |
| Final ABV + volume | Post-proofing verification |
| Final proof gallons | For TTB |
| Vessel | Where proofing occurred |
| Notes | Any adjustments needed |

**Integration:** The existing `useProofingCalculator` composable should be directly usable from this stage's UI, with results auto-populating the stage fields.

### 5.10 Bottled

**What happens:** Spirit is bottled, labeled, and linked to a production record.

**Data to track:**
| Field | Why |
|-------|-----|
| Production record | Link to existing Production entity |
| Bottle count | Number produced |
| Bottle size | e.g., 750mL, 375mL |
| Lot number | For traceability |
| Labeled ABV | What's on the label |
| Notes | Any bottling issues |

---

## 6. Implementation Plan

### Phase 1: Data Model & Backend (Foundation)

**Goal:** Update schemas, interfaces, API endpoints, and validation without breaking the frontend yet.

#### Step 1.1: Update Recipe Model
- [ ] Add `pipeline` field (String array) to `recipe.schema.ts`
- [ ] Add `pipelineTemplate` field (optional String) to `recipe.schema.ts`
- [ ] Update `Recipe` TypeScript interface
- [ ] Update recipe create/update API endpoints to accept pipeline
- [ ] Update recipe validation schema (Yup) to validate pipeline values against `ALL_STAGES`
- [ ] Add pipeline field to PanelRecipe / FormRecipe UI

#### Step 1.2: Create Pipeline Constants & Helpers
- [ ] Create `composables/batchPipeline.ts` with:
  - `ALL_STAGES` constant
  - `PIPELINE_TEMPLATES` constant
  - `STAGE_KEY_MAP` (stage name → batch.stages key)
  - `STAGE_DISPLAY` (stage name → icon, color)
  - `getNextStage(pipeline, currentStage)` helper
  - `getPreviousStage(pipeline, currentStage)` helper
  - `hasReachedStage(pipeline, currentStage, targetStage)` helper
  - `getStageIndex(pipeline, stageName)` helper

#### Step 1.3: Update Batch Model
- [ ] Rewrite `batch.schema.ts` with:
  - `pipeline` field (String array)
  - `currentStage` field (replaces `status` string)
  - `status` field ('active' | 'completed' | 'cancelled')
  - `stages` object with sub-schemas for each stage type
  - `log` array for activity tracking
- [ ] Rewrite `Batch` TypeScript interface (all stage interfaces)
- [ ] Update batch create/update/get API endpoints
- [ ] Update batch validation schema
- [ ] Write **migration script** for existing batches (map old fields → new structure)

#### Step 1.4: Update Batch Store
- [ ] Rewrite `useBatchStore.ts`:
  - Replace `startBrewing()` with generic `advanceToStage(batchId, stageData?)`
  - Replace hardcoded status filters with `getBatchesByCurrentStage(stage)`
  - Add `addLogEntry(batchId, action, details?)` method
  - Add `updateStageData(batchId, stageName, data)` method
  - Keep backward-compat computed properties during transition

### Phase 2: Recipe Pipeline UI

**Goal:** Let users define pipelines when creating/editing recipes.

#### Step 2.1: Pipeline Builder Component
- [ ] Create `components/Recipe/RecipePipelineBuilder.vue`:
  - Template selector dropdown (shows PIPELINE_TEMPLATES)
  - When template selected, pre-fills pipeline
  - Drag-and-drop reordering of stages
  - Add/remove individual stages from available pool
  - Visual preview showing stage icons in order
  - "Upcoming" always first, "Bottled" always last (auto-enforced)

#### Step 2.2: Update Recipe Forms
- [ ] Add pipeline builder to `PanelRecipe.vue` slide-over
- [ ] Add pipeline builder to `FormRecipe.vue` (legacy form)
- [ ] Update recipe detail page to show pipeline visually

#### Step 2.3: Backfill Existing Recipes
- [ ] Write migration to add default pipeline to all existing recipes based on their `class`:
  - Whisky → `['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled']`
  - Gin → `['Maceration', 'Distilling', 'Storage', 'Proofing', 'Bottled']`
  - Vodka/Neutral Spirits → `['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled']`
  - Others → `['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled']` (safe default)

### Phase 3: Batch Stage Components

**Goal:** Build individual stage UI components with full data entry.

#### Step 3.1: Refactor Existing Components
- [ ] Rename `BatchBrewing.vue` → `BatchMashing.vue` (update all references)
- [ ] Create component registry pattern:
  ```typescript
  const STAGE_COMPONENTS: Record<string, Component> = {
    'Mashing': BatchMashing,
    'Fermenting': BatchFermenting,
    'Distilling': BatchDistilling,
    'Maceration': BatchMaceration,
    'Filtering': BatchFiltering,
    'Barrel Aging': BatchBarrelAging,
    'Storage': BatchStorage,
    'Blending': BatchBlending,
    'Proofing': BatchProofing,
    'Bottled': BatchBottled,
  };
  ```

#### Step 3.2: New Stage Components
- [ ] `components/Batch/BatchMaceration.vue`:
  - Base spirit source picker (select from existing batches or manual entry)
  - Botanical bill editor (add items from inventory with weights)
  - Method selector (direct / vapor basket / both)
  - Date range picker for maceration period
  - Temperature input
  - Notes

- [ ] `components/Batch/BatchFiltering.vue`:
  - Method selector (charcoal / chill / plate / gravity / custom)
  - Pre/post volume + ABV inputs
  - Filter media description
  - Pass count
  - Notes

- [ ] `components/Batch/BatchStorage.vue`:
  - Vessel selector (tanks)
  - Volume + ABV display/edit
  - Proof gallon auto-calculation
  - Notes

- [ ] `components/Batch/BatchBlending.vue`:
  - Component adder (select batch + enter volume/ABV per component)
  - Result volume + ABV (auto-calculated or manual)
  - Vessel selector
  - Notes

- [ ] `components/Batch/BatchProofing.vue`:
  - Starting ABV + volume (pre-filled from previous stage)
  - Target ABV input
  - **Integrated proofing calculator** (reuse `useProofingCalculator`)
  - Water added + water source
  - Final measured ABV + volume
  - Final proof gallons (auto-calculated)
  - Notes

#### Step 3.3: Enhance Existing Components
- [ ] `BatchMashing.vue`: Add strike water, mash temp, pH, gravity fields
- [ ] `BatchFermenting.vue`: Add yeast strain, pitch temp, OG/FG, wash volume, pH to readings
- [ ] `BatchDistilling.vue`: Add run type, run number, charge data, foreshots, temperatures
- [ ] `BatchBarreled.vue` → `BatchBarrelAging.vue`: Add barrel metadata, warehouse location, sampling records, target age
- [ ] `BatchBottled.vue`: Add bottle count, size, lot number, labeled ABV

### Phase 4: Batch Detail Page & Advance Logic

**Goal:** Rewrite the batch detail page to support dynamic pipelines.

#### Step 4.1: Dynamic Batch Detail Page
- [ ] Rewrite `pages/admin/batch/[_id].vue`:
  - `BatchStepper` now reads from `batch.pipeline` instead of `BATCH_STAGES`
  - Use dynamic component rendering: `<component :is="STAGE_COMPONENTS[stage]" />`
  - Only show stages that exist in `batch.pipeline`
  - Only stages up to and including `currentStage` are visible
  - Only `currentStage` is editable

#### Step 4.2: Update BatchStepper
- [ ] Rewrite to accept `pipeline` prop instead of using hardcoded `BATCH_STAGES`
- [ ] Use `STAGE_DISPLAY` map for icons/colors
- [ ] Highlight current stage, dim future stages, mark completed stages

#### Step 4.3: Update BatchAdvanceAction
- [ ] Rewrite to use `pipeline` for determining next stage
- [ ] Vessel selection filters by stage type (use a map: stage → vessel type filter)
- [ ] Show stage-specific fields in the advance modal (e.g., barrel selection for "Barrel Aging")
- [ ] Auto-log advancement in `batch.log`

#### Step 4.4: Batch Creation Flow
- [ ] Update PanelBatch to:
  - Show recipe's pipeline visually when recipe is selected
  - Copy pipeline into new batch
  - Set `currentStage` to first pipeline stage (usually "Mashing" or "Maceration")
  - Or set to "Upcoming" if planning ahead

### Phase 5: Dashboard & Navigation Updates

**Goal:** Update dashboard and navigation to reflect the new pipeline system.

#### Step 5.1: Dashboard Pipeline Widget
- [ ] Update `DashboardBatchPipeline.vue`:
  - Show all active stages (union of all active batch pipelines)
  - Group batches by their `currentStage`
  - Handle that different batches may be in different stage sets
  - Keep drag-to-advance functionality

#### Step 5.2: Batch List Page
- [ ] Update `pages/admin/batch/index.vue`:
  - Stage filter dropdown should show all stages that have active batches
  - Display pipeline type (template name) as a column/badge
  - Quick-view of which stages remain for each batch

#### Step 5.3: Sidebar Badges
- [ ] Update `useSidebarBadges` to count total active batches (not per-stage)

### Phase 6: Activity Log & Notes

**Goal:** Comprehensive audit trail for every batch.

#### Step 6.1: Batch Activity Log Component
- [ ] Create `components/Batch/BatchActivityLog.vue`:
  - Chronological timeline of all actions
  - Auto-entries: stage advances, readings added, data saved
  - Manual entries: user can add notes/observations at any time
  - Each entry shows: date, user, action, details
  - Displayed at the bottom of batch detail page

#### Step 6.2: Auto-Logging
- [ ] Hook into batch store methods to auto-add log entries:
  - Stage advancement → "Advanced to [Stage Name]"
  - Fermentation reading added → "Fermentation reading: SG 1.045, 72°F"
  - Stage data saved → "Updated [Stage Name] data"
  - Batch created → "Batch created from recipe [Name]"

### Phase 7: Proof Gallon Calculations & TTB Integration

**Goal:** Auto-calculate proof gallons at every point where volume + ABV are recorded, feeding into existing TTB reports.

#### Step 7.1: Proof Gallon Helper
- [ ] Create `composables/proofGallons.ts`:
  - `calculateProofGallons(volume, volumeUnit, abv)` → number
  - Handles unit conversion (gallons, liters, mL → proof gallons)
  - Formula: `volume_in_gallons * (abv / 50)` (since 1 proof gallon = 1 gallon at 50% ABV)

#### Step 7.2: Auto-Calculate in Components
- [ ] Every component with volume + ABV inputs should show proof gallons
- [ ] Proof gallons auto-saved to stage data

#### Step 7.3: Update TTB Reports
- [ ] Update existing TTB report components to pull from new `batch.stages` structure
- [ ] Verify proof gallon calculations align with TTB requirements

---

## 7. UI/UX Design

### 7.1 Batch Detail Page Layout

```
┌─────────────────────────────────────────────┐
│ AdminPageHeader: Recipe Name                 │
│ Subtitle: "15 gallon batch • Bourbon Whisky" │
│ [Back] [Edit]                                │
├─────────────────────────────────────────────┤
│ BatchStepper (dynamic from pipeline)         │
│ ● Mashing → ● Fermenting → ◉ Distilling →  │
│   ○ Barrel Aging → ○ Storage → ○ Proofing → │
│   ○ Bottled                                  │
├─────────────────────────────────────────────┤
│ BatchHeader (cost, recipe link, batch #)     │
├─────────────────────────────────────────────┤
│ Current Vessels (if any contain this batch)   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Mashing Card (completed, read-only)      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Fermenting Card (completed, read-only)   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Distilling Card (CURRENT — editable)     │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│       [ Advance to Barrel Aging → ]          │
│                                              │
├─────────────────────────────────────────────┤
│ BatchActivityLog (timeline)                  │
└─────────────────────────────────────────────┘
```

### 7.2 Recipe Pipeline Builder

```
┌─────────────────────────────────────────────┐
│ Pipeline Template: [Grain Spirit (Barreled) ▾] │
├─────────────────────────────────────────────┤
│ Pipeline Stages:                              │
│                                              │
│ 1. 🔥 Mashing              [×]              │
│ 2. 🧪 Fermenting           [×]              │
│ 3. ⚗️ Distilling           [×]              │
│ 4. 🪵 Barrel Aging         [×]              │
│ 5. 🏭 Storage              [×]              │
│ 6. 💧 Proofing             [×]              │
│ 7. 🍷 Bottled              (locked)          │
│                                              │
│ [+ Add Stage]                                │
│ Available: Maceration, Filtering, Blending    │
└─────────────────────────────────────────────┘
```

### 7.3 Dashboard Pipeline Widget (Updated)

The existing DashboardBatchPipeline will aggregate all active batches across all pipeline types:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Batch Pipeline                                        [View All →] │
│ 12 active batches across all stages                                │
├───────┬───────┬──────────┬───────┬─────────┬───────┬───────┬──────┤
│Mashing│Fermen-│Distilling│Macera-│Barrel   │Storage│Proof- │Bottled│
│       │ting   │          │tion   │Aging    │       │ing    │      │
│  2    │  3    │  1       │  1    │  2      │  1    │  1    │  1   │
│ ───── │ ───── │ ─────    │ ───── │ ─────   │ ───── │ ───── │ ─── │
│ Rye   │ Bbn#4 │ Vodka    │ Gin   │ Bbn#1   │ Rye#2 │ Gin#3 │ V#1 │
│ Bbn#5 │ Rye#3 │          │       │ Rye#1   │       │       │     │
│       │ Rum#1 │          │       │         │       │       │     │
└───────┴───────┴──────────┴───────┴─────────┴───────┴───────┴──────┘
```

---

## 8. Migration Strategy

### Existing Data Mapping

The current batch schema has top-level stage fields. These need to map to the new `stages` object:

```
Old Field          → New Location
─────────────────────────────────────
batch.status       → batch.currentStage (map: 'Brewing'→'Mashing', 'Barreled'→'Barrel Aging')
batch.brewing      → batch.stages.mashing
batch.fermenting   → batch.stages.fermenting
batch.distilling   → batch.stages.distilling
batch.barreled     → batch.stages.barrelAging
batch.bottled      → batch.stages.bottled
```

### Migration Script

```javascript
// server/scripts/migrate-batches.ts
// Run once to convert existing batches to new schema

const STATUS_MAP = {
  'Upcoming': 'Upcoming',
  'Brewing': 'Mashing',
  'Fermenting': 'Fermenting',
  'Distilling': 'Distilling',
  'Storage': 'Storage',
  'Barreled': 'Barrel Aging',
  'Bottled': 'Bottled',
};

const DEFAULT_PIPELINE = ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'];
const BARREL_PIPELINE = ['Mashing', 'Fermenting', 'Distilling', 'Barrel Aging', 'Storage', 'Proofing', 'Bottled'];

for each batch:
  1. Map old status → new currentStage via STATUS_MAP
  2. Determine pipeline from recipe class (or use default)
  3. Copy brewing → stages.mashing
  4. Copy fermenting → stages.fermenting
  5. Copy distilling → stages.distilling
  6. Copy barreled → stages.barrelAging
  7. Copy bottled → stages.bottled
  8. Set status = batch was 'Bottled' ? 'completed' : 'active'
  9. Add initial log entry: "Migrated from legacy schema"
```

### Backward Compatibility

During migration, keep old fields in the schema temporarily with `select: false` so they're not returned in queries but the data isn't lost. Remove after confirming migration success.

---

## Summary of Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `composables/batchPipeline.ts` | ALL_STAGES, PIPELINE_TEMPLATES, STAGE_KEY_MAP, STAGE_DISPLAY, helpers |
| `composables/proofGallons.ts` | Proof gallon calculation utility |
| `components/Batch/BatchMaceration.vue` | Maceration stage component |
| `components/Batch/BatchFiltering.vue` | Filtering stage component |
| `components/Batch/BatchStorage.vue` | Storage stage component |
| `components/Batch/BatchBlending.vue` | Blending stage component |
| `components/Batch/BatchProofing.vue` | Proofing stage component |
| `components/Batch/BatchActivityLog.vue` | Activity log timeline |
| `components/Recipe/RecipePipelineBuilder.vue` | Pipeline stage selector/editor |
| `server/scripts/migrate-batches.ts` | One-time migration script |

### Modified Files
| File | Changes |
|------|---------|
| `types/interfaces/Batch.ts` | Complete rewrite — new stage interfaces |
| `types/interfaces/Recipe.ts` | Add `pipeline`, `pipelineTemplate` |
| `server/models/batch.schema.ts` | Complete rewrite — new stages schema |
| `server/models/recipe.schema.ts` | Add `pipeline`, `pipelineTemplate` fields |
| `stores/useBatchStore.ts` | Rewrite stage advancement, add log methods |
| `composables/status.ts` | Replace `BATCH_STAGES` with import from `batchPipeline.ts` |
| `components/Batch/BatchBrewing.vue` | Rename → `BatchMashing.vue`, add new fields |
| `components/Batch/BatchFermenting.vue` | Add yeast, pitch temp, OG/FG, pH |
| `components/Batch/BatchDistilling.vue` | Add run type, charge data, foreshots, temps |
| `components/Batch/BatchBarreled.vue` | Rename → `BatchBarrelAging.vue`, add metadata/samplings |
| `components/Batch/BatchBottled.vue` | Add bottle count, size, lot, labeled ABV |
| `components/Batch/BatchStepper.vue` | Accept `pipeline` prop, use STAGE_DISPLAY |
| `components/Batch/BatchAdvanceAction.vue` | Use pipeline for next stage logic |
| `components/Batch/BatchHeader.vue` | Show pipeline type badge |
| `pages/admin/batch/[_id].vue` | Dynamic component rendering from pipeline |
| `components/Panel/PanelBatch.vue` | Show pipeline when creating, copy to batch |
| `components/Form/FormBatch.vue` | Update for new schema |
| `components/Panel/PanelRecipe.vue` | Add pipeline builder |
| `components/Dashboard/DashboardBatchPipeline.vue` | Aggregate across pipeline types |
| `server/api/batch/create.post.ts` | Handle new schema + log entry |
| `server/api/batch/[id].put.ts` | Handle new schema |
| `server/utils/validation.ts` | Add batch/recipe pipeline validation |

---

## Implementation Priority

1. **Phase 1** — Data model changes (schema + interfaces + API + store)
2. **Phase 2** — Recipe pipeline UI (builder + forms + backfill)
3. **Phase 3** — Stage components (new + enhanced existing)
4. **Phase 4** — Batch detail page + advance logic
5. **Phase 5** — Dashboard + navigation updates
6. **Phase 6** — Activity log
7. **Phase 7** — Proof gallon calculations + TTB report updates

Phases 1-4 are the core work. Phases 5-7 are incremental improvements that can be done in follow-up sessions.
