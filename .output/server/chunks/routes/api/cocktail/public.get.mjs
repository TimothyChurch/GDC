import { q as defineCachedEventHandler, C as Cocktail, z as Item, m as Bottle, c as createError } from '../../../nitro/nitro.mjs';
import 'mongoose';
import 'yup';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'vue';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';

const public_get = defineCachedEventHandler(
  async () => {
    var _a;
    try {
      const cocktails = await Cocktail.find({ visible: true }).select("name glassware ingredients price menu description directions preparation img").sort({ name: 1 }).lean();
      const itemIds = /* @__PURE__ */ new Set();
      const bottleIds = /* @__PURE__ */ new Set();
      for (const cocktail of cocktails) {
        for (const ing of cocktail.ingredients) {
          const id = (_a = ing.item) == null ? void 0 : _a.toString();
          if (!id) continue;
          if (ing.sourceType === "bottle") {
            bottleIds.add(id);
          } else {
            itemIds.add(id);
          }
        }
      }
      const [items, bottles] = await Promise.all([
        itemIds.size > 0 ? Item.find({ _id: { $in: [...itemIds] } }).select("name").lean() : [],
        bottleIds.size > 0 ? Bottle.find({ _id: { $in: [...bottleIds] } }).select("name").lean() : []
      ]);
      const nameMap = /* @__PURE__ */ new Map();
      for (const item of items) {
        nameMap.set(item._id.toString(), item.name);
      }
      for (const bottle of bottles) {
        nameMap.set(bottle._id.toString(), bottle.name);
      }
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
        ingredients: c.ingredients.map((ing) => {
          var _a2;
          return {
            name: nameMap.get((_a2 = ing.item) == null ? void 0 : _a2.toString()) || "Unknown",
            amount: ing.amount,
            unit: ing.unit
          };
        })
      }));
    } catch {
      throw createError({
        status: 500,
        statusText: "Failed to fetch public cocktails"
      });
    }
  },
  {
    name: "public-cocktails",
    maxAge: 300,
    getKey: () => "all"
  }
);

export { public_get as default };
//# sourceMappingURL=public.get.mjs.map
