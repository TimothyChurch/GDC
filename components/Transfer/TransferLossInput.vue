<script setup lang="ts">
import type { TransferLoss } from '~/types/interfaces/Transfer';

const props = defineProps<{
	loss: TransferLoss;
	autoLossVolume?: number;  // computed shortfall in gallons (canonical)
}>();

const emit = defineEmits<{ update: [Partial<TransferLoss>] }>();

const u = useDisplayUnits();

const reasonItems = LOSS_REASON_CODES.map((code) => ({
	label: LOSS_REASON_LABELS[code],
	value: code,
}));

const noLossChecked = computed({
	get: () => props.loss.reasonCode === 'no_loss',
	set: (val: boolean) => {
		if (val) {
			emit('update', { reasonCode: 'no_loss', volume: 0, proof: 0 });
		} else {
			emit('update', { reasonCode: 'evaporation' });
		}
	},
});

const showDetails = computed(() => props.loss.reasonCode && props.loss.reasonCode !== 'no_loss');

function applyAutoLoss() {
	if (props.autoLossVolume !== undefined && props.autoLossVolume > 0) {
		emit('update', { volume: props.autoLossVolume });
	}
}

const lossAbv = computed({
	get: () => (props.loss.proof || 0) / 2,
	set: (abv: number | null) => emit('update', { proof: (abv ?? 0) * 2 }),
});

const lossVolume = computed({
	get: () => props.loss.volume,
	set: (v: number | null) => emit('update', { volume: v ?? 0 }),
});
</script>

<template>
	<UCard variant="subtle" class="border border-default/40">
		<template #header>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-droplet" class="text-warning" />
					<span class="text-sm font-semibold">Loss</span>
				</div>
				<UCheckbox
					:model-value="noLossChecked"
					@update:model-value="(v) => (noLossChecked = v as boolean)"
					label="No loss (zero attestation)"
				/>
			</div>
		</template>

		<div v-if="showDetails" class="space-y-3">
			<UFormField label="Reason" name="loss.reasonCode" required>
				<USelectMenu
					:model-value="loss.reasonCode"
					:items="reasonItems.filter(r => r.value !== 'no_loss')"
					value-key="value"
					@update:model-value="(v) => emit('update', { reasonCode: v as any })"
					class="w-full"
				/>
			</UFormField>

			<div class="grid grid-cols-2 gap-3">
				<UFormField label="Volume" name="loss.volume">
					<FormVolumeInput v-model="lossVolume" placeholder="0.00" />
				</UFormField>
				<UFormField label="Strength" name="loss.proof">
					<FormStrengthInput v-model="lossAbv" placeholder="0" />
				</UFormField>
			</div>

			<div v-if="autoLossVolume && autoLossVolume > 0 && Math.abs(loss.volume - autoLossVolume) > 0.001" class="text-xs text-muted flex items-center gap-2">
				<UIcon name="i-lucide-info" />
				Reconciliation gap is <span class="font-mono">{{ u.formatVolume(autoLossVolume) }}</span>.
				<UButton size="xs" variant="link" @click="applyAutoLoss">Apply</UButton>
			</div>

			<UFormField label="Notes (optional)" name="loss.notes">
				<UInput
					:model-value="loss.notes"
					@update:model-value="(v) => emit('update', { notes: v as string })"
					placeholder="Additional context for this loss…"
				/>
			</UFormField>
		</div>

		<div v-else class="text-xs text-muted">
			<UIcon name="i-lucide-check-circle" class="text-success mr-1 inline" />
			Zero-loss attested. Source volume must equal destination volume.
		</div>
	</UCard>
</template>
