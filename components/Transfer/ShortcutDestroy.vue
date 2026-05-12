<script setup lang="ts">
import type { Batch } from '~/types';
import type { TransferInput } from '~/types/interfaces/Transfer';
import { LazyModalTransferAction } from '#components';

/**
 * Phase 6.4 — Destruction shortcut.
 *
 * Spirit destroyed (dumped to drain). Pre-fills type='destruction' with no
 * destination and loss volume = source volume, reasonCode='destruction'.
 * Engine balance check: source = 0 dest + source loss ✓.
 */
const props = defineProps<{
	batch: Batch;
}>();

const emit = defineEmits<{ destroyed: [] }>();

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
	const totalPG = sources.reduce((s, x) => s + (x.volume * x.proof), 0);
	const avgProof = totalVol > 0 ? totalPG / totalVol : 0;

	const prefill: Partial<TransferInput> = {
		type: 'destruction',
		batch: props.batch._id,
		fromStage: props.batch.currentStage,
		toStage: null,
		sources,
		destinations: [],
		loss: totalVol > 0
			? { volume: totalVol, proof: avgProof, reasonCode: 'destruction' }
			: { volume: 0, proof: 0, reasonCode: 'no_loss' },
	};
	const result = await modal.open({ prefill }).result;
	if (result) emit('destroyed');
}
</script>

<template>
	<UButton
		icon="i-lucide-trash-2"
		color="error"
		variant="ghost"
		@click="open"
	>
		Destroy
	</UButton>
</template>
