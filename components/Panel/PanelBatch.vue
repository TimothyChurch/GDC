<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const batchStore = useBatchStore();

const schema = yup.object({
  recipe: yup.string().required('Recipe is required'),
  batchSize: yup.number().positive('Must be positive').required('Batch size is required'),
  batchSizeUnit: yup.string().required('Unit is required'),
});
const recipeStore = useRecipeStore();

const { localData, isDirty, saving, save, cancel, draftRestoredAt, discardDraft } = useFormPanel({
  source: () => batchStore.batch,
  draft: {
    key: 'PanelBatch',
    id: () => batchStore.batch._id,
  },
  async onSave(data) {
    // compute batch cost before saving
    const recipe = recipeStore.getRecipeById(data.recipe);
    if (!data.recipeCost && data.recipe)
      data.recipeCost = recipePrice(data.recipe);
    if (
      recipe?.volume &&
      data.batchSize &&
      recipe.volumeUnit &&
      data.batchSizeUnit
    ) {
      const scaling = convertUnitRatio(recipe.volumeUnit, data.batchSizeUnit);
      data.batchCost =
        (recipePrice(recipe) * (data.batchSize / recipe.volume)) / scaling || 0;
    }

    // Rescale stageVolumes proportionally when batchSize changes
    const oldSize = batchStore.batch.batchSize;
    const newSize = data.batchSize;
    if (oldSize && newSize && oldSize !== newSize && batchStore.batch.stageVolumes) {
      const ratio = newSize / oldSize;
      const oldVolumes = { ...batchStore.batch.stageVolumes };
      const rescaled: Record<string, number> = {};
      for (const [stage, vol] of Object.entries(oldVolumes)) {
        if (vol > 0) {
          rescaled[stage] = Math.round(vol * ratio * 1000) / 1000;
        }
      }
      data.stageVolumes = rescaled;

      // Log the resize
      if (!batchStore.batch.log) batchStore.batch.log = [];
      const unit = data.batchSizeUnit || batchStore.batch.batchSizeUnit || 'gal';
      batchStore.batch.log.push({
        date: new Date(),
        action: `Batch resized from ${oldSize} to ${newSize} ${unit}`,
        details: 'Stage volumes rescaled proportionally',
      });
    }

    Object.assign(batchStore.batch, data);
    await batchStore.updateBatch();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const price = computed(() => {
  return localData.value.recipe
    ? Dollar.format(recipePrice(localData.value.recipe))
    : Dollar.format(0);
});

const recipe = computed(() =>
  recipeStore.getRecipeById(localData.value.recipe),
);

// When recipe changes, inherit its pipeline + projection defaults
watch(
  () => localData.value.recipe,
  (newRecipeId) => {
    if (!newRecipeId || !isNew) return;
    const r = recipeStore.getRecipeById(newRecipeId);
    if (r?.pipeline?.length) {
      localData.value.pipeline = [...r.pipeline];
      localData.value.pipelineTemplate = r.pipelineTemplate;
    }
    applyRecipeProjectionDefaults(r);
  },
);

// When batchSize changes on a new batch, rescale wash volume too.
watch(
  () => [localData.value.batchSize, localData.value.batchSizeUnit] as const,
  () => {
    if (!isNew) return;
    const r = recipeStore.getRecipeById(localData.value.recipe);
    if (r) applyRecipeProjectionDefaults(r);
  },
);

/**
 * Prefill stages.fermenting.{originalGravity, finalGravity, estimatedAbv,
 * washVolume} from the recipe's projection snapshot. Only runs on new
 * batches; skips fields the user has already populated. Wash volume is
 * scaled to the actual batchSize.
 */
function applyRecipeProjectionDefaults(r: any) {
  if (!isNew || !r) return;

  if (!localData.value.stages) localData.value.stages = {};
  if (!localData.value.stages.fermenting) localData.value.stages.fermenting = {};
  const f = localData.value.stages.fermenting;

  if (r.projectedOG && !f.originalGravity) f.originalGravity = r.projectedOG;
  if (r.projectedFG && !f.finalGravity) f.finalGravity = r.projectedFG;
  if (r.projectedWashAbv && f.estimatedAbv == null) f.estimatedAbv = r.projectedWashAbv;

  if (!f.washVolume && r.volume && localData.value.batchSize) {
    const targetUnit = localData.value.batchSizeUnit || r.volumeUnit;
    const scale =
      r.volumeUnit === targetUnit
        ? localData.value.batchSize / r.volume
        : (localData.value.batchSize *
            (convertUnitRatio(targetUnit, r.volumeUnit) || 1)) / r.volume;
    f.washVolume = +(r.volume * scale).toFixed(2);
    f.washVolumeUnit = r.volumeUnit;
  }
}

const scaledPrice = computed(() => {
  if (!recipe.value?.volume || !localData.value.batchSize) return 0;
  const scaling =
    convertUnitRatio(recipe.value.volumeUnit, localData.value.batchSizeUnit) ||
    1;
  return (
    (recipePrice(recipe.value) *
      (localData.value.batchSize / recipe.value.volume)) /
      scaling || 0
  );
});

/** Preview of stage-volume rescaling before save, when an existing batch's size changes. */
const sizeChangePreview = computed(() => {
  if (isNew) return null;
  const oldSize = batchStore.batch.batchSize;
  const newSize = localData.value.batchSize;
  const oldVolumes = batchStore.batch.stageVolumes;
  if (!oldSize || !newSize || oldSize === newSize) return null;
  if (!oldVolumes || Object.keys(oldVolumes).length === 0) return null;
  const ratio = newSize / oldSize;
  const rows: { stage: string; from: number; to: number }[] = [];
  for (const [stage, vol] of Object.entries(oldVolumes)) {
    if (vol > 0) {
      rows.push({ stage, from: vol, to: Math.round(vol * ratio * 1000) / 1000 });
    }
  }
  return { ratio, oldSize, newSize, rows };
});

/** Preview of recipe pipeline inheritance for new batches. */
const recipePipelinePreview = computed(() => {
  if (!isNew) return null;
  const recipeData = recipe.value;
  if (!recipeData?.pipeline?.length) return null;
  const current = localData.value.pipeline || [];
  const incoming = recipeData.pipeline;
  if (JSON.stringify(current) === JSON.stringify(incoming)) return null;
  return { current, incoming };
});
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-white/10"
        >
          <h2
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
            {{ isNew ? "New Batch" : "Edit Batch" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>
        <div
          v-if="draftRestoredAt"
          class="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300"
        >
          <UIcon name="i-lucide-archive-restore" class="shrink-0" />
          <span class="flex-1">Draft restored from a previous session.</span>
          <UButton size="2xs" variant="ghost" color="neutral" class="text-amber-300 hover:text-amber-200" @click="discardDraft">
            Discard
          </UButton>
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex flex-col overflow-y-auto p-4 space-y-4">
            <UFormField label="Recipe" name="recipe" class="w-full">
              <USelectMenu
                v-model="localData.recipe"
                :items="
                  recipeStore.recipes.map((r) => ({
                    label: r.name,
                    value: r._id,
                  }))
                "
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Recipe Cost">
              <span class="text-sm">{{ price }}</span>
            </UFormField>
            <UFormField label="Batch Size" name="batchSize">
              <BaseQuantityInput
                v-model:value="localData.batchSize"
                v-model:unit="localData.batchSizeUnit"
                :unit-options="volumeUnits"
                placeholder="Volume"
              />
            </UFormField>
            <UFormField label="Batch Cost">
              <span class="text-sm">{{ Dollar.format(scaledPrice) }}</span>
            </UFormField>

            <!-- Pipeline preview (inherited from recipe) -->
            <div v-if="localData.pipeline?.length" class="space-y-1.5">
              <div class="text-xs text-parchment/60 uppercase tracking-wider">
                Pipeline
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="stage in localData.pipeline"
                  :key="stage"
                  class="text-xs px-2 py-0.5 rounded border border-brown/30 text-parchment/60"
                >
                  {{ stage }}
                </span>
              </div>
            </div>

            <!-- Stage-volume rescaling preview (existing batch, size changed) -->
            <div
              v-if="sizeChangePreview"
              class="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 space-y-2"
            >
              <div class="flex items-center gap-2 text-xs text-amber-300">
                <UIcon name="i-lucide-info" />
                <span>
                  Resizing from <strong>{{ sizeChangePreview.oldSize }}</strong>
                  to <strong>{{ sizeChangePreview.newSize }}</strong> {{ localData.batchSizeUnit }}
                  ({{ +(sizeChangePreview.ratio * 100).toFixed(1) }}% of original) — stage volumes will rescale on save.
                </span>
              </div>
              <div class="grid grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
                <template v-for="row in sizeChangePreview.rows" :key="row.stage">
                  <span class="text-parchment/60 truncate">{{ row.stage }}</span>
                  <span class="text-parchment/40 tabular-nums">{{ row.from }}</span>
                  <span class="text-amber-300 tabular-nums">→ {{ row.to }}</span>
                </template>
              </div>
            </div>

            <!-- Recipe pipeline inheritance preview (new batch) -->
            <div
              v-if="recipePipelinePreview"
              class="rounded-lg border border-blue-500/25 bg-blue-500/5 p-3 space-y-2"
            >
              <div class="flex items-center gap-2 text-xs text-blue-300">
                <UIcon name="i-lucide-info" />
                <span>This recipe will set the batch's pipeline to:</span>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="stage in recipePipelinePreview.incoming"
                  :key="stage"
                  class="text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-300 bg-blue-500/10"
                >
                  {{ stage }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
          >
            <UButton color="neutral" variant="outline" @click="cancel"
              >Cancel</UButton
            >
            <UButton type="submit" :loading="saving" :disabled="!isDirty">
              {{ isNew ? "Create" : "Save" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>
