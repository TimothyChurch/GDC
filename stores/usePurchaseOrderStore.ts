import type { PurchaseOrder, PurchaseOrderItem } from '~/types';
import type { ObjectId } from 'mongoose';

export const usePurchaseOrderStore = defineStore('purchaseOrders', () => {
	// State
	const purchaseOrders = ref<PurchaseOrder[]>([]);
	const purchaseOrder = ref<PurchaseOrder>({
		_id: undefined as unknown as ObjectId,
		vendor: '' as unknown as ObjectId,
		status: '',
		items: [],
		total: 0,
		date: new Date(),
	});

	// Actions
	const getPurchaseOrders = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/purchaseOrder');
			purchaseOrders.value = response as PurchaseOrder[];
		} catch (error) {
			console.error('Error fetching purchase orders:', error);
		}
	};
	getPurchaseOrders();

	const updatePurchaseOrder = async (): Promise<PurchaseOrder> => {
		const response = ref();
		if (!purchaseOrder.value._id) {
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
		await getPurchaseOrders();
		resetCurrentPurchaseOrder();

		return response.value;
	};

	const deletePurchaseOrder = async (id: string): Promise<void> => {
		await $fetch(`/api/purchaseOrder/${id}`, {
			method: 'DELETE',
		});
		await getPurchaseOrders();
	};

	const resetCurrentPurchaseOrder = (): void => {
		purchaseOrder.value = {
			_id: undefined as unknown as ObjectId,
			vendor: '' as unknown as ObjectId,
			status: '',
			items: [],
			total: 0,
			date: new Date(),
		};
	};

	// Getters
	const getPurchaseOrderByVendor = (vendorId: string): PurchaseOrder[] => {
		return purchaseOrders.value.filter(
			(po) => po.vendor.toString() === vendorId
		);
	};

	const getPurchaseOrderById = (id: string) => {
		return purchaseOrders.value.find((po) => po._id.toString() === id);
	};

	const getPurchaseOrdersByItemId = (id: string) => {
		return purchaseOrders.value.filter((po) => {
			return po.items.some((item) => item.item.toString() === id);
		});
	};

	return {
		purchaseOrders,
		purchaseOrder,
		getPurchaseOrders,
		updatePurchaseOrder,
		deletePurchaseOrder,
		resetCurrentPurchaseOrder,
		getPurchaseOrderByVendor,
		getPurchaseOrderById,
		getPurchaseOrdersByItemId,
	};
});
