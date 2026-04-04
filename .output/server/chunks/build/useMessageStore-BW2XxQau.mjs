import { computed } from 'vue';
import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';

const useMessageStore = defineStore("messages", () => {
  const crud = useCrudStore({
    name: "Message",
    apiPath: "/api/message",
    defaultItem: () => ({
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      topic: "",
      message: "",
      read: false
    })
  });
  const unreadCount = computed(() => crud.items.value.filter((m) => !m.read).length);
  const getUnreadMessages = () => crud.items.value.filter((m) => !m.read);
  const getMessagesByTopic = (topic) => crud.items.value.filter((m) => m.topic === topic);
  const getMessagesByContact = (contactId, email) => crud.items.value.filter(
    (m) => m.contact === contactId || email && m.email === email
  );
  const markAsRead = async (id) => {
    try {
      const updated = await $fetch(`/api/message/${id}`, {
        method: "PUT",
        body: { read: true }
      });
      const index = crud.items.value.findIndex((m) => m._id === id);
      if (index !== -1) {
        crud.items.value[index] = updated;
      }
    } catch (error) {
      const toast = useToast();
      toast.add({
        title: "Failed to mark message as read",
        color: "error",
        icon: "i-lucide-alert-circle"
      });
    }
  };
  const markAsUnread = async (id) => {
    try {
      const updated = await $fetch(`/api/message/${id}`, {
        method: "PUT",
        body: { read: false }
      });
      const index = crud.items.value.findIndex((m) => m._id === id);
      if (index !== -1) {
        crud.items.value[index] = updated;
      }
    } catch (error) {
      const toast = useToast();
      toast.add({
        title: "Failed to mark message as unread",
        color: "error",
        icon: "i-lucide-alert-circle"
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
    markAsUnread
  };
});

export { useMessageStore as u };
//# sourceMappingURL=useMessageStore-BW2XxQau.mjs.map
