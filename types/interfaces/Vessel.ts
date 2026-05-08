import type { Contents } from './Contents';

export interface PreviousContentsEntry {
	batchRecipeName?: string;
	batchId?: string;
	departedAt?: Date | string;
	transferId?: string;
}

export interface Vessel {
	_id: string;
	name: string;
	type: string;
	stats: {
		weight?: number;
		weightUnit?: string;
		volume?: number;
		volumeUnit?: string;
	};
	barrel: {
		size?: string;
		char?: string;
		cost?: number;
	};
	contents?: Contents[];
	current: {
		volume?: number;
		volumeUnit?: string;
		abv?: number;
		value?: number;
	};
	cost?: number;
	location?: string;
	status?: string;
	isUsed?: boolean;
	/** @deprecated — use `previousContentsHistory[0]` for the most recent entry. */
	previousContents?: string;
	previousContentsHistory?: PreviousContentsEntry[];
	targetAge?: number;
	/** Bumped by the Transfer engine on every transfer touching this vessel. */
	contentsVersion?: number;
	cachedAt?: Date | string;
	createdAt?: string;
	updatedAt?: string;
}
