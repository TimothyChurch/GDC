<script setup lang="ts">
import type { Batch } from '~/types'
import type { TransferInput } from '~/types/interfaces/Transfer'
import { LazyModalTransferAction } from '#components'
import { STAGE_DISPLAY } from '~/composables/batchPipeline'

/**
 * Phase 5 of PLAN-UI-OVERHAUL.md — explicit "Start Batch" hero CTA.
 *
 * Visible only when the batch is in the `Upcoming` stage. Reframes the first
 * stage advancement as a deliberate "start" action so the user understands
 * that editing batch details before this point is free (no transfers fire).
 *
 * Wraps the same Transfer Action modal that ShortcutAdvanceStage uses; on
 * success the modal commits a stage_transition transfer from Upcoming to
 * pipeline[0]. From that point forward the batch is part of the ledger.
 */

const props = defineProps<{
	batch: Batch
}>()

const emit = defineEmits<{ started: [] }>()

const overlay = useOverlay()
const modal = overlay.create(LazyModalTransferAction)

const firstStage = computed<string | null>(() => {
	const pipeline = props.batch.pipeline || []
	return pipeline[0] || null
})

const stageDisplay = computed(() =>
	firstStage.value ? STAGE_DISPLAY[firstStage.value] : null
)

const recipeStore = useRecipeStore()
const recipeName = computed(() =>
	props.batch.recipe ? recipeStore.getRecipeById(props.batch.recipe)?.name : null
)

async function start() {
	if (!firstStage.value) return
	const prefill: Partial<TransferInput> = {
		type: 'stage_transition',
		batch: props.batch._id,
		fromStage: 'Upcoming',
		toStage: firstStage.value,
		sources: [],
		destinations: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
	}
	const result = await modal.open({ prefill }).result
	if (result) emit('started')
}
</script>

<template>
	<div
		v-if="batch.currentStage === 'Upcoming' && firstStage"
		class="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/30 p-5"
	>
		<div class="flex items-start justify-between gap-4 mb-3">
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2 mb-1">
					<UIcon name="i-lucide-calendar-clock" class="text-blue-400 text-lg" />
					<span class="text-xs uppercase tracking-wider text-blue-300/80 font-semibold">
						Upcoming
					</span>
				</div>
				<h3 class="text-xl font-bold text-parchment font-[Cormorant_Garamond] mb-1">
					Ready to start
				</h3>
				<p class="text-sm text-parchment/70 leading-snug">
					This batch hasn't entered production yet. Edits to recipe, batch size,
					and pipeline are free until you start it.
				</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-blue-500/15">
			<div class="text-xs text-parchment/60">
				First stage:
				<span class="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
					<UIcon v-if="stageDisplay?.icon" :name="stageDisplay.icon" class="text-[11px]" />
					<span class="font-medium">{{ firstStage }}</span>
				</span>
				<span v-if="recipeName" class="text-parchment/40 ml-2">· {{ recipeName }}</span>
			</div>
			<UButton
				color="primary"
				icon="i-lucide-play"
				size="md"
				class="font-bold"
				@click="start"
			>
				Start Batch
			</UButton>
		</div>
	</div>
</template>
