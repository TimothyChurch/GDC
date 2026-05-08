import { w as defineCachedEventHandler, n as Bottle, I as Inventory, c as createError } from '../../../nitro/nitro.mjs';
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
    try {
      const bottles = await Bottle.find({ archived: { $ne: true } }).select("name class type abv price img description inStock").sort({ name: 1 }).lean();
      const bottleIds = bottles.map((b) => b._id);
      const latestInventory = await Inventory.aggregate([
        { $match: { item: { $in: bottleIds } } },
        { $sort: { date: -1 } },
        { $group: { _id: "$item", quantity: { $first: "$quantity" } } }
      ]);
      const stockMap = new Map(
        latestInventory.map((rec) => [
          rec._id.toString(),
          rec.quantity > 0
        ])
      );
      return bottles.map((b) => {
        var _a;
        return {
          ...b,
          inStock: stockMap.has(b._id.toString()) ? stockMap.get(b._id.toString()) : (_a = b.inStock) != null ? _a : false
        };
      });
    } catch {
      throw createError({
        status: 500,
        statusText: "Failed to fetch public bottles"
      });
    }
  },
  {
    name: "public-bottles",
    maxAge: 300,
    getKey: () => "all"
  }
);

export { public_get as default };
//# sourceMappingURL=public.get.mjs.map
