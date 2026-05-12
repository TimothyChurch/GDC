<script setup lang="ts">
import type { Batch } from '~/types';
import type { Transfer } from '~/types/interfaces/Transfer';

/**
 * Phase 6.8 — Transfer history for a batch.
 *
 * Replaces the legacy `batch.transferLog[]` table with a query-driven view of
 * the Transfer collection. Each row supports one-click reverse for transfers
 * in an open reporting period; closed-period transfers show a lock icon.
 */
const props = defineProps<{
	batch: Batch;
}>();

const transferStore = useTransferStore();
const vesselStore = useVesselStore();

const loading = ref(false);
const transfers = ref<Transfer[]>([]);
const reversingId = ref<string | null>(null);

const currentPeriod = computed(() => getCurrentReportingPeriod());

async function refresh() {
	loading.value = true;
	try {
		transfers.value = await transferStore.list({ batch: props.batch._id, limit: 50 });
	} finally {
		loading.value = false;
	}
}

watchEffect(() => {
	if (props.batch?._id) void refresh();
});

const vesselNameById = (id: string | null | undefined) => {
	if (!id) return '—';
	return vesselStore.items.find(v => v._id === id)?.name || id.slice(-6);
};

function summarizeSources(t: Transfer): string {
	if (!t.sources?.length) return '—';
	return t.sources.map(s => `${vesselNameById(s.vessel)} (${s.volume.toFixed(1)} gal)`).join(', ');
}

function summarizeDestinations(t: Transfer): string {
	if (!t.destinations?.length) return '—';
	return t.destinations.map(d =>
		`${d.vessel ? vesselNameById(d.vessel) : 'Tax-Paid'} (${(d.volume ?? 0).toFixed(1)} gal)`,
	).join(', ');
}

function periodLocked(t: Transfer): boolean {
	return t.reportingPeriod !== currentPeriod.value;
}

function canReverse(t: Transfer): boolean {
	if (t.status === 'reversed') return false;
	if (t.type === 'reversal') return false;
	if (periodLocked(t)) return false;
	return true;
}

async function reverse(t: Transfer) {
	reversingId.value = t._id;
	try {
		await transferStore.reverse(t._id, 'Reversed from batch history');
		await refresh();
	} finally {
		reversingId.value = null;
	}
}

const formatDate = (iso?: string) =>
	iso ? new Date(iso).toLocaleString(undefined, {
		month: 'short', day: 'numeric',
		hour: 'numeric', minute: '2-digit',
	}) : '—';

const transferById = computed(() => {
	const map = new Map<string, Transfer>();
	for (const t of transfers.value) map.set(t._id, t);
	return map;
});

function shortId(id: string | null | undefined): string {
	return id ? `#${id.slice(-6)}` : '';
}

function reverserCreatorName(t: Transfer): string | null {
	if (!t.reversedBy) return null;
	const rev = transferById.value.get(t.reversedBy);
	return rev?.createdBy?.name || null;
}

function correctorNameForReversal(t: Transfer): string | null {
	if (t.type !== 'reversal') return null;
	return t.createdBy?.name || null;
}

const highlightedId = ref<string | null>(null);
function pairFor(t: Transfer): string | null {
	return t.reverses || t.reversedBy || null;
}
</script>

<template>
	<div class="bg-charcoal rounded-xl border border-brown/30 p-5">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Transfer History</h3>
			<UButton
				size="xs"
				variant="ghost"
				color="neutral"
				icon="i-lucide-refresh-cw"
				:loading="loading"
				@click="refresh"
			>
				Refresh
			</UButton>
		</div>

		<div v-if="loading && transfers.length === 0" class="flex items-center justify-center py-8">
			<UIcon name="i-lucide-loader-2" class="animate-spin text-2xl text-parchment/40" />
		</div>

		<div v-else-if="transfers.length === 0" class="py-8 text-center text-sm text-parchment/50">
			No transfers yet. Use a Transfer Action above to move liquid.
		</div>

		<div v-else class="space-y-2">
			<div
				v-for="t in transfers"
				:key="t._id"
				class="flex items-start gap-3 p-3 rounded-lg border bg-charcoal/60 transition-colors"
				:class="[
					t.status === 'reversed' ? 'opacity-60 italic' : '',
					highlightedId === t._id || (highlightedId && pairFor(t) === highlightedId)
						? 'border-amber-500/40 bg-amber-500/5'
						: 'border-brown/20',
				]"
				@mouseenter="highlightedId = t._id"
				@mouseleave="highlightedId = null"
			>
				<div class="shrink-0 pt-0.5">
					<TransferTypeBadge :type="t.type" size="sm" />
				</div>

				<div class="min-w-0 flex-1">
					<div class="flex items-center flex-wrap gap-2 text-xs text-parchment/60">
						<span class="font-mono">{{ formatDate(t.createdAt) }}</span>
						<span class="font-mono text-parchment/30">{{ shortId(t._id) }}</span>
						<UBadge size="xs" color="neutral" variant="subtle" :icon="periodLocked(t) ? 'i-lucide-lock' : 'i-lucide-calendar'">
							{{ t.reportingPeriod }}
						</UBadge>
						<UBadge v-if="t.status === 'reversed'" size="xs" color="warning" variant="subtle" icon="i-lucide-undo-2">
							Reversed{{ reverserCreatorName(t) ? ` by ${reverserCreatorName(t)}` : '' }}
							<span v-if="t.reversedBy" class="font-mono ml-1">→ {{ shortId(t.reversedBy) }}</span>
						</UBadge>
						<UBadge v-if="t.type === 'reversal' && t.reverses" size="xs" color="info" variant="subtle" icon="i-lucide-corner-up-left">
							Reverses {{ shortId(t.reverses) }}{{ correctorNameForReversal(t) ? ` · ${correctorNameForReversal(t)}` : '' }}
						</UBadge>
						<span v-if="t.createdBy?.name && t.type !== 'reversal'" class="text-parchment/40">
							· {{ t.createdBy.name }}
						</span>
					</div>
					<div class="text-sm text-parchment mt-1">
						<span v-if="t.fromStage" class="font-medium">{{ t.fromStage }}</span>
						<UIcon v-if="t.fromStage && t.toStage" name="i-lucide-arrow-right" class="mx-1 inline text-parchment/40" />
						<span v-if="t.toStage" class="font-medium">{{ t.toStage }}</span>
					</div>
					<div class="text-xs text-parchment/70 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
						<div v-if="t.sources?.length"><span class="text-parchment/50">From:</span> {{ summarizeSources(t) }}</div>
						<div v-if="t.destinations?.length"><span class="text-parchment/50">To:</span> {{ summarizeDestinations(t) }}</div>
						<div v-if="t.totalLossVolume > 0">
							<span class="text-parchment/50">Loss:</span>
							<span class="font-mono">{{ t.totalLossVolume.toFixed(2) }} gal</span>
							<span class="text-parchment/50 ml-1">({{ t.loss?.reasonCode }})</span>
						</div>
						<div v-if="t.notes" class="sm:col-span-2 italic text-parchment/50">{{ t.notes }}</div>
					</div>
				</div>

				<div class="shrink-0">
					<UButton
						v-if="canReverse(t)"
						size="xs"
						variant="ghost"
						color="warning"
						icon="i-lucide-undo-2"
						:loading="reversingId === t._id"
						@click="reverse(t)"
					>
						Reverse
					</UButton>
					<UIcon
						v-else-if="periodLocked(t) && t.status !== 'reversed'"
						name="i-lucide-lock"
						class="text-parchment/40 mt-1"
						title="Reporting period closed"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
