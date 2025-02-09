import type { ObjectId } from 'mongoose';

export interface Item {
	_id: ObjectId;
	name: string;
	type: string;
	brand: string;
	vendor: ObjectId;
	inventoryUnit: string;
	purchaseHistory: ObjectId[];
	inventoryHistory: ObjectId[];
}
