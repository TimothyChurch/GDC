export interface Batch {
	_id: string;
	batchNumber?: string;
	recipe: string;
	recipeCost: number;
	status?: string;
	batchSize: number;
	batchSizeUnit: string;
	batchCost?: number;
	notes?: string;
	brewing: {
		vessel?: string;
		date?: Date;
		notes?: string;
	};
	fermenting: {
		vessel?: string;
		readings: {
			date: Date;
			temperature: number;
			temperatureUnit: string;
			gravity: number;
		}[];
		notes?: string;
	};
	distilling: {
		vessel?: string;
		date?: Date;
		additions: {
			tails: {
				volume?: number;
				volumeUnit?: string;
				abv?: number;
			};
		};
		collected: {
			heads: {
				vessel?: string;
				volume?: number;
				volumeUnit?: string;
				abv?: number;
			};
			hearts: {
				vessel?: string;
				volume?: number;
				volumeUnit?: string;
				abv?: number;
			};
			tails: {
				vessel?: string;
				volume?: number;
				volumeUnit?: string;
				abv?: number;
			};
			total: {
				volume?: number;
				volumeUnit?: string;
				abv?: number;
			};
		};
		notes?: string;
	};
	barreled: {
		vessel?: string;
		entry: {
			date?: Date;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		exit: {
			date?: Date;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
	};
	bottled: {
		productionRecord?: string;
	};
	createdAt?: string;
	updatedAt?: string;
}
