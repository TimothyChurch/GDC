<script setup lang="ts">
const props = defineProps<{
	totalSourceVolume: number;
	totalDestVolume: number;
	totalLossVolume: number;
	sourcePG: number;
	destPG: number;
	lossPG: number;
	balanced: boolean;
	bypassReason?: string | null;       // e.g., 'Initial entry — balance check skipped'
	ttbAccountFrom?: string | null;
	ttbAccountTo?: string | null;
	reportingPeriod?: string;
}>();

const wgVariance = computed(() =>
	props.totalSourceVolume - (props.totalDestVolume + props.totalLossVolume),
);
const pgVariance = computed(() =>
	props.sourcePG - (props.destPG + props.lossPG),
);

const statusColor = computed(() => props.balanced ? 'success' : 'error');
const statusIcon = computed(() => props.balanced ? 'i-lucide-check-circle' : 'i-lucide-alert-circle');
const statusText = computed(() => {
	if (props.bypassReason) return props.bypassReason;
	if (props.balanced) return 'Reconciled — ready to submit';
	return `Off by ${Math.abs(wgVariance.value).toFixed(3)} gal · ${Math.abs(pgVariance.value).toFixed(3)} PG`;
});
</script>

<template>
	<UCard variant="solid" :class="balanced ? 'bg-success/5' : 'bg-error/5'" class="border" :ui="{ root: balanced ? 'border-success/30' : 'border-error/30' }">
		<div class="space-y-3">
			<!-- Status header -->
			<div class="flex items-center gap-2">
				<UIcon :name="statusIcon" :class="balanced ? 'text-success' : 'text-error'" class="text-lg" />
				<span class="text-sm font-semibold" :class="balanced ? 'text-success' : 'text-error'">
					{{ statusText }}
				</span>
			</div>

			<!-- Reconciliation table -->
			<div class="grid grid-cols-3 gap-2 text-xs">
				<div></div>
				<div class="text-right text-muted font-medium uppercase tracking-wide">Wine Gal</div>
				<div class="text-right text-muted font-medium uppercase tracking-wide">Proof Gal</div>

				<div class="text-muted">Source</div>
				<div class="text-right font-mono">{{ totalSourceVolume.toFixed(3) }}</div>
				<div class="text-right font-mono">{{ sourcePG.toFixed(3) }}</div>

				<div class="text-muted">Destination</div>
				<div class="text-right font-mono">{{ totalDestVolume.toFixed(3) }}</div>
				<div class="text-right font-mono">{{ destPG.toFixed(3) }}</div>

				<div class="text-muted">Loss</div>
				<div class="text-right font-mono">{{ totalLossVolume.toFixed(3) }}</div>
				<div class="text-right font-mono">{{ lossPG.toFixed(3) }}</div>

				<div class="border-t border-default pt-1 text-muted font-medium">Variance</div>
				<div class="border-t border-default pt-1 text-right font-mono" :class="Math.abs(wgVariance) > 0.001 ? 'text-error font-semibold' : ''">
					{{ wgVariance.toFixed(3) }}
				</div>
				<div class="border-t border-default pt-1 text-right font-mono" :class="Math.abs(pgVariance) > 0.001 ? 'text-error font-semibold' : ''">
					{{ pgVariance.toFixed(3) }}
				</div>
			</div>

			<!-- TTB metadata -->
			<div v-if="ttbAccountFrom || ttbAccountTo || reportingPeriod" class="flex flex-wrap gap-2 text-xs pt-2 border-t border-default">
				<UBadge v-if="ttbAccountFrom" color="neutral" variant="subtle" size="xs">
					From: {{ ttbAccountFrom }}
				</UBadge>
				<UIcon v-if="ttbAccountFrom && ttbAccountTo" name="i-lucide-arrow-right" class="text-muted self-center" />
				<UBadge v-if="ttbAccountTo" color="neutral" variant="subtle" size="xs">
					To: {{ ttbAccountTo }}
				</UBadge>
				<UBadge v-if="reportingPeriod" color="info" variant="subtle" size="xs" icon="i-lucide-calendar">
					Period {{ reportingPeriod }}
				</UBadge>
			</div>
		</div>
	</UCard>
</template>
