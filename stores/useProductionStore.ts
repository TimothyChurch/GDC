import type { Production } from '~/types';

export const useProductionStore = defineStore('productions', () => {
	const toast = useToast();

	const crud = useCrudStore<Production>({
		name: 'Production',
		apiPath: '/api/production',
		defaultItem: () => ({
			_id: '',
			date: new Date(),
			vessel: [],
			bottle: '',
			bottling: {
				glassware: '',
				cap: '',
				label: '',
			},
			quantity: 0,
			costs: {
				batch: 0,
				barrel: 0,
				bottling: 0,
				labor: 0,
				ttbTax: 0,
				tabcTax: 0,
				other: 0,
			},
			productionCost: 0,
			bottleCost: 0,
		}),
	});

	// Domain-specific: fetch a single production by ID from the API
	const getProductionById = async (id: string): Promise<void> => {
		crud.item.value = await $fetch<Production>(`/api/production/${id}`);
	};

	/** Create a production and return the new _id (used by batch-to-production flow) */
	const createAndReturnId = async (data: Partial<Production>): Promise<string | null> => {
		crud.saving.value = true;
		try {
			const created = await $fetch<Production>('/api/production/create', {
				method: 'POST',
				body: data,
			});
			crud.items.value.push(created);
			toast.add({ title: 'Production created', color: 'success', icon: 'i-lucide-check-circle' });
			return created._id;
		} catch (error: unknown) {
			toast.add({ title: 'Failed to create production', description: getErrorMessage(error), color: 'error', icon: 'i-lucide-alert-circle' });
			return null;
		} finally {
			crud.saving.value = false;
		}
	};

	/**
	 * Adjust inventory after a production run is recorded.
	 * - Increases the linked bottle's inventory by `quantity`
	 * - Decreases bottling material (glassware, cap, label) inventory by `quantity` each
	 * - Updates bottle's inStock flag based on new stock level
	 */
	const adjustInventoryForProduction = async (
		prod: Pick<Production, 'quantity' | 'bottle' | 'bottling'>,
	): Promise<Array<{ itemName: string; change: number; newStock: number }>> => {
		const inventoryStore = useInventoryStore();
		const itemStore = useItemStore();
		const bottleStore = useBottleStore();

		if (!prod.quantity || prod.quantity <= 0) return [];

		const summary: Array<{ itemName: string; change: number; newStock: number }> = [];
		const inventoryRecords: Array<{ item: string; quantity: number; date: Date }> = [];

		// 1. Increase bottle inventory
		if (prod.bottle) {
			const bottle = bottleStore.getBottleById(prod.bottle);
			if (bottle) {
				const currentBottleStock = inventoryStore.getCurrentStock(prod.bottle);
				const newBottleStock = currentBottleStock + prod.quantity;
				inventoryRecords.push({
					item: prod.bottle,
					quantity: newBottleStock,
					date: new Date(),
				});
				summary.push({
					itemName: bottle.name,
					change: prod.quantity,
					newStock: newBottleStock,
				});
			}
		}

		// 2. Decrease bottling materials (glassware, cap, label) -- one per bottle produced
		const materialIds = [
			prod.bottling?.glassware,
			prod.bottling?.cap,
			prod.bottling?.label,
		].filter(Boolean) as string[];

		for (const materialId of materialIds) {
			const item = itemStore.getItemById(materialId);
			if (!item) continue;
			if (item.trackInventory === false) continue;

			const currentStock = inventoryStore.getCurrentStock(materialId);
			const newStock = Math.max(0, currentStock - prod.quantity);
			inventoryRecords.push({
				item: materialId,
				quantity: Math.round(newStock * 100) / 100,
				date: new Date(),
			});
			summary.push({
				itemName: item.name,
				change: -prod.quantity,
				newStock: Math.round(newStock * 100) / 100,
			});
		}

		if (inventoryRecords.length > 0) {
			try {
				await inventoryStore.createBulk(inventoryRecords);
			} catch {
				// Error toast already shown by createBulk
				return [];
			}
		}

		// 3. Auto-sync bottle's inStock flag
		if (prod.bottle) {
			const bottle = bottleStore.getBottleById(prod.bottle);
			if (bottle) {
				const finalBottleStock = inventoryStore.getCurrentStock(prod.bottle);
				const shouldBeInStock = finalBottleStock > 0;
				if (bottle.inStock !== shouldBeInStock) {
					bottleStore.bottle = { ...bottle, inStock: shouldBeInStock };
					await bottleStore.updateBottle();
				}
			}
		}

		// 4. Show summary toast
		if (summary.length > 0) {
			const lines = summary.map((s) =>
				s.change > 0
					? `+${s.change} ${s.itemName}`
					: `${s.change} ${s.itemName}`,
			);
			toast.add({
				title: "Inventory adjusted for production",
				description: lines.join(", "),
				color: "success",
				icon: "i-lucide-archive",
				duration: 8000,
			});
		}

		return summary;
	};

	// Domain-specific getters
	const getProductionsByDate = (date: Date): Production[] => {
		return crud.items.value.filter(
			(p) => new Date(p.date).toDateString() === date.toDateString(),
		);
	};

	const getProductionsByBottle = (bottleId: string): Production[] => {
		return [...crud.items.value]
			.filter((p) => p.bottle === bottleId)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	};

	return {
		...crud,
		// Domain aliases for backward compatibility
		productions: crud.items,
		production: crud.item,
		getProductions: crud.getAll,
		updateProduction: crud.saveItem,
		deleteProduction: crud.deleteItem,
		resetProduction: crud.resetItem,
		// Domain-specific
		getProductionById,
		createAndReturnId,
		adjustInventoryForProduction,
		getProductionsByDate,
		getProductionsByBottle,
	};
});
