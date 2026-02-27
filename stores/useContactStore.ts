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
	};
});
