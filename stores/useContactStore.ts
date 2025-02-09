import type { ObjectId } from 'mongoose';
import type { Contact } from '~/types';

export const useContactStore = defineStore('contacts', () => {
	// State
	const contacts = ref<Contact[]>([]);
	const contact = ref<Contact>({
		_id: undefined as unknown as ObjectId,
		firstName: '',
		lastName: '',
		businessName: '',
		type: '',
		website: '',
		address: '',
		email: '',
		phone: '',
	});

	// CRUD actions
	const getContacts = async (): Promise<void> => {
		try {
			const response = await $fetch('/api/contact');
			contacts.value = response as Contact[];
		} catch (error) {
			console.error('Error fetching contacts:', error);
		}
	};
	getContacts();

	const checkContacts = () => {
		if (!contacts.value.length) {
			getContacts();
		}
	};
	const updateContact = async (): Promise<void> => {
		if (!contact.value._id) {
			await $fetch('/api/contact/create', {
				method: 'POST',
				body: JSON.stringify(contact.value),
			});
		} else {
			await $fetch(`/api/contact/${contact.value._id}`, {
				method: 'PUT',
				body: JSON.stringify(contact.value),
			});
		}
		await getContacts();
		resetContact();
	};

	const resetContact = (): void => {
		contact.value = {
			_id: undefined as unknown as ObjectId,
			firstName: '',
			lastName: '',
			businessName: '',
			type: '',
			website: '',
			address: '',
			email: '',
			phone: '',
		};
	};

	const deleteContact = async (id: string): Promise<void> => {
		await $fetch(`/api/contact/${id}`, {
			method: 'DELETE',
		});
		await getContacts();
	};

	// Getters
	const getContactById = (id: string): Contact | undefined => {
		checkContacts();
		return contacts.value.find((c) => c._id.toString() === id);
	};

	const getVendors = () => {
		checkContacts();
		return contacts.value.filter((c) => c.type === 'Vendor');
	};

	const search = (searchTerm: string): Contact[] => {
		return contacts.value.filter(
			(c) =>
				c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	return {
		contacts,
		contact,
		getContacts,
		updateContact,
		deleteContact,
		getContactById,
		getVendors,
		search,
	};
});
