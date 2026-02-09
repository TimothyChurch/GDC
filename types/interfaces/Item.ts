export interface Item {
	_id: string;
	name: string;
	type?: string;
	brand?: string;
	vendor?: string;
	inventoryUnit?: string;
	purchaseHistory?: string[];
	inventoryHistory?: string[];
	pricePerUnit?: number;
}
