<script setup lang="ts">
import type { TransferInput } from '~/types/interfaces/Transfer';

/**
 * Unified Transfer Action form (Phase 5 of PLAN-PIPELINE-REVAMP.md §6.5).
 *
 * Single screen for all liquid movement: stage transitions, vessel moves,
 * splits, merges, withdrawals, destruction, samples, TIB transfers.
 *
 * Replaces the Phase-2 multi-PUT BatchAdvanceAction pattern (Bugs 1.1-1.5)
 * with one atomic engine call. Source vessel selection is multi-vessel-aware,
 * surfacing every vessel containing the batch (Bug 4.1, 4.2).
 *
 * Emits:
 *   close — user dismissed
 *   submitted — transfer succeeded; payload includes the updated docs
 */
const props = defineProps<{
	prefill?: Partial<TransferInput>;
}>();

const emit = defineEmits<{
	close: [];
	submitted: [{ transfer: any; batch: any; updatedVessels: any[] }];
}>();

const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const form = useTransferForm(props.prefill);

// ─── Batch context ─────────────────────────────────────────────────────────
const currentBatch = computed(() => {
	if (!form.batch.value) return null;
	return batchStore.crud.items.value.find((b) => b._id === form.batch.value) || null;
});

const transferTypeItems = TRANSFER_TYPES.map((t) => ({
	label: TRANSFER_TYPE_LABELS[t],
	value: t,
}));

const stageItemsForBatch = computed(() => {
	if (!currentBatch.value) return [];
	return ['Upcoming', ...currentBatch.value.pipeline].map((s) => ({ label: s, value: s }));
});

const reportingPeriod = computed(() => getCurrentReportingPeriod());

// Auto-suggest loss volume = source - dest when there's a positive shortfall
const suggestedLossVolume = computed(() => {
	const variance = form.totalSourceVolume.value - form.totalDestVolume.value - form.totalLossVolume.value;
	return variance > 0.001 ? Number(variance.toFixed(4)) : 0;
});

const bypassReason = computed(() => {
	if ((form.fromStage.value === 'Upcoming' || form.fromStage.value === null) && form.sources.value.length === 0) {
		return 'Initial entry — balance check skipped';
	}
	if (form.type.value === 'tib_in' && form.sources.value.length === 0) {
		return 'TIB receipt from external DSP — balance check skipped';
	}
	return null;
});

const sourceVesselIds = computed(() => form.sources.value.map(s => s.vessel).filter(Boolean));

// ─── Submit ────────────────────────────────────────────────────────────────
async function onSubmit() {
	if (!form.canSubmit.value) return;
	const result = await form.submit();
	if (result) {
		emit('submitted', result);
		emit('close');
	}
}

function onCancel() {
	emit('close');
}

// ─── Initial seed: ensure at least one source/dest if context allows ──────
onMounted(() => {
	if (form.sources.value.length === 0 && form.fromStage.value && form.fromStage.value !== 'Upcoming') {
		form.addSource();
	}
	if (form.destinations.value.length === 0 && form.toStage.value) {
		form.addDestination();
	}
});
</script>

