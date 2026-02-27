import type { PurchaseOrder } from '~/types';

export const usePurchaseOrderStore = defineStore('purchaseOrders', () => {
	const toast = useToast();

	const crud = useCrudStore<PurchaseOrder>({
		name: 'Purchase order',
		apiPath: '/api/purchaseOrder',
		defaultItem: () => ({
			_id: '',
			vendor: '',
			status: '',
			items: [],
			total: 0,
			date: new Date(),
		}),
	});

	/**
	 * Mark a PO as "Delivered" and auto-create inventory records
	 * for each line item, adding the received quantities to current stock.
	 */
	const receivePurchaseOrder = async (
		poId?: string,
	): Promise<Array<{ itemName: string; added: number; newStock: number; unit: string }>> => {
		const inventoryStore = useInventoryStore();
		const itemStore = useItemStore();
		const { convertQuantity } = useUnitConversion();

		const po = poId
			? crud.items.value.find((p) => p._id === poId)
			: crud.item.value;
		if (!po || po.items.length === 0) return [];

		const summary: Array<{ itemName: string; added: number; newStock: number; unit: string }> = [];
		const inventoryRecords: Array<{ item: string; quantity: number; date: Date }> = [];

		for (const lineItem of po.items) {
			const item = itemStore.getItemById(lineItem.item);
			if (!item) continue;
			if (item.trackInventory === false) continue;

			const inventoryUnit = item.inventoryUnit || lineItem.sizeUnit;
			const totalPurchased = lineItem.quantity * lineItem.size;
			const addedInInventoryUnits =
				lineItem.sizeUnit === inventoryUnit
					? totalPurchased
					: convertQuantity(totalPurchased, lineItem.sizeUnit, inventoryUnit);

			const currentStock = inventoryStore.getCurrentStock(lineItem.item);
			const newStock = currentStock + addedInInventoryUnits;

			inventoryRecords.push({
				item: lineItem.item,
				quantity: Math.round(newStock * 100) / 100,
				date: new Date(),
			});

			summary.push({
				itemName: item.name,
				added: Math.round(addedInInventoryUnits * 100) / 100,
				newStock: Math.round(newStock * 100) / 100,
				unit: inventoryUnit,
			});
		}

		if (inventoryRecords.length > 0) {
			try {
				await inventoryStore.createBulk(inventoryRecords);
			} catch {
				return [];
			}
		}

		if (summary.length > 0) {
			const summaryLines = summary.map(
				(s) => `+${s.added} ${s.unit} ${s.itemName}`,
			);
			toast.add({
				title: "Inventory updated from PO",
				description: summaryLines.join(", "),
				color: "success",
				icon: "i-lucide-package-check",
				duration: 8000,
			});
		}

		return summary;
	};

	// Domain-specific getters
	const getPurchaseOrderByVendor = (vendorId: string): PurchaseOrder[] => {
		return crud.items.value.filter((po) => po.vendor === vendorId);
	};

	const getPurchaseOrdersByItemId = (id: string) => {
		return crud.items.value.filter((po) => {
			return po.items.some((item) => item.item === id);
		});
	};

	return {
		...crud,
		// Domain aliases for backward compatibility
		purchaseOrders: crud.items,
		purchaseOrder: crud.item,
		getPurchaseOrders: crud.getAll,
		updatePurchaseOrder: crud.saveItem,
		deletePurchaseOrder: crud.deleteItem,
		resetCurrentPurchaseOrder: crud.resetItem,
		getPurchaseOrderById: crud.getById,
		// Domain-specific
		receivePurchaseOrder,
		getPurchaseOrderByVendor,
		getPurchaseOrdersByItemId,
	};
});
