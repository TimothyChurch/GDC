export interface Recipe {
	_id: string;
	name: string;
	class: string;
	type?: string;
	volume: number;
	volumeUnit: string;
	items: { item: string; amount: number; unit: string }[];
	directions?: string;
}
