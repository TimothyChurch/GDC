import type {
	TransferInput,
	TransferSource,
	TransferDestination,
	TransferLoss,
	TransferType,
	TtbAccount,
} from '~/types/interfaces/Transfer';

/**
 * Form volumes are stored in canonical wine gallons; proofs in canonical proof
 * (2 × ABV%). Each input field on the form has its own unit selector that
 * converts user-entered values to canonical before binding back. See:
 *   - components/Form/FormVolumeInput.vue (gallons)
 *   - components/Form/FormStrengthInput.vue (ABV %, mapped to proof in the
 *     transfer cards via a 2× wrapper).
 */

/**
 * Reactive helper for the Transfer Action Form (Phase 5).
 *
 * Encapsulates: source/destination editing, loss attestation, live PG and
 * volume reconciliation, and submission to `useTransferStore.create()`.
 *
 * Components compose this rather than maintaining their own state to keep
 * reconciliation centralized.
 */
export function useTransferForm(initialState?: Partial<TransferInput>) {
	const transferStore = useTransferStore();

	// ─── State ────────────────────────────────────────────────────────────────
	const type = ref<TransferType>(initialState?.type || 'stage_transition');
	const batch = ref<string>(initialState?.batch || '');
	const fromStage = ref<string | null>(initialState?.fromStage ?? null);
	const toStage = ref<string | null>(initialState?.toStage ?? null);
	const sources = ref<TransferSource[]>(initialState?.sources ? structuredClone(toRaw(initialState.sources)) as TransferSource[] : []);
	const destinations = ref<TransferDestination[]>(initialState?.destinations ? structuredClone(toRaw(initialState.destinations)) as TransferDestination[] : []);
	const loss = ref<TransferLoss>(
		initialState?.loss ? structuredClone(toRaw(initialState.loss)) as TransferLoss : { volume: 0, proof: 0, reasonCode: 'no_loss' },
	);
	const ttbAccountFrom = ref<TtbAccount | null>(initialState?.ttbAccount?.from ?? null);
	const ttbAccountTo = ref<TtbAccount | null>(initialState?.ttbAccount?.to ?? null);
	const notes = ref<string>(initialState?.notes || '');
	const submitting = ref(false);


	// ─── Derived: TTB account auto-routing from stage ────────────────────────
	watch(toStage, (newToStage) => {
		if (newToStage && STAGE_TO_TTB_ACCOUNT[newToStage]) {
			ttbAccountTo.value = STAGE_TO_TTB_ACCOUNT[newToStage];
		}
	}, { immediate: true });

	watch(fromStage, (newFromStage) => {
		if (newFromStage && STAGE_TO_TTB_ACCOUNT[newFromStage]) {
			ttbAccountFrom.value = STAGE_TO_TTB_ACCOUNT[newFromStage];
		} else if (newFromStage === 'Upcoming' || newFromStage === null) {
			ttbAccountFrom.value = null;
		}
	}, { immediate: true });

	// ─── Live totals ─────────────────────────────────────────────────────────
	const totalSourceVolume = computed(() =>
		sources.value.reduce((sum, s) => sum + (Number(s.volume) || 0), 0),
	);
	const totalDestVolume = computed(() =>
		destinations.value.reduce((sum, d) => sum + (Number(d.volume) || 0), 0),
	);
	const totalLossVolume = computed(() => Number(loss.value.volume) || 0);

	const sourcePG = computed(() =>
		sources.value.reduce((sum, s) => sum + proofGallons(Number(s.volume) || 0, Number(s.proof) || 0), 0),
	);
	const destPG = computed(() =>
		destinations.value.reduce((sum, d) => sum + proofGallons(Number(d.volume) || 0, Number(d.proof) || 0), 0),
	);
	const lossPG = computed(() => proofGallons(totalLossVolume.value, Number(loss.value.proof) || 0));

	// ─── Reconciliation status ────────────────────────────────────────────────
	// Distillation stages concentrate alcohol — wine-gallon balance is bypassed
	// (see server/utils/transferEngineCore.ts::bypassesVolumeBalance), but PG
	// balance is still required.
	const DISTILLATION_FROM_STAGES = new Set(['Stripping Run', 'Spirit Run', 'Distilling']);
	const isDistillationTransfer = computed(
		() => !!fromStage.value && DISTILLATION_FROM_STAGES.has(fromStage.value),
	);
	const balanced = computed(() => {
		// Initial entry / TIB-in: balance check skipped
		if ((fromStage.value === 'Upcoming' || fromStage.value === null) && sources.value.length === 0) return true;
		if (type.value === 'tib_in' && sources.value.length === 0) return true;
		const volumeOk = isDistillationTransfer.value
			|| isVolumeBalanced(totalSourceVolume.value, totalDestVolume.value, totalLossVolume.value);
		return volumeOk && isPGBalanced(sourcePG.value, destPG.value, lossPG.value);
	});

	const reconciliationVarianceWG = computed(() =>
		Number((totalSourceVolume.value - (totalDestVolume.value + totalLossVolume.value)).toFixed(4)),
	);

	const lossLineValid = computed(() => {
		if (!loss.value.reasonCode) return false;
		if (loss.value.reasonCode === 'no_loss' && loss.value.volume > 0) return false;
		if (loss.value.reasonCode !== 'no_loss' && loss.value.reasonCode !== 'measurement_variance' && loss.value.volume === 0) return false;
		return true;
	});

	// Transfer types whose destinations may legitimately have no vessel
	// (mirrors server/utils/transferEngineCore.ts NULL_DEST_VESSEL_ALLOWED).
	const NULL_DEST_VESSEL_ALLOWED = new Set([
		'destruction',
		'tax_paid_withdrawal',
		'sample',
		'tib_out',
	]);

	const destinationsValid = computed(() => {
		if (NULL_DEST_VESSEL_ALLOWED.has(type.value)) return true;
		if (destinations.value.length === 0) return true; // engine will reject empty when needed
		return destinations.value.every((d) => !!d.vessel);
	});

	const canSubmit = computed(() =>
		!!batch.value
		&& !!type.value
		&& balanced.value
		&& lossLineValid.value
		&& destinationsValid.value
		&& (sources.value.length + destinations.value.length) > 0,
	);

	// ─── Source/dest mutations ────────────────────────────────────────────────
	function addSource(seed?: Partial<TransferSource>) {
		sources.value = [
			...sources.value,
			{ vessel: seed?.vessel || '', volume: seed?.volume ?? 0, proof: seed?.proof ?? 0 },
		];
	}
	function removeSource(idx: number) {
		sources.value = sources.value.filter((_, i) => i !== idx);
	}
	function updateSource(idx: number, patch: Partial<TransferSource>) {
		const next = sources.value.slice();
		next[idx] = { ...next[idx], ...patch };
		sources.value = next;
	}

	function addDestination(seed?: Partial<TransferDestination>) {
		destinations.value = [
			...destinations.value,
			{ vessel: seed?.vessel || null, stage: seed?.stage ?? toStage.value, volume: seed?.volume ?? 0, proof: seed?.proof ?? 0 },
		];
	}
	function removeDestination(idx: number) {
		destinations.value = destinations.value.filter((_, i) => i !== idx);
	}
	function updateDestination(idx: number, patch: Partial<TransferDestination>) {
		const next = destinations.value.slice();
		next[idx] = { ...next[idx], ...patch };
		destinations.value = next;
	}

	// ─── Reset ────────────────────────────────────────────────────────────────
	function reset(seed?: Partial<TransferInput>) {
		type.value = seed?.type || 'stage_transition';
		batch.value = seed?.batch || '';
		fromStage.value = seed?.fromStage ?? null;
		toStage.value = seed?.toStage ?? null;
		sources.value = seed?.sources ? structuredClone(toRaw(seed.sources)) as TransferSource[] : [];
		destinations.value = seed?.destinations ? structuredClone(toRaw(seed.destinations)) as TransferDestination[] : [];
		loss.value = seed?.loss ? structuredClone(toRaw(seed.loss)) as TransferLoss : { volume: 0, proof: 0, reasonCode: 'no_loss' };
		notes.value = seed?.notes || '';
	}

	// ─── Build payload ───────────────────────────────────────────────────────
	function build(): TransferInput {
		// Volumes are already in canonical wine gallons (FormVolumeInput
		// converts on input). Proofs are already in canonical proof. No
		// conversion needed — just pass through to the engine.
		return {
			type: type.value,
			batch: batch.value,
			fromStage: fromStage.value,
			toStage: toStage.value,
			sources: sources.value,
			destinations: destinations.value,
			loss: loss.value,
			ttbAccount: { from: ttbAccountFrom.value, to: ttbAccountTo.value },
			notes: notes.value || undefined,
		};
	}

	// ─── Submit ───────────────────────────────────────────────────────────────
	async function submit() {
		if (!canSubmit.value) return null;
		submitting.value = true;
		try {
			const result = await transferStore.create(build());
			return result;
		} finally {
			submitting.value = false;
		}
	}

	return {
		// State refs (writable from templates)
		type,
		batch,
		fromStage,
		toStage,
		sources,
		destinations,
		loss,
		ttbAccountFrom,
		ttbAccountTo,
		notes,
		submitting,

		// Live computed
		totalSourceVolume,
		totalDestVolume,
		totalLossVolume,
		sourcePG,
		destPG,
		lossPG,
		balanced,
		isDistillationTransfer,
		reconciliationVarianceWG,
		lossLineValid,
		destinationsValid,
		canSubmit,

		// Actions
		addSource,
		removeSource,
		updateSource,
		addDestination,
		removeDestination,
		updateDestination,
		reset,
		build,
		submit,
	};
}
