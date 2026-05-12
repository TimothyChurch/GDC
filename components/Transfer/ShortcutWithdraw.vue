<script setup lang="ts">
import type { Batch } from '~/types';
import type { TransferInput } from '~/types/interfaces/Transfer';
import { LazyModalTransferAction } from '#components';

/**
 * Phase 6.3 — Tax-paid withdrawal shortcut.
 *
 * Spirit leaves the bond. Pre-fills type='tax_paid_withdrawal' with destination
 * vessel=null (virtual tax_paid bucket). Source volume = sum of all vessels
 * holding the batch; destination must equal source for the engine's balance
 * check (no implicit loss in a withdrawal — the spirit is sold, not lost).
 */
const props = defineProps<{
	batch: Batch;
}>();

const emit = defineEmits<{ withdrawn: [] }>();

const overlay = useOverlay();
const modal = overlay.create(LazyModalTransferAction);
const vesselStore = useVesselStore();

function findSources() {
	const out: { vessel: string; volume: number; proof: number }[] = [];
	for (const v of vesselStore.items) {
		const slot = (v.contents || []).find((c: any) => String(c.batch) === props.batch._id);
		if (slot && slot.volume > 0) {
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
			out.push({ vessel: v._id, volume: slot.volume, proof });
		}
	}
	return out;
}

async function open() {
	const sources = findSources();
	const totalVol = sources.reduce((s, x) => s + x.volume, 0);
	// Volume-weighted average proof for the virtual destination
	const totalPG = sources.reduce((s, x) => s + (x.volume * x.proof), 0);
	const avgProof = totalVol > 0 ? totalPG / totalVol : 0;

	const prefill: Partial<TransferInput> = {
		type: 'tax_paid_withdrawal',
		batch: props.batch._id,
		fromStage: props.batch.currentStage,
		toStage: null,
		sources,
		destinations: totalVol > 0
			? [{ vessel: null, stage: null, volume: totalVol, proof: avgProof }]
			: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		ttbAccount: { from: null, to: 'tax_paid' },
	};
	const result = await modal.open({ prefill }).result;
	if (result) emit('withdrawn');
}
</script>

<template>
	<UButton
		icon="i-lucide-package-check"
		color="success"
		variant="outline"
		@click="open"
	>
		Tax-Paid Withdrawal
	</UButton>
</template>
