import { Cocktail } from '~/server/models/cocktail.schema';
import { Item } from '~/server/models/item.schema';

interface LeanCocktail {
  _id: string;
  name: string;
  glassware: string;
  ingredients: { item: string; amount: number; unit: string; sourceType?: string }[];
  price: number;
  menu?: string;
  description?: string;
  directions?: string;
  preparation?: string;
  img?: string;
}

interface LeanNameDoc {
  _id: string;
  name: string;
}

export default defineCachedEventHandler(
  async () => {
    try {
      const cocktails = await Cocktail.find({ visible: true })
        .select('name glassware ingredients price menu description directions preparation img')
        .sort({ name: 1 })
        .lean() as unknown as LeanCocktail[];

      // Collect all ingredient IDs grouped by source type for batch lookup
      const itemIds = new Set<string>();
      const bottleIds = new Set<string>();

      for (const cocktail of cocktails) {
        for (const ing of cocktail.ingredients) {
          const id = ing.item?.toString();
          if (!id) continue;
          if (ing.sourceType === 'bottle') {
            bottleIds.add(id);
          } else {
            itemIds.add(id);
          }
        }
      }

      // Batch-fetch names for items and bottles
      const [items, bottles] = await Promise.all([
        itemIds.size > 0
          ? Item.find({ _id: { $in: [...itemIds] } }).select('name').lean() as unknown as LeanNameDoc[]
          : [] as LeanNameDoc[],
        bottleIds.size > 0
          ? Bottle.find({ _id: { $in: [...bottleIds] } }).select('name').lean() as unknown as LeanNameDoc[]
          : [] as LeanNameDoc[],
      ]);

      const nameMap = new Map<string, string>();
      for (const item of items) {
        nameMap.set(item._id.toString(), item.name);
      }
      for (const bottle of bottles) {
        nameMap.set(bottle._id.toString(), bottle.name);
      }

      // Transform cocktails: resolve ingredient names, strip internal fields
      return cocktails.map((c) => ({
        _id: c._id,
        name: c.name,
        glassware: c.glassware,
        price: c.price,
        menu: c.menu,
        description: c.description,
        directions: c.directions,
        preparation: c.preparation,
        img: c.img,
        ingredients: c.ingredients.map((ing) => ({
          name: nameMap.get(ing.item?.toString()) || 'Unknown',
          amount: ing.amount,
          unit: ing.unit,
        })),
      }));
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch public cocktails',
      });
    }
  },
  {
    name: 'public-cocktails',
    maxAge: 300,
    getKey: () => 'all',
  }
);
