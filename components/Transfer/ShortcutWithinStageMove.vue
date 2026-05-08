<script setup lang="ts">
import type { Batch } from '~/types';
import type { TransferInput } from '~/types/interfaces/Transfer';
import { LazyModalTransferAction } from '#components';

/**
 * Phase 6.2 — Within-stage vessel move.
 *
 * Liquid changes vessel without changing stage. Pre-fills type='vessel_move'
 * with from/to stage = current. Sources auto-populated from every vessel
 * containing the batch.
 */
const props = defineProps<{
	batch: Batch;
	stage?: string;
}>();

const emit = defineEmits<{ moved: [] }>();

const overlay = useOverlay();
const modal = overlay.create(LazyModalTransferAction);
const vesselStore = useVesselStore();

const stage = computed(() => props.stage || props.batch.currentStage);

function findSources() {
	const out: { vessel: string; volume: number; proof: number }[] = [];
	for (const v of vesselStore.crud.items.value) {
		const slot = (v.contents || []).find((c: any) => String(c.batch) === props.batch._id);
		if (slot && slot.volume > 0) {
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
			out.push({ vessel: v._id, volume: slot.volume, proof });
		}
	}
	return out;
}

async function open() {
	const prefill: Partial<TransferInput> = {
		type: 'vessel_move',
		batch: props.batch._id,
		fromStage: stage.value,
		toStage: stage.value,
		sources: findSources(),
		destinations: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
	};
	const result = await modal.open({ prefill }).result;
	if (result) emit('moved');
}
</script>

<template>
	<UButton
		icon="i-lucide-arrow-right-left"
		color="cyan"
		variant="outline"
		@click="open"
	>
		Move within {{ stage }}
	</UButton>
</template>
