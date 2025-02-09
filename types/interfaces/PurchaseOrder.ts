import type { ObjectId } from 'mongoose';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export interface PurchaseOrder {
	_id: ObjectId;
	status: string;
	vendor: ObjectId;
	items: PurchaseOrderItem[];
	total: number;
	date: Date;
}
