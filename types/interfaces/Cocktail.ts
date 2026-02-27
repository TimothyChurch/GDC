export type IngredientSourceType = 'item' | 'bottle';

export interface CocktailIngredient {
	item: string;
	amount: number;
	unit: string;
	sourceType?: IngredientSourceType;
}

export interface Cocktail {
	_id: string;
	name: string;
	glassware: string;
	ingredients: CocktailIngredient[];
	cost?: number;
	price: number;
	menu?: string;
	description?: string;
	directions: string;
	preparation?: string;
	visible: boolean;
	img?: string;
	createdAt?: string;
	updatedAt?: string;
}
