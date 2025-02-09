import type { ObjectId } from 'mongoose';

export interface Bottle {
	_id: ObjectId;
	name: string;
	type: string;
	abv: number;
	recipe: ObjectId;
}
