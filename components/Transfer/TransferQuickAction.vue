<script setup lang="ts">
import type { Batch, DistillingRun } from '~/types'
import type { Transfer, TransferInput } from '~/types/interfaces/Transfer'
import { LazyModalTransferAction } from '#components'
import { calculateProofGallons } from '~/utils/proofGallons'

/**
 * Phase-3 unified Move action. Replaces the per-action shortcut buttons
 * (AdvanceStage, WithinStageMove, Withdraw, Destroy) with one entry point.
 *
 * The transfer's TYPE is chosen inside the form — this component just gathers
 * the batch's current vessels as sources and lets the user complete the
 * destination/loss/balance picture there.
 *
 * Distillation bookkeeping (stub DistillingRun on enter, lowWines aggregation
 * on exit Stripping → Low Wines) is preserved here so swapping ShortcutAdvanceStage
 * for TransferQuickAction doesn't lose data integrity.
 */

const props = withDefaults(defineProps<{
	batch: Batch
	label?: string
	icon?: string
	color?: 'primary' | 'neutral' | 'error' | 'warning' | 'success'
	variant?: 'solid' | 'outline' | 'ghost' | 'soft' | 'subtle' | 'link'
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
	label: 'Move…',
	icon: 'i-lucide-arrow-right-left',
	color: 'primary',
	variant: 'solid',
	size: 'sm',
})

const emit = defineEmits<{ completed: [Transfer | null] }>()

const overlay = useOverlay()
const modal = overlay.create(LazyModalTransferAction)
const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const toast = useToast()

function findSources() {
	const out: { vessel: string; volume: number; proof: number }[] = []
	for (const v of vesselStore.items) {
		const slot = (v.contents || []).find((c: any) => String(c.batch) === props.batch._id)
		if (slot && slot.volume > 0) {
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0)
			out.push({ vessel: v._id, volume: slot.volume, proof })
		}
	}
	return out
}

const DISTILLATION_STAGES = ['Stripping Run', 'Spirit Run', 'Distilling'] as const

function buildDistillingRunFromTransfer(transfer: Transfer): DistillingRun {
	const dest = transfer.destinations[0]
	const sources = transfer.sources || []
	const runType = transfer.toStage === 'Spirit Run' ? 'spirit' : 'stripping'
	return {
		runType,
		date: new Date(),
		chargeVolume: dest?.volume,
		chargeVolumeUnit: 'gallon',
		chargeAbv: dest ? dest.proof / 2 : 0,
		chargeSourceVessel: sources[0]?.vessel || '',
		chargeSourceVessels: sources.map((s) => s.vessel).filter(Boolean) as string[],
		...(runType === 'stripping'
			? { output: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined } }
			: {
				collected: {
					foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
				},
			}),
	}
}

async function applyEnterDistillation(transfer: Transfer) {
	const target = transfer.toStage
	if (!target || !DISTILLATION_STAGES.includes(target as typeof DISTILLATION_STAGES[number])) return
	const run = buildDistillingRunFromTransfer(transfer)
	try {
		if (target === 'Stripping Run') await batchStore.addStrippingRun(props.batch._id, run)
		else if (target === 'Spirit Run') await batchStore.addSpiritRun(props.batch._id, run)
		else await batchStore.addDistillingRun(props.batch._id, run)
	} catch (err) {
		toast.add({
			title: 'Run record not created',
			description: `Transfer succeeded but the ${target.toLowerCase()} stub run wasn't saved. Add it manually in the stage editor. ${getErrorMessage(err)}`,
			color: 'warning',
			icon: 'i-lucide-alert-triangle',
		})
	}
}

async function applyExitStrippingToLowWines(transfer: Transfer) {
	if (transfer.fromStage !== 'Stripping Run' || transfer.toStage !== 'Low Wines') return
	const fresh = batchStore.items.find((b) => b._id === props.batch._id)
	const runs = fresh?.stages?.strippingRun?.runs || []
	if (runs.length === 0) return
	let runIndex = -1
	for (let i = runs.length - 1; i >= 0; i--) {
		if (!(runs[i]?.output?.volume || 0)) { runIndex = i; break }
	}
	if (runIndex === -1) runIndex = runs.length - 1

	const dest = transfer.destinations[0]
	const volume = dest?.volume || 0
	const abv = dest ? dest.proof / 2 : 0
	const pg = volume > 0 && abv > 0 ? calculateProofGallons(volume, 'gallon', abv) : 0
	const destVesselId = (dest && typeof dest.vessel === 'string') ? dest.vessel : ''

	try {
		await batchStore.updateStrippingRun(props.batch._id, runIndex, {
			completed: true,
			output: { vessel: destVesselId, volume, volumeUnit: 'gallon', abv, proofGallons: pg },
			total: { volume, volumeUnit: 'gallon', abv, proofGallons: pg },
		})
	} catch (err) {
		toast.add({
			title: 'Run output not recorded',
			description: `Low Wines aggregate may be stale. Edit the stripping run manually. ${getErrorMessage(err)}`,
			color: 'warning',
			icon: 'i-lucide-alert-triangle',
		})
	}
}

async function open() {
	const sources = findSources()
	const totalVol = sources.reduce((s, x) => s + x.volume, 0)
	const totalPG = sources.reduce((s, x) => s + (x.volume * x.proof), 0)
	const avgProof = totalVol > 0 ? totalPG / totalVol : 0

	const prefill: Partial<TransferInput> = {
		batch: props.batch._id,
		fromStage: props.batch.currentStage,
		sources,
		destinations: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
	}

	// Stash the average proof for the user to pick up if they switch type to withdrawal
	;(prefill as any)._suggestedAvgProof = avgProof
	;(prefill as any)._suggestedTotalVolume = totalVol

	const result = await modal.open({ prefill }).result
	if (!result) {
		emit('completed', null)
		return
	}
	const transfer = result.transfer as Transfer | undefined
	if (transfer) {
		await applyExitStrippingToLowWines(transfer)
		await applyEnterDistillation(transfer)
	}
	emit('completed', transfer || null)
}
</script>

<template>
	<UButton
		:icon="icon"
		:color="color"
		:variant="variant"
		:size="size"
		@click="open"
	>
		{{ label }}
	</UButton>
</template>
