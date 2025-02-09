import type { ObjectId } from 'mongoose';

export interface Inventory {
	_id: ObjectId;
	date: Date;
	items: { [itemId: string]: number };
}
