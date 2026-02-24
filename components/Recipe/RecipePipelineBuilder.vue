<script setup lang="ts">
import {
  PIPELINE_TEMPLATES,
  STAGE_DISPLAY,
  getAvailableStages,
  stageTextColor,
  stageBgColor,
} from "~/composables/batchPipeline";
import type { StageName } from "~/composables/batchPipeline";

const pipeline = defineModel<string[]>({ required: true });
const pipelineTemplate = defineModel<string>("template");

const templateOptions = Object.keys(PIPELINE_TEMPLATES);

const selectTemplate = (name: string) => {
  pipelineTemplate.value = name;
  if (name === "Custom") {
    pipeline.value = [];
  } else {
    pipeline.value = [...PIPELINE_TEMPLATES[name]];
  }
};

// Stages available to add (not already in pipeline, excluding Upcoming/Bottled)
const availableStages = computed(() => getAvailableStages(pipeline.value));

const addStage = (stage: StageName) => {
  const current = [...pipeline.value];
  // Insert before Bottled if present, else at end
  const bottledIdx = current.indexOf("Bottled");
  if (bottledIdx >= 0) {
    current.splice(bottledIdx, 0, stage);
  } else {
    current.push(stage);
  }
  pipeline.value = current;
  pipelineTemplate.value = "Custom";
};

const removeStage = (index: number) => {
  const stage = pipeline.value[index];
  // Don't allow removing Bottled (terminal stage)
  if (stage === "Bottled") return;
  const current = [...pipeline.value];
  current.splice(index, 1);
  pipeline.value = current;
  pipelineTemplate.value = "Custom";
};

const moveStage = (index: number, direction: -1 | 1) => {
  const current = [...pipeline.value];
  const targetIdx = index + direction;
  if (targetIdx < 0 || targetIdx >= current.length) return;
  // Don't move past Bottled (must stay last)
  if (current[targetIdx] === "Bottled" && direction === 1) return;
  // Don't move Bottled up
  if (current[index] === "Bottled") return;
  [current[index], current[targetIdx]] = [current[targetIdx], current[index]];
  pipeline.value = current;
  pipelineTemplate.value = "Custom";
};

// Native drag-and-drop
const dragIndex = ref<number | null>(null);

const onDragStart = (index: number) => {
  if (pipeline.value[index] === "Bottled") return;
  dragIndex.value = index;
};

const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (pipeline.value[index] === "Bottled") return;
};

const onDrop = (targetIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === targetIndex) {
    dragIndex.value = null;
    return;
  }
  if (pipeline.value[targetIndex] === "Bottled") {
    dragIndex.value = null;
    return;
  }
  const current = [...pipeline.value];
  const [moved] = current.splice(dragIndex.value, 1);
  current.splice(targetIndex, 0, moved);
  pipeline.value = current;
  pipelineTemplate.value = "Custom";
  dragIndex.value = null;
};

const display = (name: string) =>
  STAGE_DISPLAY[name] || { icon: "i-lucide-circle", color: "neutral" };
</script>

<template>
  <div class="space-y-3">
    <!-- Template selector -->
    <UFormField label="Pipeline Template">
      <USelectMenu
        :model-value="pipelineTemplate || ''"
        :items="templateOptions"
        placeholder="Select a template..."
        @update:model-value="selectTemplate"
      />
    </UFormField>

    <!-- Current pipeline -->
    <div v-if="pipeline?.length > 0" class="space-y-1.5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider">
        Pipeline Stages
      </div>
      <div class="space-y-1">
        <div
          v-for="(stage, index) in pipeline"
          :key="`${stage}-${index}`"
          :draggable="stage !== 'Bottled'"
          class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
          :class="[
            stageBgColor(display(stage).color),
            dragIndex === index ? 'opacity-50' : '',
            stage !== 'Bottled' ? 'cursor-grab active:cursor-grabbing' : '',
          ]"
          @dragstart="onDragStart(index)"
          @dragover="onDragOver($event, index)"
          @drop="onDrop(index)"
          @dragend="dragIndex = null"
        >
          <UIcon
            name="i-lucide-grip-vertical"
            class="text-parchment/30 shrink-0"
            :class="stage === 'Bottled' ? 'invisible' : ''"
          />
          <UIcon
            :name="display(stage).icon"
            :class="stageTextColor(display(stage).color)"
            class="shrink-0"
          />
          <span class="text-sm text-parchment flex-1">{{ stage }}</span>
          <span class="text-[10px] text-parchment/40 tabular-nums">{{
            index + 1
          }}</span>
          <div class="flex items-center gap-0.5">
            <UButton
              v-if="stage !== 'Bottled'"
              icon="i-lucide-chevron-up"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="index === 0"
              @click="moveStage(index, -1)"
            />
            <UButton
              v-if="stage !== 'Bottled'"
              icon="i-lucide-chevron-down"
              color="neutral"
              variant="ghost"
              size="2xs"
              :disabled="
                index >= pipeline.length - 2 ||
                pipeline[index + 1] === 'Bottled'
              "
              @click="moveStage(index, 1)"
            />
            <UButton
              v-if="stage !== 'Bottled'"
              icon="i-lucide-x"
              color="error"
              variant="ghost"
              size="sm"
              @click="removeStage(index)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-6 rounded-lg border border-dashed border-brown/30"
    >
      <UIcon
        name="i-lucide-route"
        class="text-2xl text-parchment/20 mx-auto mb-2"
      />
      <p class="text-sm text-parchment/50">
        Select a template or add stages below
      </p>
    </div>

    <!-- Add stage -->
    <div v-if="availableStages.length > 0" class="space-y-1.5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider">
        Add Stage
      </div>
      <div class="flex flex-wrap gap-1.5">
        <UButton
          v-for="stage in availableStages"
          :key="stage"
          size="xs"
          color="neutral"
          variant="outline"
          @click="addStage(stage)"
        >
          <UIcon
            :name="display(stage).icon"
            :class="stageTextColor(display(stage).color)"
          />
          {{ stage }}
        </UButton>
      </div>
    </div>
  </div>
</template>
