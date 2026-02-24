export interface ProductionCosts {
	batch?: number;     // from batch/vessel contents cost
	barrel?: number;    // from barrel cost
	bottling?: number;  // materials: glass, caps, labels
	labor?: number;     // manual entry
	taxes?: number;     // excise tax
	other?: number;     // miscellaneous
}

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
	costs?: ProductionCosts;
	productionCost: number;
	bottleCost: number;
	createdAt?: string;
	updatedAt?: string;
}
