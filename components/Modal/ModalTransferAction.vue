<script setup lang="ts">
import type { TransferInput } from '~/types/interfaces/Transfer';

/**
 * useOverlay-compatible wrapper around TransferActionForm (Phase 5.8).
 *
 * Resolves with the `{ transfer, batch, updatedVessels }` payload on submit, or
 * `null` if the user dismisses. We deliberately do NOT declare an `open` model
 * here — Nuxt UI's OverlayProvider binds `v-model:open` to this component, and
 * we let it fall through as an attr to USlideover (matches the PanelBatch /
 * PanelProduction pattern). Declaring defineModel('open') with a default
 * intercepts the prop and races with the parent's reactive open=true, which
 * snaps DialogRoot back to open=false and unmounts the panel content.
 */
defineProps<{
	prefill?: Partial<TransferInput>;
}>();

const emit = defineEmits<{
	close: [result: { transfer: any; batch: any; updatedVessels: any[] } | null];
}>();
</script>

<template>
	<USlideover
		side="right"
		:close="{ onClick: () => emit('close', null) }"
		:ui="{ content: 'w-full sm:max-w-xl lg:max-w-4xl xl:max-w-6xl' }"
	>
		<template #content>
			<TransferActionForm
				:prefill="prefill"
				@submitted="(result) => emit('close', result)"
				@close="emit('close', null)"
			/>
		</template>
	</USlideover>
</template>
