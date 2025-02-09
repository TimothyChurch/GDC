import type { ObjectId } from 'mongoose';

export interface Production {
	_id: ObjectId;
	date: Date;
	vessel: ObjectId[];
	bottle: ObjectId;
	bottling: {
		glassware: ObjectId;
		cap: ObjectId;
		label: ObjectId;
	};
	quantity: number;
	productionCost: number;
	bottleCost: number;
}
