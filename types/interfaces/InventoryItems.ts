import type { ObjectId } from 'mongoose';

export interface InventoryItems {
	item: ObjectId;
	amount: number;
}
