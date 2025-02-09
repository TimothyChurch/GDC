import type { ObjectId } from 'mongoose';
import type { Item } from '~/types';
import { differenceInDays } from 'date-fns';

export const bottleStockCheck = (id: string | ObjectId) => {
	const bottleStore = useBottleStore();
	const productionStore = uesProductionStore();

	const bottle = bottleStore.getBottleById(id.toString());

	const selectedProductions = productionStore.productions
		.filter(
			(p: { bottle: { toString: () => string } }) =>
				p.bottle.toString() == bottle._id.toString()
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	const totalProduced = selectedProductions.reduce(
		(sum: number, p) => sum + p.quantity,
		0
	);
	const daysProduced = differenceInDays(
		new Date().getTime(),
		new Date(selectedProductions[0]?.date).getTime()
	);
	return {
		averageDaily: totalProduced / daysProduced,
		totalProduced,
		daysProduced,
		lowStock:
			(currentStock(bottle as any) as number) <=
			(totalProduced / daysProduced) * 30,
		currentStock: currentStock(bottle as any),
	};
};

export const currentStock = (item: Item) => {
	const inventoryStore = useInventoryStore();

	const sortedInventory = inventoryStore.inventories.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	for (let i in sortedInventory) {
		if (sortedInventory[i].items[item._id.toString()])
			return sortedInventory[i].items[item._id.toString()];
	}
};
