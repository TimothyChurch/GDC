<script setup lang="ts">
import type { TransferType } from '~/types/interfaces/Transfer';

const props = defineProps<{
	type: TransferType;
	size?: 'sm' | 'md' | 'lg';
}>();

const icon = computed(() => {
	switch (props.type) {
		case 'stage_transition': return 'i-lucide-arrow-right';
		case 'vessel_move': return 'i-lucide-arrow-right-left';
		case 'split': return 'i-lucide-split';
		case 'merge': return 'i-lucide-merge';
		case 'tib_in': return 'i-lucide-download';
		case 'tib_out': return 'i-lucide-upload';
		case 'tax_paid_withdrawal': return 'i-lucide-package-check';
		case 'destruction': return 'i-lucide-trash-2';
		case 'sample': return 'i-lucide-test-tube';
		case 'redistillation': return 'i-lucide-refresh-cw';
		case 'reversal': return 'i-lucide-undo-2';
		default: return 'i-lucide-arrow-right';
	}
});
</script>

<template>
	<UBadge
		:color="(TRANSFER_TYPE_COLORS[type] as any) || 'neutral'"
		variant="subtle"
		:size="size || 'md'"
		:icon="icon"
	>
		{{ TRANSFER_TYPE_LABELS[type] }}
	</UBadge>
</template>
