<script setup lang="ts">
import type { Batch } from '~/types'
import { STAGE_DISPLAY, STAGE_KEY_MAP, getInsertableStages, getStageVolume, stageTextColor, stageBgColor } from '~/composables/batchPipeline'
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

const insertableStages = computed(() => getInsertableStages())

// Count occurrences of a stage name in the edited pipeline
function occurrences(stageName: string): number {
  return editedPipeline.value.filter(s => s === stageName).length
}

// Check if a stage at a given index can be safely removed
function canRemove(index: number): boolean {
  const stageName = editedPipeline.value[index] as string | undefined
  if (!stageName) return false

  // Cannot remove Bottled
  if (stageName === 'Bottled') return false

  // Cannot remove if stage has volume
  if (getStageVolume(props.batch, stageName) > 0) return false

  // Cannot remove sole occurrence of a started stage
  const stageKey = STAGE_KEY_MAP[stageName]
  if (stageKey) {
    const stageData = (props.batch.stages as any)?.[stageKey]
    if (stageData?.startedAt && occurrences(stageName) <= 1) return false
  }

  // Pipeline must keep at least 1 stage + Bottled
  if (editedPipeline.value.length <= 2) return false

  return true
}

// Get removal tooltip explaining why removal is blocked
function removeTooltip(index: number): string | undefined {
  const stageName = editedPipeline.value[index] as string | undefined
  if (!stageName) return undefined
  if (stageName === 'Bottled') return 'Bottled is required'
  if (getStageVolume(props.batch, stageName) > 0) return 'Stage has volume — transfer first'
  const stageKey = STAGE_KEY_MAP[stageName]
  if (stageKey) {
    const stageData = (props.batch.stages as any)?.[stageKey]
    if (stageData?.startedAt && occurrences(stageName) <= 1) return 'Stage has been started'
  }
  if (editedPipeline.value.length <= 2) return 'Pipeline needs at least one stage'
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
  // Must have at least 1 stage + Bottled
  if (editedPipeline.value.length < 2) return false
  // Bottled must be last
  if (editedPipeline.value[editedPipeline.value.length - 1] !== 'Bottled') return false
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
        <button
          v-if="insertAtIndex !== 0"
          class="w-6 h-6 rounded-full border border-dashed border-brown/40 text-parchment/30 hover:border-gold/60 hover:text-gold hover:bg-gold/5 flex items-center justify-center transition-all text-xs"
          @click="insertAtIndex = 0"
        >
          +
        </button>
        <!-- Stage picker when inserting at index 0 -->
        <div v-else class="flex flex-wrap gap-1.5 py-1">
          <button
            v-for="stage in insertableStages"
            :key="stage"
            :class="[
              'px-2 py-1 rounded text-xs border transition-all',
              stageBgColor(STAGE_DISPLAY[stage]?.color || 'neutral'),
              stageTextColor(STAGE_DISPLAY[stage]?.color || 'neutral'),
              'hover:opacity-80',
            ]"
            @click="insertStage(stage)"
          >
            {{ stage }}
          </button>
          <button
            class="px-2 py-1 rounded text-xs text-parchment/40 hover:text-parchment/70 transition-colors"
            @click="insertAtIndex = null"
          >
            Cancel
          </button>
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
          <UTooltip v-if="stage !== 'Bottled'" :text="removeTooltip(index) || 'Remove stage'">
            <button
              :class="[
                'w-6 h-6 rounded flex items-center justify-center transition-all text-xs',
                canRemove(index)
                  ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-parchment/15 cursor-not-allowed',
              ]"
              :disabled="!canRemove(index)"
              @click="removeStage(index)"
            >
              <UIcon name="i-lucide-x" />
            </button>
          </UTooltip>
          <!-- Lock icon for Bottled -->
          <UTooltip v-else text="Bottled is required">
            <UIcon name="i-lucide-lock" class="text-parchment/20 text-sm" />
          </UTooltip>
        </div>

        <!-- Insert button between stages -->
        <div class="flex justify-center py-1">
          <button
            v-if="insertAtIndex !== index + 1"
            class="w-6 h-6 rounded-full border border-dashed border-brown/40 text-parchment/30 hover:border-gold/60 hover:text-gold hover:bg-gold/5 flex items-center justify-center transition-all text-xs"
            @click="insertAtIndex = index + 1"
          >
            +
          </button>
          <!-- Stage picker when inserting at this position -->
          <div v-else class="flex flex-wrap gap-1.5 py-1">
            <button
              v-for="s in insertableStages"
              :key="s"
              :class="[
                'px-2 py-1 rounded text-xs border transition-all',
                stageBgColor(STAGE_DISPLAY[s]?.color || 'neutral'),
                stageTextColor(STAGE_DISPLAY[s]?.color || 'neutral'),
                'hover:opacity-80',
              ]"
              @click="insertStage(s)"
            >
              {{ s }}
            </button>
            <button
              class="px-2 py-1 rounded text-xs text-parchment/40 hover:text-parchment/70 transition-colors"
              @click="insertAtIndex = null"
            >
              Cancel
            </button>
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
