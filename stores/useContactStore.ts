import type { Contact } from '~/types';

export const useContactStore = defineStore('contacts', () => {
	const crud = useCrudStore<Contact>({
		name: 'Contact',
		apiPath: '/api/contact',
		defaultItem: () => ({
			_id: '',
			firstName: '',
			lastName: '',
			businessName: '',
			type: '',
			website: '',
			address: '',
			email: '',
			phone: '',
			newsletter: false,
		}),
	});

	const toast = useToast();

	// Domain-specific getters
	const getVendors = () => crud.items.value.filter((c) => c.type === 'Vendor');
	const getCustomers = () => crud.items.value.filter((c) => c.type === 'Customer');
	const getNewsletterSubscribers = () => crud.items.value.filter((c) => c.newsletter);

	const search = (searchTerm: string): Contact[] => {
		return crud.items.value.filter(
			(c) =>
				c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	};

	const mergeCustomers = async (primaryId: string, duplicateId: string) => {
		try {
			const result = await $fetch<{ merged: Contact; transferred: Record<string, number> }>(
				'/api/contact/merge',
				{ method: 'POST', body: { primaryId, duplicateId } },
			);
			// Update primary in local state
			const idx = crud.items.value.findIndex((c) => c._id === primaryId);
			if (idx !== -1) crud.items.value[idx] = result.merged;
			// Remove duplicate from local state
			crud.items.value = crud.items.value.filter((c) => c._id !== duplicateId);

			const total = Object.values(result.transferred).reduce((a, b) => a + b, 0);
			toast.add({
				title: 'Customers merged',
				description: total > 0 ? `${total} record(s) transferred` : undefined,
				color: 'success',
				icon: 'i-lucide-merge',
			});
			return result;
		} catch (error: unknown) {
			toast.add({
				title: 'Failed to merge customers',
				description: getErrorMessage(error),
				color: 'error',
				icon: 'i-lucide-alert-circle',
			});
			throw error;
		}
	};

	return {
		// Base CRUD (generic names)
		...crud,
		// Domain aliases for backward compatibility
		contacts: crud.items,
		contact: crud.item,
		getContacts: crud.getAll,
		updateContact: crud.saveItem,
		deleteContact: crud.deleteItem,
		resetContact: crud.resetItem,
		getContactById: crud.getById,
		// Domain-specific
		getVendors,
		getCustomers,
		getNewsletterSubscribers,
		search,
		mergeCustomers,
	};
});
