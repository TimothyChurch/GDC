import type { Contents } from './Contents';

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
	createdAt?: string;
	updatedAt?: string;
}
