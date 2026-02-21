export interface Item {
	_id: string;
	name: string;
	type?: string;
	brand?: string;
	vendor?: string;
	inventoryUnit?: string;
	purchaseSize?: number;
	purchaseSizeUnit?: string;
	purchasePrice?: number;
	purchaseHistory?: string[];
	inventoryHistory?: string[];
	pricePerUnit?: number;
	createdAt?: string;
	updatedAt?: string;
}
