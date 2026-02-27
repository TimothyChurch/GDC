export interface PublicCocktailIngredient {
	name: string;
	amount: number;
	unit: string;
}

export interface PublicCocktail {
	_id: string;
	name: string;
	glassware: string;
	ingredients: PublicCocktailIngredient[];
	price: number;
	menu?: string;
	description?: string;
	directions?: string;
	preparation?: string;
	img?: string;
}
