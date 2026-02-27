import type { GDCEvent } from '~/types';

export const useEventStore = defineStore('events', () => {
	const crud = useCrudStore<GDCEvent>({
		name: 'Event',
		apiPath: '/api/event',
		defaultItem: () => ({
			_id: '',
			date: '',
			groupSize: 1,
			contact: '',
			type: 'Private Class',
			status: 'Pending',
			notes: '',
		}),
	});

	// Domain-specific getters
	const getByStatus = (status: string): GDCEvent[] => {
		return crud.items.value.filter((e) => e.status === status);
	};

	const getEventsByContact = (contactId: string): GDCEvent[] => {
		return crud.items.value.filter((e) => {
			if (typeof e.contact === 'object' && e.contact) {
				return (e.contact as any)._id === contactId;
			}
			return e.contact === contactId;
		});
	};

	const pendingEvents = computed(() => crud.items.value.filter((e) => e.status === 'Pending').length);

	return {
		...crud,
		// Domain aliases for backward compatibility
		events: crud.items,
		event: crud.item,
		getEvents: crud.getAll,
		updateEvent: crud.saveItem,
		deleteEvent: crud.deleteItem,
		resetEvent: crud.resetItem,
		getEventById: crud.getById,
		// Domain-specific
		getByStatus,
		getEventsByContact,
		pendingEvents,
	};
});
