export interface Inventory {
	_id: string;
	date: Date;
	item: string;
	location?: string;
	quantity: number;
}
