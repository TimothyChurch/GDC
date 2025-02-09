import type { ObjectId } from 'mongoose';

export interface Batch {
	_id: ObjectId;
	recipe: ObjectId;
	recipeCost: number;
	status: string;
	batchSize: number;
	batchSizeUnit: string;
	batchCost: number;
	brewing: {
		vessel: ObjectId;
		date: Date;
		notes: string;
	};
	fermenting: {
		vessel: ObjectId;
		readings: {
			date: Date;
			temperature: number;
			temperatureUnit: string;
			gravity: number;
		}[];
		notes: string;
	};
	distilling: {
		vessel: ObjectId;
		date: Date;
		additions: {
			tails: {
				volume: number;
				volumeUnit: string;
				abv: number;
			};
		};
		collected: {
			heads: {
				vessel: ObjectId;
				volume: number;
				volumeUnit: string;
				abv: number;
			};
			hearts: {
				vessel: ObjectId;
				volume: number;
				volumeUnit: string;
				abv: number;
			};
			tails: {
				vessel: ObjectId;
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
		notes: string;
	};
	barreled: {
		vessel: ObjectId;
		entry: {
			date: Date;
			volume: number;
			volumeUnit: string;
			abv: number;
		};
		exit: {
			date: Date;
			volume: number;
			volumeUnit: string;
			abv: number;
		};
	};
	bottled: {
		productionRecord: ObjectId;
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
	brand: string;
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
	directions: string;
}

export interface Vessel {
	_id: ObjectId;
	name: string;
	type: string;
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
	contents: Contents[];
	current: {
		volume: number;
		volumeUnit: string;
		abv: number;
		value: number;
	};
	cost: number;
}

export interface Contents {
	batch: ObjectId | string;
	volume: number;
	volumeUnit: string;
	abv: number;
	value: number;
}
