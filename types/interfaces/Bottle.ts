export interface Bottle {
	_id: string;
	name: string;
	class?: string;
	type?: string;
	abv?: number;
	price?: number;
	img?: string;
	description?: string;
	recipe?: string;
	inStock?: boolean;
}
