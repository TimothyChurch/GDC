import type { Contact } from '~/types';

export const useContactStore = defineStore('contacts', () => {
	const toast = useToast();

	// State
	const contacts = ref<Contact[]>([]);
	const loading = ref(false);
	const saving = ref(false);
	const contact = ref<Contact>({
		_id: '',
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
		loading.value = true;
		try {
			const response = await $fetch('/api/contact');
			contacts.value = response as Contact[];
		} catch (error) {
			console.error('Error fetching contacts:', error);
		} finally {
			loading.value = false;
		}
	};
	getContacts();

	const checkContacts = () => {
		if (!contacts.value.length) {
			getContacts();
		}
	};
	const updateContact = async (): Promise<void> => {
		saving.value = true;
		try {
			const isNew = !contact.value._id;
			if (isNew) {
				const response = await $fetch('/api/contact/create', {
					method: 'POST',
					body: JSON.stringify(contact.value),
				});
				contacts.value.push(response as Contact);
			} else {
				const response = await $fetch(`/api/contact/${contact.value._id}`, {
					method: 'PUT',
					body: JSON.stringify(contact.value),
				});
				const index = contacts.value.findIndex((c) => c._id === contact.value._id);
				if (index !== -1) {
					contacts.value[index] = response as Contact;
				}
			}
			toast.add({ title: `Contact ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetContact();
		} catch (error: any) {
			toast.add({ title: 'Failed to save contact', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const resetContact = (): void => {
		contact.value = {
			_id: '',
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
		saving.value = true;
		try {
			await $fetch(`/api/contact/${id}`, {
				method: 'DELETE',
			});
			contacts.value = contacts.value.filter((c) => c._id !== id);
			toast.add({ title: 'Contact deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete contact', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	// Getters
	const getContactById = (id: string): Contact | undefined => {
		checkContacts();
		return contacts.value.find((c) => c._id === id);
	};

	const getVendors = () => {
		checkContacts();
		return contacts.value.filter((c) => c.type === 'Vendor');
	};

	const search = (searchTerm: string): Contact[] => {
		return contacts.value.filter(
			(c) =>
				c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	return {
		contacts,
		contact,
		loading,
		saving,
		getContacts,
		updateContact,
		deleteContact,
		getContactById,
		getVendors,
		search,
	};
});
