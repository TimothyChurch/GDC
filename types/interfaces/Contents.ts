import type { ObjectId } from 'mongoose';

export interface Contents {
	batch: ObjectId | string;
	volume: number;
	volumeUnit: string;
	abv: number;
	value: number;
}
