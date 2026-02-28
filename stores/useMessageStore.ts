import type { Message } from '~/types';

export const useMessageStore = defineStore('messages', () => {
	const crud = useCrudStore<Message>({
		name: 'Message',
		apiPath: '/api/message',
		defaultItem: () => ({
			_id: '',
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			topic: '',
			message: '',
			read: false,
		}),
	});

	// Domain-specific getters
	const unreadCount = computed(() => crud.items.value.filter((m) => !m.read).length);

	const getUnreadMessages = () => crud.items.value.filter((m) => !m.read);

	const getMessagesByTopic = (topic: string) =>
		crud.items.value.filter((m) => m.topic === topic);

	const getMessagesByContact = (contactId: string, email?: string) =>
		crud.items.value.filter(
			(m) => m.contact === contactId || (email && m.email === email),
		);

	// Domain-specific actions
	const markAsRead = async (id: string) => {
		try {
			const updated = await $fetch<Message>(`/api/message/${id}`, {
				method: 'PUT',
				body: { read: true },
			});
			const index = crud.items.value.findIndex((m) => m._id === id);
			if (index !== -1) {
				crud.items.value[index] = updated;
			}
		} catch (error) {
			const toast = useToast();
			toast.add({
				title: 'Failed to mark message as read',
				color: 'error',
				icon: 'i-lucide-alert-circle',
			});
		}
	};

	const markAsUnread = async (id: string) => {
		try {
			const updated = await $fetch<Message>(`/api/message/${id}`, {
				method: 'PUT',
				body: { read: false },
			});
			const index = crud.items.value.findIndex((m) => m._id === id);
			if (index !== -1) {
				crud.items.value[index] = updated;
			}
		} catch (error) {
			const toast = useToast();
			toast.add({
				title: 'Failed to mark message as unread',
				color: 'error',
				icon: 'i-lucide-alert-circle',
			});
		}
	};

	return {
		// Base CRUD (generic names)
		...crud,
		// Domain aliases
		messages: crud.items,
		fetchMessages: crud.getAll,
		createMessage: crud.saveItem,
		deleteMessage: crud.deleteItem,
		// Domain-specific getters
		unreadCount,
		getUnreadMessages,
		getMessagesByTopic,
		getMessagesByContact,
		// Domain-specific actions
		markAsRead,
		markAsUnread,
	};
});
