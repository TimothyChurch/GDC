import { computed } from 'vue';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';

const useEventStore = defineStore("events", () => {
  const crud = useCrudStore({
    name: "Event",
    apiPath: "/api/event",
    defaultItem: () => ({
      _id: "",
      date: "",
      groupSize: 0,
      contact: "",
      type: "Private Class",
      status: "Pending",
      notes: "",
      price: void 0,
      addOns: []
    })
  });
  const getByStatus = (status) => {
    return crud.items.value.filter((e) => e.status === status);
  };
  const getEventsByContact = (contactId) => {
    return crud.items.value.filter((e) => {
      if (typeof e.contact === "object" && e.contact) {
        return e.contact._id === contactId;
      }
      return e.contact === contactId;
    });
  };
  const pendingEvents = computed(() => crud.items.value.filter((e) => e.status === "Pending").length);
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
    pendingEvents
  };
});

export { useEventStore as u };
//# sourceMappingURL=useEventStore-LoZhbbHY.mjs.map
