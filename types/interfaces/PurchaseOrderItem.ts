import type { ObjectId } from 'mongoose';

export interface PurchaseOrderItem {
	item: ObjectId;
	quantity: number;
	size: number;
	sizeUnit: string;
	price: number;
}
