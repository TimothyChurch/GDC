export interface Cocktail {
	_id: string;
	name: string;
	glassware: string;
	ingredients: { item: string; amount: number; unit: string }[];
	cost?: number;
	price: number;
	menu?: string;
	description?: string;
	directions: string;
	visible: boolean;
	img?: string;
	createdAt?: string;
	updatedAt?: string;
}
