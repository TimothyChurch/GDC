import type { ObjectId } from 'mongoose';

export interface Cocktail {
	_id: ObjectId;
	name: string;
	glassware: string;
	ingredients: { item: ObjectId; amount: number; unit: string }[];
	cost: number;
	price: number;
	menu: string;
	description: string;
	directions: string;
}
