export interface Bottle {
	_id: string;
	name: string;
	class?: string;
	type?: string;
	abv?: number;
	price?: number;
	volume?: number;
	volumeUnit?: string;
	img?: string;
	description?: string;
	recipe?: string;
	inStock?: boolean;
	createdAt?: string;
	updatedAt?: string;
}
