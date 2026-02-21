import type { GDCEvent } from '~/types';

export const useEventStore = defineStore('events', () => {
	const toast = useToast();

	// State
	const events = ref<GDCEvent[]>([]);
	const loaded = ref(false);
	const loading = ref(false);
	const saving = ref(false);
	const event = ref<GDCEvent>({
		_id: '',
		date: '',
		groupSize: 1,
		contact: '',
		type: 'Private Class',
		status: 'Pending',
		notes: '',
	});

	// CRUD actions
	const getEvents = async (): Promise<void> => {
		loading.value = true;
		try {
			const response = await $fetch('/api/event');
			events.value = response as GDCEvent[];
		} catch (error) {
		} finally {
			loading.value = false;
		}
	};

	const ensureLoaded = async () => {
		if (!loaded.value) {
			await getEvents();
			loaded.value = true;
		}
	};

	const updateEvent = async (): Promise<void> => {
		saving.value = true;
		try {
			const isNew = !event.value._id;
			if (isNew) {
				const { _id, ...createData } = event.value;
				const response = await $fetch('/api/event/create', {
					method: 'POST',
					body: JSON.stringify(createData),
				});
				events.value.push(response as GDCEvent);
			} else {
				const response = await $fetch(`/api/event/${event.value._id}`, {
					method: 'PUT',
					body: JSON.stringify(event.value),
				});
				const index = events.value.findIndex((e) => e._id === event.value._id);
				if (index !== -1) {
					events.value[index] = response as GDCEvent;
				}
			}
			toast.add({ title: `Event ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
			resetEvent();
		} catch (error: any) {
			toast.add({ title: 'Failed to save event', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	const resetEvent = (): void => {
		event.value = {
			_id: '',
			date: '',
			groupSize: 1,
			contact: '',
			type: 'Private Class',
			status: 'Pending',
			notes: '',
		};
	};

	const deleteEvent = async (id: string): Promise<void> => {
		saving.value = true;
		try {
			await $fetch(`/api/event/${id}`, {
				method: 'DELETE',
			});
			events.value = events.value.filter((e) => e._id !== id);
			toast.add({ title: 'Event deleted', color: 'success', icon: 'i-lucide-check-circle' });
		} catch (error: any) {
			toast.add({ title: 'Failed to delete event', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
		} finally {
			saving.value = false;
		}
	};

	// Getters
	const getEventById = (id: string): GDCEvent | undefined => {
		return events.value.find((e) => e._id === id);
	};

	const getByStatus = (status: string): GDCEvent[] => {
		return events.value.filter((e) => e.status === status);
	};

	const getEventsByContact = (contactId: string): GDCEvent[] => {
		return events.value.filter((e) => {
			if (typeof e.contact === 'object' && e.contact) {
				return (e.contact as any)._id === contactId;
			}
			return e.contact === contactId;
		});
	};

	const pendingEvents = computed(() => events.value.filter((e) => e.status === 'Pending').length);

	return {
		events,
		event,
		loaded,
		loading,
		saving,
		ensureLoaded,
		getEvents,
		updateEvent,
		deleteEvent,
		resetEvent,
		getEventById,
		getByStatus,
		getEventsByContact,
		pendingEvents,
	};
});
