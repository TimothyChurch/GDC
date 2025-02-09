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
