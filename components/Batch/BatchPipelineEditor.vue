<script setup lang="ts">
import type { Batch } from '~/types'
import { STAGE_DISPLAY, STAGE_KEY_MAP, getAvailableStages, getStageVolume, stageTextColor, stageBgColor } from '~/composables/batchPipeline'
import type { StageName } from '~/composables/batchPipeline'

const props = defineProps<{
  batch: Batch
}>()

const emit = defineEmits<{ saved: [] }>()

const batchStore = useBatchStore()
const toast = useToast()

// Working copy of the pipeline for editing
const editedPipeline = ref<string[]>([...props.batch.pipeline])
const saving = ref(false)
const insertAtIndex = ref<number | null>(null)

// Re-sync when batch pipeline changes externally
watch(() => props.batch.pipeline, (newPipeline) => {
  editedPipeline.value = [...newPipeline]
  insertAtIndex.value = null
})

const insertableStages = computed(() => getAvailableStages(editedPipeline.value))

// Count occurrences of a stage name in the edited pipeline
function occurrences(stageName: string): number {
  return editedPipeline.value.filter(s => s === stageName).length
}

// Check if a stage at a given index can be safely removed
function canRemove(index: number): boolean {
  const stageName = editedPipeline.value[index] as string | undefined
  if (!stageName) return false

  // Cannot remove if stage has volume
  if (getStageVolume(props.batch, stageName) > 0) return false

  // Cannot remove sole occurrence of a started stage
  const stageKey = STAGE_KEY_MAP[stageName]
  if (stageKey) {
    const stageData = (props.batch.stages as any)?.[stageKey]
    if (stageData?.startedAt && occurrences(stageName) <= 1) return false
  }

  // Pipeline must keep at least 1 stage
  if (editedPipeline.value.length <= 1) return false

  return true
}

// Get removal tooltip explaining why removal is blocked
function removeTooltip(index: number): string | undefined {
  const stageName = editedPipeline.value[index] as string | undefined
  if (!stageName) return undefined
  if (getStageVolume(props.batch, stageName) > 0) return 'Stage has volume — transfer first'
  const stageKey = STAGE_KEY_MAP[stageName]
  if (stageKey) {
    const stageData = (props.batch.stages as any)?.[stageKey]
    if (stageData?.startedAt && occurrences(stageName) <= 1) return 'Stage has been started'
  }
  if (editedPipeline.value.length <= 1) return 'Pipeline needs at least one stage'
  return undefined
}

function insertStage(stageName: string) {
  if (insertAtIndex.value === null) return
  editedPipeline.value.splice(insertAtIndex.value, 0, stageName)
  insertAtIndex.value = null
}

function removeStage(index: number) {
  if (!canRemove(index)) return
  editedPipeline.value.splice(index, 1)
}

const hasChanges = computed(() => {
  if (editedPipeline.value.length !== props.batch.pipeline.length) return true
  return editedPipeline.value.some((s, i) => s !== props.batch.pipeline[i])
})

const isValid = computed(() => {
  // Must have at least 1 stage
  if (editedPipeline.value.length < 1) return false
  // If Bottled is present, it must be last
  const bottledIdx = editedPipeline.value.indexOf('Bottled')
  if (bottledIdx >= 0 && bottledIdx !== editedPipeline.value.length - 1) return false
  return true
})

