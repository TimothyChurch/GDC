import type { PurchaseOrder, PurchaseOrderItem } from "~/types";
import type { ObjectId } from "mongoose";

export const usePurchaseOrderStore = defineStore("purchaseOrders", () => {
  // State
  const purchaseOrders = ref<PurchaseOrder[]>([]);
  const purchaseOrder = ref<PurchaseOrder>({
    _id: undefined as unknown as ObjectId,
    vendor: "" as unknown as ObjectId,
    status: "",
    items: [],
    total: 0,
    date: new Date(),
  });

  // Actions
  const getPurchaseOrders = async (): Promise<void> => {
    const response = await $fetch("/api/purchaseOrder");
    purchaseOrders.value = response as PurchaseOrder[];
  };

  const updatePurchaseOrder = async (): Promise<void> => {
    if (!purchaseOrder.value._id) {
      await $fetch("/api/purchaseOrder/create", {
        method: "POST",
        body: JSON.stringify(purchaseOrder.value),
      });
    } else {
      await $fetch(`/api/purchaseOrder/${purchaseOrder.value._id}`, {
        method: "PUT",
        body: JSON.stringify(purchaseOrder.value),
      });
    }
    resetCurrentPurchaseOrder();
    await getPurchaseOrders();
  };

  const deletePurchaseOrder = async (id: string): Promise<void> => {
    await $fetch(`/api/purchaseOrder/${id}`, {
      method: "DELETE",
    });
    await getPurchaseOrders();
  };

  const resetCurrentPurchaseOrder = (): void => {
    purchaseOrder.value = {
      _id: undefined as unknown as ObjectId,
      vendor: "" as unknown as ObjectId,
      status: "",
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

  return {
    purchaseOrders,
    purchaseOrder,
    getPurchaseOrders,
    updatePurchaseOrder,
    deletePurchaseOrder,
    resetCurrentPurchaseOrder,
    getPurchaseOrderByVendor,
  };
});
