<script setup lang="ts">
import type { Batch } from '~/types';
import type { TransferInput } from '~/types/interfaces/Transfer';
import { getStageVolume } from '~/composables/batchPipeline';

/**
 * Phase 6.9 — terminal-Storage finisher.
 *
 * When a batch reaches the end of its pipeline at Storage with no further
 * stage, this lets the user deposit the spirits into a BulkSpirit entry
 * (cooperage ledger) and mark the batch completed.
 *
 * Drains the vessel via a destruction-typed Transfer (engine-atomic) with a
 * note flagging the bulk-storage destination. A future iteration may add a
 * dedicated `bulk_storage_deposit` transfer type so TTB reports can break
 * this out from genuine destruction.
 */
const props = defineProps<{ batch: Batch }>();
const emit = defineEmits<{ completed: [] }>();

const batchStore = useBatchStore();
const vesselStore = useVesselStore();
const bulkSpiritStore = useBulkSpiritStore();
const transferStore = useTransferStore();
const toast = useToast();

const open = ref(false);
const selectedBulkSpirit = ref('');
const submitting = ref(false);

const bulkSpiritOptions = computed(() =>
	bulkSpiritStore.activeBulkSpirits.map((bs) => ({
		label: `${bs.name} (${bs.volume.toFixed(1)} ${bs.volumeUnit})`,
		value: bs._id,
	})),
);

const batchVesselContents = computed(() => {
	for (const vessel of vesselStore.vessels) {
		const entry = vessel.contents?.find((c: any) => String(c.batch) === props.batch._id);
		if (entry) return { vesselId: vessel._id, ...entry };
	}
	return null;
});

const summary = computed(() => {
	const vc = batchVesselContents.value;
	if (vc) return { volume: vc.volume, volumeUnit: vc.volumeUnit, abv: vc.abv, value: vc.value };
	return {
		volume: getStageVolume(props.batch, 'Storage'),
		volumeUnit: props.batch.batchSizeUnit || 'gallon',
		abv: (getStage(props.batch, 'storage') as any)?.abv || 0,
		value: props.batch.batchCost || props.batch.recipeCost || 0,
	};
});

const bulkSpiritName = computed(() => {
	const target = bulkSpiritStore.items.find((bs: any) => bs._id === selectedBulkSpirit.value);
	return target?.name || 'bulk spirit';
});

async function complete() {
	if (!selectedBulkSpirit.value) return;
	submitting.value = true;
	try {
		const vc = batchVesselContents.value;
		const volume = vc?.volume || summary.value.volume;
		const volumeUnit = vc?.volumeUnit || summary.value.volumeUnit;
		const abv = vc?.abv || summary.value.abv;
		const value = vc?.value || summary.value.value;
		const proof = abv * 2;

		// 1. Drain the source vessel atomically via the engine.
		if (vc?.vesselId && volume > 0) {
			const drain: TransferInput = {
				type: 'destruction',
				batch: props.batch._id,
				fromStage: 'Storage',
				toStage: null,
				sources: [{ vessel: vc.vesselId, volume, proof }],
				destinations: [],
				loss: {
					volume,
					proof,
					reasonCode: 'other',
					notes: `Deposited to bulk-spirit storage: ${bulkSpiritName.value}`,
				},
				notes: `Bulk storage deposit (${bulkSpiritName.value})`,
			};
			await transferStore.create(drain);
		}

		// 2. Record the deposit on the bulk-spirit ledger.
		await bulkSpiritStore.deposit(selectedBulkSpirit.value, {
			batchId: props.batch._id,
			volume,
			volumeUnit,
			abv,
			value,
		});

		// 3. Mark the batch completed (routine PUT — engine-owned fields stripped by beforeUpdate).
		const target = batchStore.getBatchById(props.batch._id);
		if (target) {
			target.status = 'completed';
			if (target.stages?.storage) target.stages.storage.completedAt = new Date();
			batchStore.batch = target;
			await batchStore.updateBatch();
		}

		open.value = false;
		selectedBulkSpirit.value = '';
		toast.add({
			title: 'Batch completed to bulk storage',
			description: `${volume.toFixed(1)} ${volumeUnit} deposited`,
			color: 'success',
			icon: 'i-lucide-archive',
		});
		emit('completed');
	} catch (err) {
		toast.add({
			title: 'Failed to complete to bulk storage',
			description: getErrorMessage(err),
			color: 'error',
			icon: 'i-lucide-alert-circle',
		});
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<div>
		<UButton
			icon="i-lucide-archive"
			class="border font-semibold bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25"
			size="lg"
			variant="ghost"
			@click="open = true"
		>
			Complete to Bulk Storage
		</UButton>

		<UModal v-model:open="open">
			<template #content>
				<div class="p-5">
					<h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
						Complete to Bulk Storage
					</h3>

					<div class="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 mb-4">
						<UIcon name="i-lucide-info" class="text-purple-400 shrink-0" />
						<span class="text-xs text-parchment/70">
							This will drain the source vessel atomically, deposit its contents into a bulk-spirit entry for future blends, and mark the batch completed.
						</span>
					</div>

					<div class="grid grid-cols-2 gap-3 text-sm mb-4 rounded-lg border border-brown/30 p-3">
						<div>
							<span class="text-parchment/50">Volume:</span>
							<span class="text-parchment ml-1">
								{{ (summary.volume || 0).toFixed(1) }} {{ summary.volumeUnit }}
							</span>
						</div>
						<div>
							<span class="text-parchment/50">ABV:</span>
							<span class="text-parchment ml-1">{{ (summary.abv || 0).toFixed(1) }}%</span>
						</div>
					</div>

					<div class="mb-4">
						<div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Select Bulk Spirit</div>
						<USelectMenu
							v-model="selectedBulkSpirit"
							:items="bulkSpiritOptions"
							value-key="value"
							placeholder="Choose bulk spirit entry..."
						/>
						<div class="text-xs text-parchment/50 mt-1">
							Create a new entry on the
							<NuxtLink to="/admin/bulk-spirits" class="text-gold hover:text-copper">Bulk Spirits</NuxtLink>
							page first if needed.
						</div>
					</div>

					<div class="flex justify-end gap-2 mt-6">
						<UButton variant="outline" color="neutral" @click="open = false">Cancel</UButton>
						<UButton
							@click="complete"
							:loading="submitting"
							:disabled="!selectedBulkSpirit"
							icon="i-lucide-archive"
						>
							Complete &amp; Deposit
						</UButton>
					</div>
				</div>
			</template>
		</UModal>
	</div>
</template>
