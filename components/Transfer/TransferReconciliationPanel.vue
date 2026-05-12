<script setup lang="ts">
const props = defineProps<{
	totalSourceVolume: number;     // canonical wine gallons
	totalDestVolume: number;       // canonical wine gallons
	totalLossVolume: number;       // canonical wine gallons
	sourcePG: number;
	destPG: number;
	lossPG: number;
	balanced: boolean;
	bypassReason?: string | null;
	ttbAccountFrom?: string | null;
	ttbAccountTo?: string | null;
	reportingPeriod?: string;
}>();

const u = useDisplayUnits();

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
	return `Off by ${u.formatVolume(Math.abs(wgVariance.value), { decimals: 3 })} · ${Math.abs(pgVariance.value).toFixed(3)} PG`;
});
</script>

<template>
	<UCard
		variant="subtle"
		:class="balanced ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/40'"
		class="border"
	>
		<div class="space-y-3">
			<!-- Status header -->
			<div class="flex items-center gap-2">
				<UIcon :name="statusIcon" :class="balanced ? 'text-success' : 'text-error'" class="text-lg" />
				<span
					class="text-sm font-semibold"
					:class="balanced ? 'text-green-300' : 'text-red-200'"
				>
					{{ statusText }}
				</span>
			</div>

			<!-- Reconciliation table — totals shown in display unit (canonical converted on render) -->
			<div class="grid grid-cols-3 gap-2 text-xs">
				<div></div>
				<div class="text-right text-parchment/60 font-medium uppercase tracking-wide">{{ u.volumeLabel.value }}</div>
				<div class="text-right text-parchment/60 font-medium uppercase tracking-wide">Proof Gal</div>

				<div class="text-parchment/70">Source</div>
				<div class="text-right font-mono text-parchment">{{ u.formatVolume(totalSourceVolume, { decimals: 3, withLabel: false }) }}</div>
				<div class="text-right font-mono text-parchment">{{ sourcePG.toFixed(3) }}</div>

				<div class="text-parchment/70">Destination</div>
				<div class="text-right font-mono text-parchment">{{ u.formatVolume(totalDestVolume, { decimals: 3, withLabel: false }) }}</div>
				<div class="text-right font-mono text-parchment">{{ destPG.toFixed(3) }}</div>

				<div class="text-parchment/70">Loss</div>
				<div class="text-right font-mono text-parchment">{{ u.formatVolume(totalLossVolume, { decimals: 3, withLabel: false }) }}</div>
				<div class="text-right font-mono text-parchment">{{ lossPG.toFixed(3) }}</div>

				<div class="border-t border-parchment/20 pt-1 text-parchment/70 font-medium">Variance</div>
				<div
					class="border-t border-parchment/20 pt-1 text-right font-mono"
					:class="Math.abs(wgVariance) > 0.001 ? 'text-red-200 font-semibold' : 'text-parchment'"
				>
					{{ u.formatVolume(wgVariance, { decimals: 3, withLabel: false }) }}
				</div>
				<div
					class="border-t border-parchment/20 pt-1 text-right font-mono"
					:class="Math.abs(pgVariance) > 0.001 ? 'text-red-200 font-semibold' : 'text-parchment'"
				>
					{{ pgVariance.toFixed(3) }}
				</div>
			</div>

			<!-- TTB metadata -->
			<div v-if="ttbAccountFrom || ttbAccountTo || reportingPeriod" class="flex flex-wrap gap-2 text-xs pt-2 border-t border-parchment/20">
				<UBadge v-if="ttbAccountFrom" color="neutral" variant="subtle" size="xs">
					From: {{ ttbAccountFrom }}
				</UBadge>
				<UIcon v-if="ttbAccountFrom && ttbAccountTo" name="i-lucide-arrow-right" class="text-parchment/60 self-center" />
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
