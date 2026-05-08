export interface Contents {
	batch: string;
	volume: number;
	volumeUnit: string;
	abv: number;
	/** 2 × ABV%. Canonical proof field added with Transfer engine.
	 *  When absent (legacy), fall back to `abv × 2`. */
	proof?: number;
	value: number;
	addedAt?: Date | string;
	/** Pointer to the most recent Transfer that touched this slot. */
	lastTransferId?: string;
}