async function save() {
  if (!hasChanges.value || !isValid.value) return
  saving.value = true
  try {
    // Find the batch in the store, update its pipeline, save
    const target = batchStore.batches.find(b => b._id === props.batch._id)
    if (!target) throw new Error('Batch not found')
    target.pipeline = [...editedPipeline.value]
    batchStore.setBatch(target._id)
    await batchStore.updateBatch()
    toast.add({
      title: 'Pipeline updated',
      description: `Pipeline now has ${editedPipeline.value.length} stages`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    emit('saved')
  } catch (error: unknown) {
    toast.add({
      title: 'Failed to update pipeline',
      description: getErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-5 max-h-[80vh] overflow-y-auto">
    <div class="flex items-center gap-2 mb-5">
      <UIcon name="i-lucide-pencil-ruler" class="text-lg text-gold" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Edit Pipeline</h3>
    </div>

    <!-- Pipeline stages list -->
    <div class="space-y-1">
      <!-- Insert button before first stage -->
      <div class="flex justify-center py-1">
        <UButton
          v-if="insertAtIndex !== 0"
          icon="i-lucide-plus"
          variant="ghost"
          size="xs"
          square
          class="rounded-full border border-dashed border-brown/40 text-parchment/30 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-all"
          @click="insertAtIndex = 0"
        />
        <!-- Stage picker when inserting at index 0 -->
        <div v-else class="flex flex-wrap gap-1.5 py-1">
          <UButton
            v-for="stage in insertableStages"
            :key="stage"
            variant="soft"
            size="xs"
            :label="stage"
            :class="[
              stageBgColor(STAGE_DISPLAY[stage]?.color || 'neutral'),
              stageTextColor(STAGE_DISPLAY[stage]?.color || 'neutral'),
              'hover:opacity-80',
            ]"
            @click="insertStage(stage)"
          />
          <UButton
            label="Cancel"
            variant="link"
            size="xs"
            color="neutral"
            @click="insertAtIndex = null"
          />
        </div>
      </div>

      <template v-for="(stage, index) in editedPipeline" :key="`${stage}-${index}`">
        <!-- Stage row -->
        <div
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
            stageBgColor(STAGE_DISPLAY[stage]?.color || 'neutral'),
          ]"
        >
          <UIcon
            :name="STAGE_DISPLAY[stage]?.icon || 'i-lucide-circle'"
            :class="['text-lg', stageTextColor(STAGE_DISPLAY[stage]?.color || 'neutral')]"
          />
          <span class="text-sm font-semibold text-parchment flex-1">
            {{ stage }}
            <span
              v-if="occurrences(stage) > 1"
              class="text-xs text-parchment/40 ml-1"
            >
              (#{{ editedPipeline.slice(0, index + 1).filter(s => s === stage).length }})
            </span>
          </span>

          <!-- Volume badge if stage has volume -->
          <span
            v-if="getStageVolume(batch, stage) > 0"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-brown/20 text-parchment/50"
          >
            has volume
          </span>

          <!-- Remove button -->
          <UTooltip :text="removeTooltip(index) || 'Remove stage'">
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              size="xs"
              color="error"
              square
              :disabled="!canRemove(index)"
              @click="removeStage(index)"
            />
          </UTooltip>
        </div>

        <!-- Insert button between stages -->
        <div class="flex justify-center py-1">
          <UButton
            v-if="insertAtIndex !== index + 1"
            icon="i-lucide-plus"
            variant="ghost"
            size="xs"
            square
            class="rounded-full border border-dashed border-brown/40 text-parchment/30 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-all"
            @click="insertAtIndex = index + 1"
          />
          <!-- Stage picker when inserting at this position -->
          <div v-else class="flex flex-wrap gap-1.5 py-1">
            <UButton
              v-for="s in insertableStages"
              :key="s"
              variant="soft"
              size="xs"
              :label="s"
              :class="[
                stageBgColor(STAGE_DISPLAY[s]?.color || 'neutral'),
                stageTextColor(STAGE_DISPLAY[s]?.color || 'neutral'),
                'hover:opacity-80',
              ]"
              @click="insertStage(s)"
            />
            <UButton
              label="Cancel"
              variant="link"
              size="xs"
              color="neutral"
              @click="insertAtIndex = null"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer actions -->
    <div class="flex items-center justify-between mt-5 pt-4 border-t border-brown/20">
      <span class="text-xs text-parchment/40">
        {{ editedPipeline.length }} stages
      </span>
      <div class="flex gap-2">
        <UButton
          :loading="saving"
          :disabled="!hasChanges || !isValid"
          @click="save"
        >
          Save Pipeline
        </UButton>
      </div>
    </div>
  </div>
</template>
