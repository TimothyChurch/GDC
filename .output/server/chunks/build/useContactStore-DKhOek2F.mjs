import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';

const useContactStore = defineStore("contacts", () => {
  const crud = useCrudStore({
    name: "Contact",
    apiPath: "/api/contact",
    defaultItem: () => ({
      _id: "",
      firstName: "",
      lastName: "",
      businessName: "",
      type: "",
      website: "",
      address: "",
      email: "",
      phone: "",
      newsletter: false
    })
  });
  const toast = useToast();
  const getVendors = () => crud.items.value.filter((c) => c.type === "Vendor");
  const getCustomers = () => crud.items.value.filter((c) => c.type === "Customer");
  const getNewsletterSubscribers = () => crud.items.value.filter((c) => c.newsletter);
  const search = (searchTerm) => {
    return crud.items.value.filter(
      (c) => c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const mergeCustomers = async (primaryId, duplicateId) => {
    try {
      const result = await $fetch(
        "/api/contact/merge",
        { method: "POST", body: { primaryId, duplicateId } }
      );
      const idx = crud.items.value.findIndex((c) => c._id === primaryId);
      if (idx !== -1) crud.items.value[idx] = result.merged;
      crud.items.value = crud.items.value.filter((c) => c._id !== duplicateId);
      const total = Object.values(result.transferred).reduce((a, b) => a + b, 0);
      toast.add({
        title: "Customers merged",
        description: total > 0 ? `${total} record(s) transferred` : void 0,
        color: "success",
        icon: "i-lucide-merge"
      });
      return result;
    } catch (error) {
      toast.add({
        title: "Failed to merge customers",
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle"
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
    mergeCustomers
  };
});

export { useContactStore as u };
//# sourceMappingURL=useContactStore-DKhOek2F.mjs.map
