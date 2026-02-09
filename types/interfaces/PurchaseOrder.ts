import type { PurchaseOrderItem } from './PurchaseOrderItem';

export interface PurchaseOrder {
	_id: string;
	status: string;
	vendor: string;
	items: PurchaseOrderItem[];
	total: number;
	date: Date;
}
