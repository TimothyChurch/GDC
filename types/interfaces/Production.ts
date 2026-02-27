export interface ProductionCosts {
	batch?: number;     // from batch/vessel contents cost
	barrel?: number;    // from barrel cost
	bottling?: number;  // materials: glass, caps, labels
	labor?: number;     // manual entry
	ttbTax?: number;    // federal excise tax (TTB) — auto-calculated from proof gallons
	tabcTax?: number;   // Texas state excise tax (TABC) — auto-calculated from wine gallons
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
