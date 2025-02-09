import type { ObjectId } from 'mongoose';
import type { Item } from '~/types';

export const useItemStore = defineStore('items', () => {
	// State
	const items = ref<Item[]>([]);
	const item = ref<Item>({
		_id: undefined as unknown as ObjectId,
		name: '',
		type: '',
		vendor: undefined as unknown as ObjectId,
		inventoryUnit: '',
		purchaseHistory: [],
		inventoryHistory: [],
		brand: '',
	});

	// CRUD actions
	const getItems = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/item');
			items.value = response as Item[];
		} catch (e) {
			console.error('Error fetching items:', e);
		}
	};
	getItems();

	const setItem = (id: string) => {
		const foundItem = items.value.find((i) => i._id.toString() === id);
		if (foundItem) {
			item.value = foundItem;
		} else {
			console.error(`Item with ID ${id} not found.`);
		}
	};

	const updateItem = async (): Promise<void> => {
		if (!item.value._id) {
			await $fetch('/api/item/create', {
				method: 'POST',
				body: JSON.stringify(item.value),
			});
		} else {
			await $fetch(`/api/item/${item.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(item.value),
			});
		}
		getItems();
		resetItem();
	};

	const resetItem = (): void => {
		item.value = {
			_id: undefined as unknown as ObjectId,
			name: '',
			type: '',
			vendor: undefined as unknown as ObjectId,
			inventoryUnit: '',
			purchaseHistory: [],
			inventoryHistory: [],
			brand: '',
		};
	};

	const deleteItem = async (id: string): Promise<void> => {
		await $fetch(`/api/item/${id}`, {
			method: 'DELETE',
		});
		await getItems();
	};

	const getItemById = (id: string): Item | undefined => {
		return items.value.find((ing) => ing._id.toString() === id);
	};

	const nameById = (id: string) => {
		return items.value.find((ing) => ing._id.toString() == id)?.name;
	};

	const search = (searchTerm: string): Item[] => {
		return items.value.filter(
			(i) =>
				i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
				i.vendor.toString().includes(searchTerm.toLowerCase())
		);
	};

	return {
		items,
		item,
		getItems,
		setItem,
		updateItem,
		deleteItem,
		getItemById,
		nameById,
		search,
	};
});
