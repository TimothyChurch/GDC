import type { PurchaseOrder } from '~/types';

export const usePurchaseOrderStore = defineStore('purchaseOrders', () => {
	const toast = useToast();

	// State
	const purchaseOrders = ref<PurchaseOrder[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
	const purchaseOrder = ref<PurchaseOrder>({
		_id: '',
		vendor: '',
		status: '',
		items: [],
		total: 0,
		date: new Date(),
	});

	// Actions
	const getPurchaseOrders = async (): Promise<void> => {
		loading.value = true;
		try {
			const response = await $fetch('/api/purchaseOrder');
			purchaseOrders.value = response as PurchaseOrder[];
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			try {
				await getPurchaseOrders();
				loaded.value = true;
			} catch {
				// loaded stays false — will retry on next call
			}
		}
	};

	const updatePurchaseOrder = async (): Promise<PurchaseOrder> => {
		saving.value = true;
		try {
			let response;
			const isNew = !purchaseOrder.value._id;
			if (isNew) {
				const { _id, ...createData } = purchaseOrder.value;
				response = await $fetch('/api/purchaseOrder/create', {
					method: 'POST',
					body: JSON.stringify(createData),
				});
				purchaseOrders.value.push(response as PurchaseOrder);
			} else {
				response = await $fetch(
					`/api/purchaseOrder/${purchaseOrder.value._id}`,
					{
						method: 'PUT',
						body: JSON.stringify(purchaseOrder.value),
					}
				);
				const index = purchaseOrders.value.findIndex((po) => po._id === purchaseOrder.value._id);
				if (index !== -1) {
					purchaseOrders.value[index] = response as PurchaseOrder;
				}
			}
			toast.add({ title: `Purchase order ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetCurrentPurchaseOrder();
			return response as PurchaseOrder;
		} catch (error: any) {
			toast.add({ title: 'Failed to save purchase order', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
			throw error;
		} finally {
			saving.value = false;
		}
	};

	const deletePurchaseOrder = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/purchaseOrder/${id}`, {
				method: 'DELETE',
			});
			purchaseOrders.value = purchaseOrders.value.filter((po) => po._id !== id);
			toast.add({ title: 'Purchase order deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete purchase order', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const resetCurrentPurchaseOrder = (): void => {
		purchaseOrder.value = {
			_id: '',
			vendor: '',
			status: '',
			items: [],
			total: 0,
			date: new Date(),
		};
	};

	/**
	 * Mark a PO as "Delivered" and auto-create inventory records
	 * for each line item, adding the received quantities to current stock.
	 *
	 * @param poId - The PO to receive (uses current purchaseOrder if not provided)
	 * @returns A summary array of { itemName, added, newStock, unit } for display
	 */
	const receivePurchaseOrder = async (
		poId?: string,
	): Promise<Array<{ itemName: string; added: number; newStock: number; unit: string }>> => {
		const inventoryStore = useInventoryStore();
		const itemStore = useItemStore();
		const { convertQuantity } = useUnitConversion();

		const po = poId
			? purchaseOrders.value.find((p) => p._id === poId)
			: purchaseOrder.value;
		if (!po || po.items.length === 0) return [];

		const summary: Array<{ itemName: string; added: number; newStock: number; unit: string }> = [];
		const inventoryRecords: Array<{ item: string; quantity: number; date: Date }> = [];

		for (const lineItem of po.items) {
			const item = itemStore.getItemById(lineItem.item);
			if (!item) continue;

			// Skip items that don't track inventory
			if (item.trackInventory === false) continue;

			const inventoryUnit = item.inventoryUnit || lineItem.sizeUnit;

			// Convert purchased amount to inventory units:
			// PO has quantity (how many packs) x size (amount per pack) in sizeUnit
			const totalPurchased = lineItem.quantity * lineItem.size;
			const addedInInventoryUnits =
				lineItem.sizeUnit === inventoryUnit
					? totalPurchased
					: convertQuantity(totalPurchased, lineItem.sizeUnit, inventoryUnit);

			const currentStock = inventoryStore.getCurrentStock(lineItem.item);
			const newStock = currentStock + addedInInventoryUnits;

			inventoryRecords.push({
				item: lineItem.item,
				quantity: Math.round(newStock * 100) / 100, // round to 2 decimal places
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
				// Error toast already shown by createBulk
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

	// Getters
	const getPurchaseOrderByVendor = (vendorId: string): PurchaseOrder[] => {
		return purchaseOrders.value.filter(
			(po) => po.vendor === vendorId
		);
	};

	const getPurchaseOrderById = (id: string) => {
		return purchaseOrders.value.find((po) => po._id === id);
	};

	const getPurchaseOrdersByItemId = (id: string) => {
		return purchaseOrders.value.filter((po) => {
			return po.items.some((item) => item.item === id);
		});
	};

	return {
		purchaseOrders,
		purchaseOrder,
		loaded,
		loading,
		saving,
		ensureLoaded,
		getPurchaseOrders,
		updatePurchaseOrder,
		deletePurchaseOrder,
		resetCurrentPurchaseOrder,
		receivePurchaseOrder,
		getPurchaseOrderByVendor,
		getPurchaseOrderById,
		getPurchaseOrdersByItemId,
	};
});
