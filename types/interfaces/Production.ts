export interface Production {
	_id: string;
	date: Date;
	vessel: string[];
	bottle: string;
	bottling: {
		glassware: string;
		cap: string;
		label: string;
	};
	quantity: number;
	productionCost: number;
	bottleCost: number;
	createdAt?: string;
	updatedAt?: string;
}
