import type { ObjectId } from 'mongoose';
export const transferBatch = (
	fromId: string | ObjectId,
	toId: string | ObjectId,
	transfer: { volume: number; volumeUnit: string; abv: number; value: number }
) => {
	const vesselStore = useVesselStore();
	vesselStore.setVessel(fromId.toString());
	const contents = vesselStore.vessel.contents;
	if (transfer.volume == vesselStore.vessel.current.volume) {
		vesselStore.vessel.contents = [];
		vesselStore.vessel.current = {
			volume: 0,
			volumeUnit: '',
			abv: 0,
			value: 0,
		};
	} else {
		vesselStore.vessel.current.volume -= transfer.volume;
		vesselStore.vessel.current.value -= transfer.value;
	}
	vesselStore.updateVessel();
	vesselStore.setVessel(toId.toString());
	vesselStore.vessel.contents.push(...contents);
	vesselStore.vessel.current.volume += transfer.volume;
	vesselStore.vessel.current.value += transfer.value;
	vesselStore.updateVessel();
};

export const fullTransfer = (
	fromId: string | ObjectId,
	toId: string | ObjectId
) => {
	const vesselStore = useVesselStore();
	vesselStore.setVessel(fromId.toString());
	const transfer = vesselStore.vessel.current;
	transferBatch(fromId, toId, transfer);
};

export const startBrewing = (
	batchId: string | ObjectId,
	mashTunId: string | ObjectId
) => {
	console.log(batchId, mashTunId);
	const batchStore = useBatchStore();
	const vesselStore = useVesselStore();

	batchStore.setBatch(batchId.toString());
	vesselStore.setVessel(mashTunId.toString());

	batchStore.batch.status = 'Brewing';
	batchStore.updateBatch();

	vesselStore.vessel.contents.push({
		batch: batchId as ObjectId,
		volume: batchStore.batch.batchSize,
		volumeUnit: batchStore.batch.batchSizeUnit,
		abv: 0,
		value: batchStore.batch.batchCost,
	});
	vesselStore.updateVessel();
};
