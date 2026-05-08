<script setup lang="ts">
import type { TransferInput } from '~/types/interfaces/Transfer';

/**
 * useOverlay-compatible wrapper around TransferActionForm (Phase 5.8).
 *
 * Usage:
 *   const overlay = useOverlay()
 *   const modal = overlay.create(LazyModalTransferAction)
 *   const result = await modal.open({ prefill: { batch, fromStage, toStage, sources } }).result
 *   if (result) { ... }
 *
 * Resolves with the `{ transfer, batch, updatedVessels }` payload on submit, or
 * `null` if the user dismisses. The form itself owns its USlideover chrome, so
 * this component is a typed pass-through that normalises both exit paths into
 * a single `close` event.
 */
defineProps<{
	prefill?: Partial<TransferInput>;
}>();

const emit = defineEmits<{
	close: [result: { transfer: any; batch: any; updatedVessels: any[] } | null];
}>();
</script>

<template>
	<TransferActionForm
		:prefill="prefill"
		@submitted="(result) => emit('close', result)"
		@close="emit('close', null)"
	/>
</template>
