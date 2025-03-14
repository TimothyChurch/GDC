import type { Inventory } from '~/types';
import type { ObjectId } from 'mongoose';

export const useInventoryStore = defineStore('inventories', () => {
	// State
	const inventories = ref<Inventory[]>([]);
	const inventory = ref({
		_id: undefined as unknown as ObjectId,
		date: new Date(),
		items: {},
	});
	// CRUD actions
	const getInventories = async (): Promise<void> => {
		const response = await $fetch('/api/inventory');
		inventories.value = response as Inventory[];
		return;
	};
	getInventories();

	const updateInventory = async (): Promise<void> => {
		if (!inventory.value._id) {
			await $fetch('/api/inventory/create', {
				method: 'POST',
				body: JSON.stringify(inventory.value),
			});
		} else {
			await $fetch(`/api/inventory/${inventory.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(inventory.value),
			});
		}
		getInventories();
		resetInventory();
		return;
	};

	const resetInventory = () => {
		inventory.value = {
			_id: undefined as unknown as ObjectId,
			date: new Date(),
			items: {},
		};
		return;
	};

	const deleteInventory = async (id: string): Promise<void> => {
		await $fetch(`/api/inventory/${id}`, {
			method: 'DELETE',
		});
		getInventories();
		return;
	};

	const getInventoriesByItemId = (id: string) => {
		return inventories.value.filter((i) => Object.keys(i.items).includes(id));
	};

	return {
		inventories,
		inventory,
		getInventories,
		updateInventory,
		resetInventory,
		deleteInventory,
		getInventoriesByItemId,
	};
});
