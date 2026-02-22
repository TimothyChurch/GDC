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
		getPurchaseOrderByVendor,
		getPurchaseOrderById,
		getPurchaseOrdersByItemId,
	};
});
