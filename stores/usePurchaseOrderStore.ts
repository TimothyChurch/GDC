import type { PurchaseOrder } from '~/types';

export const usePurchaseOrderStore = defineStore('purchaseOrders', () => {
	const toast = useToast();

	// State
	const purchaseOrders = ref<PurchaseOrder[]>([]);
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
		} catch (error) {
			console.error('Error fetching purchase orders:', error);
		} finally {
			loading.value = false;
		}
	};
	getPurchaseOrders();

	const updatePurchaseOrder = async (): Promise<PurchaseOrder> => {
		saving.value = true;
		try {
			const response = ref();
			const isNew = !purchaseOrder.value._id;
			if (isNew) {
				response.value = await $fetch('/api/purchaseOrder/create', {
					method: 'POST',
					body: JSON.stringify(purchaseOrder.value),
				});
			} else {
				response.value = await $fetch(
					`/api/purchaseOrder/${purchaseOrder.value._id}`,
					{
						method: 'PUT',
						body: JSON.stringify(purchaseOrder.value),
					}
				);
			}
			toast.add({ title: `Purchase order ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			await getPurchaseOrders();
			resetCurrentPurchaseOrder();
			return response.value;
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
			toast.add({ title: 'Purchase order deleted', color: 'success', icon: 'i-lucide-check-circle' });
			await getPurchaseOrders();
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
		loading,
		saving,
		getPurchaseOrders,
		updatePurchaseOrder,
		deletePurchaseOrder,
		resetCurrentPurchaseOrder,
		getPurchaseOrderByVendor,
		getPurchaseOrderById,
		getPurchaseOrdersByItemId,
	};
});
