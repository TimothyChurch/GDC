<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const vesselStore = useVesselStore()

const batch = computed(() => batchStore.getBatchById(route.params._id as string))
const recipe = computed(() => batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : undefined)

const containingVessels = computed(() => {
  if (!batch.value?._id) return []
  return vesselStore.vessels.filter(v =>
    v.contents?.some(c => c.batch === batch.value!._id)
  )
})

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

    <!-- Current Vessels -->
    <div v-if="containingVessels.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Current Vessels</h3>
      <div class="divide-y divide-brown/20">
        <div
          v-for="vessel in containingVessels"
          :key="vessel._id"
          class="flex items-center justify-between py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/vessels/${vessel._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ vessel.name }}
          </NuxtLink>
          <span class="text-parchment/50 text-xs">{{ vessel.type }}</span>
        </div>
      </div>
    </div>

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
