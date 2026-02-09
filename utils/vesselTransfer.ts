export const transferBatch = (
	fromId: string,
	toId: string,
	transfer: { volume: number; volumeUnit: string; abv: number; value: number }
) => {
	const vesselStore = useVesselStore();
	vesselStore.setVessel(fromId);
	const contents = vesselStore.vessel.contents || [];
	if (transfer.volume == vesselStore.vessel.current.volume) {
		vesselStore.vessel.contents = [];
		vesselStore.vessel.current = {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		};
	} else {
		vesselStore.vessel.current.volume =
			(vesselStore.vessel.current.volume || 0) - transfer.volume;
		vesselStore.vessel.current.value =
			(vesselStore.vessel.current.value || 0) - transfer.value;
	}

	vesselStore.updateVessel();
	vesselStore.setVessel(toId);
	contents.forEach((content) => {
		if (!vesselStore.vessel.contents) {
			vesselStore.vessel.contents = [];
		}
		vesselStore.vessel.contents.push({
			batch: content.batch,
			volume: content.volume,
			volumeUnit: content.volumeUnit,
			abv: content.abv,
			value: content.value,
		});
	});
	vesselStore.vessel.current.volume =
		(vesselStore.vessel.current.volume || 0) + transfer.volume;
	vesselStore.vessel.current.value =
		(vesselStore.vessel.current.value || 0) + transfer.value;
	vesselStore.updateVessel();
};

export const fullTransfer = (
	fromId: string,
	toId: string
) => {
	const vesselStore = useVesselStore();
	vesselStore.setVessel(fromId);
	const current = vesselStore.vessel.current;
	const transfer = {
		volume: current.volume || 0,
		volumeUnit: current.volumeUnit || '',
		abv: current.abv || 0,
		value: current.value || 0,
	};
	transferBatch(fromId, toId, transfer);
};

export const startBrewing = (
	batchId: string,
	mashTunId: string
) => {
	const batchStore = useBatchStore();
	const vesselStore = useVesselStore();

	batchStore.setBatch(batchId);
	vesselStore.setVessel(mashTunId);

	batchStore.batch.status = 'Brewing';
	batchStore.updateBatch();

	if (!vesselStore.vessel.contents) {
		vesselStore.vessel.contents = [];
	}
	vesselStore.vessel.contents.push({
		batch: batchId,
		volume: batchStore.batch.batchSize,
		volumeUnit: batchStore.batch.batchSizeUnit,
		abv: 0,
		value: batchStore.batch.batchCost || 0,
	});
	vesselStore.updateVessel();
};
