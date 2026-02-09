import type { Item } from '~/types';
import { differenceInDays } from 'date-fns';

export const bottleStockCheck = (id: string) => {
	const bottleStore = useBottleStore();
	const productionStore = useProductionStore();

	const bottle = bottleStore.getBottleById(id);

	const selectedProductions = productionStore.productions
		.filter((p) => p.bottle === bottle._id)
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
		if (sortedInventory[i].item === item._id)
			return sortedInventory[i].quantity;
	}
};
