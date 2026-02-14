<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const batch = computed(() => batchStore.getBatchById(route.params._id as string))
const recipe = computed(() => batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : undefined)

// Panel slide-over for editing
import { PanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelBatch)

const editBatch = () => {
  if (!batch.value) return
  batchStore.batch = batch.value
  panel.open()
}

// Stage helpers
const stageIndex = (stageName: string) =>
  BATCH_STAGES.findIndex((s) => s.name === stageName)

const currentStageIndex = computed(() =>
  stageIndex(batch.value?.status || 'Upcoming')
)

const hasReachedStage = (stageName: string) =>
  currentStageIndex.value >= stageIndex(stageName)

const isCurrentStage = (stageName: string) =>
  batch.value?.status === stageName
</script>

<template>
  <div v-if="batch" class="space-y-6">
    <AdminPageHeader
      :title="recipe?.name || 'Batch'"
      :subtitle="`${batch.batchSize} ${batch.batchSizeUnit} batch`"
      icon="i-lucide-flask-conical"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/batch')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editBatch"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <BatchStepper :current-status="batch.status || 'Upcoming'" />

    <BatchHeader :batch="batch" :recipe="recipe" />

    <BatchBrewing
      v-if="hasReachedStage('Brewing')"
      :batch="batch"
      :editing="isCurrentStage('Brewing')"
    />

    <BatchFermenting
      v-if="hasReachedStage('Fermenting')"
      :batch="batch"
      :editing="isCurrentStage('Fermenting')"
    />

    <BatchDistilling
      v-if="hasReachedStage('Distilling')"
      :batch="batch"
      :editing="isCurrentStage('Distilling')"
    />

    <BatchBarreled
      v-if="hasReachedStage('Barreled')"
      :batch="batch"
      :editing="isCurrentStage('Barreled')"
    />

    <BatchBottled
      v-if="hasReachedStage('Bottled')"
      :batch="batch"
    />

    <div v-if="batch.status !== 'Bottled'" class="flex justify-center">
      <BatchAdvanceAction :batch="batch" @advanced="() => {}" />
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Batch not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/batch')"
    >
      Back to Batches
    </UButton>
  </div>
</template>
