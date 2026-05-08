import { defineStore } from 'pinia';
import type {
	Transfer,
	TransferInput,
} from '~/types/interfaces/Transfer';

/**
 * Transfer store — wraps `/api/transfer/*` endpoints.
 *
 * Transfers are immutable (append-only): there is no PUT, no DELETE.
 * Corrections are made by creating a `reversal` transfer that points back to
 * the original. Therefore this store does NOT use the `useCrudStore` factory.
 *
 * Phase 4 of PLAN-PIPELINE-REVAMP.md.
 *
 * The Transfer Engine on the server (server/utils/transferEngine.ts) is the
 * single source of truth for liquid movement. Every store action that wants
 * to advance a batch stage, move a batch between vessels, split, merge, or
 * withdraw spirit must build a `TransferInput` and call `create()` here.
 */
export const useTransferStore = defineStore('transfer', () => {
	const toast = useToast();

	// ─── State ────────────────────────────────────────────────────────────────
	const transfers = ref<Transfer[]>([]);
	const current = ref<Transfer | null>(null);
	const loading = ref(false);
	const saving = ref(false);

	// ─── Mutations: keep `transfers.value` reactive by replacing the array ────
	function prependTransfer(t: Transfer) {
		transfers.value = [t, ...transfers.value];
	}

	function replaceTransfer(t: Transfer) {
		const idx = transfers.value.findIndex(x => x._id === t._id);
		if (idx >= 0) {
			const next = transfers.value.slice();
			next[idx] = t;
			transfers.value = next;
		} else {
			prependTransfer(t);
		}
	}

	// ─── List / fetch ─────────────────────────────────────────────────────────

	interface ListFilters {
		batch?: string;
		vessel?: string;
		period?: string;
		type?: string;
		status?: 'committed' | 'reversed';
		limit?: number;
	}

	async function list(filters: ListFilters = {}): Promise<Transfer[]> {
		loading.value = true;
		try {
			const qs: Record<string, string> = {};
			if (filters.batch) qs.batch = filters.batch;
			if (filters.vessel) qs.vessel = filters.vessel;
			if (filters.period) qs.period = filters.period;
			if (filters.type) qs.type = filters.type;
			if (filters.status) qs.status = filters.status;
			if (filters.limit) qs.limit = String(filters.limit);
			const url = '/api/transfer' + (Object.keys(qs).length
				? '?' + new URLSearchParams(qs).toString()
				: '');
			const result = await $fetch<Transfer[]>(url);
			transfers.value = result;
			return result;
		} finally {
			loading.value = false;
		}
	}

	async function getById(id: string): Promise<Transfer> {
		const result = await $fetch<Transfer>(`/api/transfer/${id}`);
		current.value = result;
		return result;
	}

	// ─── Create + reverse ─────────────────────────────────────────────────────

	interface CreateResponse {
		transfer: Transfer;
		batch: any;
		updatedVessels: any[];
	}

	/**
	 * Create a new transfer. Returns the persisted Transfer plus the updated
	 * Batch and Vessel docs (so callers can sync their stores in one round trip).
	 *
	 * Throws via the toast on failure; rethrows for callers that want to
	 * react to specific error codes (e.g., USE_TRANSFER_ENDPOINT, PERIOD_LOCKED).
	 */
	async function create(input: TransferInput): Promise<CreateResponse> {
		saving.value = true;
		try {
			const response = await $fetch<CreateResponse>('/api/transfer/create', {
				method: 'POST',
				body: input,
			});
			prependTransfer(response.transfer);
			syncBatchAndVesselStores(response);

			const transferId = response.transfer._id;
			const isReversal = response.transfer.type === 'reversal';
			toast.add({
				title: 'Transfer recorded',
				description: describeTransfer(response.transfer),
				color: 'success',
				icon: 'i-lucide-check-circle',
				duration: 30_000,
				actions: isReversal ? undefined : [{
					label: 'Undo',
					icon: 'i-lucide-undo-2',
					color: 'neutral',
					variant: 'outline',
					onClick: () => { void reverse(transferId, 'Undo from success toast'); },
				}],
			});
			return response;
		} catch (error: unknown) {
			console.error('[useTransferStore.create]', error);
			toast.add({
				title: 'Transfer failed',
				description: getErrorMessage(error),
				color: 'error',
				icon: 'i-lucide-alert-circle',
			});
			throw error;
		} finally {
			saving.value = false;
		}
	}

	/**
	 * Reverse an existing transfer. Creates an inverse transfer in the current
	 * reporting period; the original is marked status=reversed.
	 */
	async function reverse(transferId: string, notes?: string): Promise<CreateResponse> {
		saving.value = true;
		try {
			const response = await $fetch<CreateResponse>(`/api/transfer/${transferId}/reverse`, {
				method: 'POST',
				body: { notes },
			});
			prependTransfer(response.transfer);
			// The original transfer now has status='reversed'; refresh it locally
			const originalIdx = transfers.value.findIndex(t => t._id === transferId);
			if (originalIdx >= 0) {
				const next = transfers.value.slice();
				next[originalIdx] = {
					...next[originalIdx],
					status: 'reversed',
					reversedBy: response.transfer._id,
				};
				transfers.value = next;
			}
			syncBatchAndVesselStores(response);
			toast.add({
				title: 'Transfer reversed',
				color: 'success',
				icon: 'i-lucide-undo-2',
			});
			return response;
		} catch (error: unknown) {
			console.error('[useTransferStore.reverse]', error);
			toast.add({
				title: 'Reverse failed',
				description: getErrorMessage(error),
				color: 'error',
				icon: 'i-lucide-alert-circle',
			});
			throw error;
		} finally {
			saving.value = false;
		}
	}

	// ─── Cross-store sync ─────────────────────────────────────────────────────

	function syncBatchAndVesselStores(response: CreateResponse) {
		// Update the batch store in place if loaded
		try {
			const batchStore = useBatchStore();
			if (response.batch?._id) {
				const idx = batchStore.crud.items.value.findIndex(
					(b: any) => b._id === response.batch._id,
				);
				if (idx >= 0) {
					const next = batchStore.crud.items.value.slice();
					next[idx] = response.batch;
					batchStore.crud.items.value = next;
				}
				if (batchStore.crud.item.value?._id === response.batch._id) {
					batchStore.crud.item.value = response.batch;
				}
			}
		} catch {
			// batch store not registered yet (e.g., during SSR or tests); skip
		}
		// Update the vessel store
		try {
			const vesselStore = useVesselStore();
			if (response.updatedVessels?.length) {
				const next = vesselStore.crud.items.value.slice();
				for (const updated of response.updatedVessels) {
					const idx = next.findIndex((v: any) => v._id === updated._id);
					if (idx >= 0) next[idx] = updated;
					else next.push(updated);
				}
				vesselStore.crud.items.value = next;
			}
		} catch {
			// vessel store not registered yet
		}
	}

	function describeTransfer(t: Transfer): string {
		const parts: string[] = [];
		if (t.fromStage && t.toStage && t.fromStage !== t.toStage) {
			parts.push(`${t.fromStage} → ${t.toStage}`);
		} else if (t.fromStage) {
			parts.push(`from ${t.fromStage}`);
		} else if (t.toStage) {
			parts.push(`to ${t.toStage}`);
		}
		if (t.totalSourceVolume) parts.push(`${t.totalSourceVolume} gal`);
		if (t.totalLossVolume > 0) parts.push(`(loss ${t.totalLossVolume} gal)`);
		return parts.join(' · ');
	}

	// ─── Local lookups ────────────────────────────────────────────────────────

	const transfersByBatch = (batchId: string) =>
		computed(() => transfers.value.filter(t => String(t.batch) === batchId));

	const transfersByVessel = (vesselId: string) =>
		computed(() => transfers.value.filter(t =>
			t.sources?.some(s => String(s.vessel) === vesselId)
			|| t.destinations?.some(d => String(d.vessel) === vesselId),
		));

	const transfersByPeriod = (period: string) =>
		computed(() => transfers.value.filter(t => t.reportingPeriod === period));

	return {
		// State
		transfers,
		current,
		loading,
		saving,

		// Actions
		list,
		getById,
		create,
		reverse,

		// Lookups
		transfersByBatch,
		transfersByVessel,
		transfersByPeriod,
	};
});
