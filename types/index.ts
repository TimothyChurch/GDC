import type { ObjectId } from 'mongoose';

export interface Batch {
	_id: ObjectId;
	recipe: ObjectId;
	cost: number;
	batchSize: number;
	batchSizeUnit: string;
	brewDate: Date;
	fermenter: string;
	distillDate: Date;
	prevTails: {
		volume: number;
		volumeUnit: string;
		abv: number;
	};
	collected: {
		heads: {
			volume: number;
			volumeUnit: string;
			abv: number;
		};
		hearts: {
			volume: number;
			volumeUnit: string;
			abv: number;
		};
		tails: {
			volume: number;
			volumeUnit: string;
			abv: number;
		};
		total: {
			volume: number;
			volumeUnit: string;
			abv: number;
		};
	};
}

export interface Bottle {
	_id: ObjectId;
	name: string;
	type: string;
	abv: number;
	recipe: ObjectId;
}

export interface Contact {
	_id: ObjectId;
	firstName: string;
	lastName: string;
	businessName: string;
	type: string;
	website: string;
	address: string;
	email: string;
	phone: string;
}

export interface Inventory {
	_id: ObjectId;
	date: Date;
	items: { [itemId: string]: number };
}

export interface InventoryItems {
	item: ObjectId;
	amount: number;
}

export interface Item {
	_id: ObjectId;
	name: string;
	type: string;
	vendor: ObjectId;
	inventoryUnit: string;
	purchaseHistory: ObjectId[];
	inventoryHistory: ObjectId[];
}

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

export interface PurchaseOrder {
	_id: ObjectId;
	status: string;
	vendor: ObjectId;
	items: PurchaseOrderItem[];
	total: number;
	date: Date;
}

export interface PurchaseOrderItem {
	item: ObjectId;
	quantity: number;
	size: number;
	sizeUnit: string;
	price: number;
}

export interface Recipe {
	_id: ObjectId;
	name: string;
	class: string;
	type: string;
	volume: number;
	volumeUnit: string;
	items: { item: ObjectId; amount: number; unit: string }[];
}

export interface Vessel {
	_id: ObjectId;
	name: string;
	type: string;
	status: string;
	stats: {
		weight: number;
		weightUnit: string;
		volume: number;
		volumeUnit: string;
	};
	barrel: {
		size: string;
		char: string;
		cost: number;
	};
	contents: [];
	cost: number;
}