<template>
	<USlideover side="right" :close="{ onClick: onCancel }">
		<template #content>
			<div class="flex flex-col h-full w-full sm:max-w-2xl bg-default">
				<!-- Header -->
				<div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
					<div class="flex items-center gap-3">
						<TransferTypeBadge :type="form.type.value" />
						<h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
							Transfer Action
						</h2>
					</div>
					<UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="onCancel" />
				</div>

				<!-- Form body -->
				<div class="flex-1 overflow-y-auto p-4 space-y-4">
					<!-- Type + batch context -->
					<UCard variant="subtle">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<UFormField label="Transfer type" name="type">
								<USelectMenu
									v-model="form.type.value"
									:items="transferTypeItems"
									value-key="value"
									class="w-full"
								/>
							</UFormField>
							<UFormField label="Batch" name="batch">
								<UInput
									:model-value="currentBatch?.batchNumber || form.batch.value"
									readonly
									:placeholder="form.batch.value ? form.batch.value : 'No batch selected'"
								/>
							</UFormField>
							<UFormField label="From stage" name="fromStage">
								<USelectMenu
									:model-value="form.fromStage.value"
									:items="stageItemsForBatch"
									value-key="value"
									:placeholder="'(none — initial entry)'"
									class="w-full"
									@update:model-value="(v: any) => form.fromStage.value = v"
								/>
							</UFormField>
							<UFormField label="To stage" name="toStage">
								<USelectMenu
									:model-value="form.toStage.value"
									:items="stageItemsForBatch"
									value-key="value"
									:placeholder="'(none — destruction/withdrawal)'"
									class="w-full"
									@update:model-value="(v: any) => form.toStage.value = v"
								/>
							</UFormField>
						</div>
					</UCard>

					<!-- Sources -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-bold uppercase tracking-wide text-muted">
								Sources ({{ form.sources.value.length }})
							</h3>
							<UButton
								icon="i-lucide-plus"
								size="xs"
								variant="outline"
								color="primary"
								@click="form.addSource()"
								:disabled="form.fromStage.value === 'Upcoming' && form.sources.value.length > 0"
							>
								Add source
							</UButton>
						</div>
						<TransferSourceCard
							v-for="(src, i) in form.sources.value"
							:key="`src-${i}`"
							:source="src"
							:batch-id="form.batch.value"
							:index="i"
							:allow-remove="form.sources.value.length > 0"
							@update="(patch) => form.updateSource(i, patch)"
							@remove="form.removeSource(i)"
						/>
						<div v-if="form.sources.value.length === 0" class="text-xs text-muted italic px-2">
							No sources — for new batches starting in their first stage, this is correct.
						</div>
					</div>

					<!-- Destinations -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-bold uppercase tracking-wide text-muted">
								Destinations ({{ form.destinations.value.length }})
							</h3>
							<UButton
								icon="i-lucide-plus"
								size="xs"
								variant="outline"
								color="primary"
								@click="form.addDestination()"
								:disabled="['destruction', 'tax_paid_withdrawal', 'sample'].includes(form.type.value) && form.destinations.value.length > 0"
							>
								Add destination
							</UButton>
						</div>
						<TransferDestCard
							v-for="(dest, i) in form.destinations.value"
							:key="`dest-${i}`"
							:dest="dest"
							:index="i"
							:default-stage="form.toStage.value"
							:allow-remove="form.destinations.value.length > 0"
							:exclude-vessel-id="sourceVesselIds[0]"
							@update="(patch) => form.updateDestination(i, patch)"
							@remove="form.removeDestination(i)"
						/>
						<div v-if="form.destinations.value.length === 0" class="text-xs text-muted italic px-2">
							No destinations — destruction, withdrawal, and sample transfers don't require one.
						</div>
					</div>

					<!-- Loss line -->
					<TransferLossInput
						:loss="form.loss.value"
						:auto-loss-volume="suggestedLossVolume"
						@update="(patch) => form.loss.value = { ...form.loss.value, ...patch }"
					/>

					<!-- Reconciliation -->
					<TransferReconciliationPanel
						:total-source-volume="form.totalSourceVolume.value"
						:total-dest-volume="form.totalDestVolume.value"
						:total-loss-volume="form.totalLossVolume.value"
						:source-p-g="form.sourcePG.value"
						:dest-p-g="form.destPG.value"
						:loss-p-g="form.lossPG.value"
						:balanced="form.balanced.value"
						:bypass-reason="bypassReason"
						:ttb-account-from="form.ttbAccountFrom.value"
						:ttb-account-to="form.ttbAccountTo.value"
						:reporting-period="reportingPeriod"
					/>

					<!-- Notes -->
					<UFormField label="Notes (optional)" name="notes">
						<UTextarea
							v-model="form.notes.value"
							placeholder="Context for this transfer (operator notes, run numbers, observations…)"
							:rows="2"
						/>
					</UFormField>
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10">
					<div class="text-xs text-muted">
						Period <span class="font-mono">{{ reportingPeriod }}</span>
					</div>
					<div class="flex gap-2">
						<UButton color="neutral" variant="outline" @click="onCancel">Cancel</UButton>
						<UButton
							color="primary"
							:loading="form.submitting.value"
							:disabled="!form.canSubmit.value"
							icon="i-lucide-check"
							@click="onSubmit"
						>
							Submit Transfer
						</UButton>
					</div>
				</div>
			</div>
		</template>
	</USlideover>
</template>
