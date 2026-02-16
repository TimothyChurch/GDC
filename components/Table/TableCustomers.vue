<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Contact } from "~/types";
import type { Row } from "@tanstack/vue-table";

const router = useRouter();
const contactStore = useContactStore();
const eventStore = useEventStore();
contactStore.getContacts();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const customers = computed(() => contactStore.getCustomers());

function eventCount(contactId: string): number {
  return eventStore.getEventsByContact(contactId).length;
}

const columns: TableColumn<Contact>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    id: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Name",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    accessorFn: (row) =>
      row.businessName || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
    cell: ({ row, getValue }) => {
      const name = getValue() as string;
      const badges = [];
      if (row.original.newsletter) {
        badges.push(
          h(UBadge, { color: "success", variant: "subtle", size: "sm" }, () => "Newsletter")
        );
      }
      if (badges.length) {
        return h("div", { class: "flex items-center gap-2" }, [name, ...badges]);
      }
      return name;
    },
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: ({ getValue }) => {
      const email = getValue() as string;
      if (!email) return "—";
      return h("a", { href: `mailto:${email}`, class: "text-copper hover:text-gold transition-colors", onClick: (e: Event) => e.stopPropagation() }, email);
    },
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: ({ getValue }) => {
      const phone = getValue() as string;
      return phone || "—";
    },
  },
  {
    id: "events",
    header: "Events",
    accessorFn: (row) => eventCount(row._id),
    cell: ({ getValue }) => {
      const count = getValue() as number;
      if (count > 0) {
        return h(UBadge, { color: "warning", variant: "subtle", size: "sm" }, () => `${count}`);
      }
      return h("span", { class: "text-parchment/50" }, "0");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            })
        )
      );
    },
  },
];

function getRowItems(row: Row<Contact>) {
  return [
    {
      label: "View Details",
      onSelect() {
        router.push(`/admin/customers/${row.original._id}`);
      },
    },
    {
      label: "Edit customer",
      onSelect() {
        contactStore.contact = row.original;
        openPanel();
      },
    },
    {
      label: "Delete customer",
      variant: "danger",
      async onClick() {
        const name =
          row.original.businessName ||
          `${row.original.firstName} ${row.original.lastName}`;
        const confirmed = await confirm("Customer", name);
        if (confirmed) {
          contactStore.deleteContact(row.original._id);
        }
      },
    },
  ];
}

// Panel slide-over
import { PanelContact } from "#components";
const overlay = useOverlay();
const panel = overlay.create(PanelContact);
const openPanel = async () => await panel.open();

const addCustomer = () => {
  contactStore.contact = {
    _id: "",
    firstName: "",
    lastName: "",
    businessName: "",
    type: "Customer",
    website: "",
    address: "",
    email: "",
    phone: "",
    newsletter: false,
  };
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="customers.length"
    :loading="contactStore.loading"
    search-placeholder="Search customers..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addCustomer" variant="ghost">
        Add Customer
      </UButton>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :data="customers"
        :columns="columns"
        :loading="contactStore.loading"
        :empty="{ icon: 'i-lucide-heart-handshake', label: 'No customers found' }"
      >
        <template #expanded="{ row }">
          <div class="flex gap-6 flex-wrap py-2 px-4">
            <UFormField label="Address">
              <span v-if="row.original.address">{{ row.original.address }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Notes">
              <span v-if="row.original.notes">{{ row.original.notes }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Created">
              <span v-if="row.original.createdAt">{{ new Date(row.original.createdAt).toLocaleDateString() }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="customer in customers.filter(c => {
          if (!search) return true;
          const term = search.toLowerCase();
          return (c.businessName?.toLowerCase().includes(term)) || (`${c.firstName} ${c.lastName}`.toLowerCase().includes(term)) || c.email?.toLowerCase().includes(term);
        })"
        :key="customer._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
        @click="router.push(`/admin/customers/${customer._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper">
              {{ (customer.firstName?.[0] || customer.businessName?.[0] || '?').toUpperCase() }}
            </div>
            <div>
              <div class="text-sm font-medium text-parchment flex items-center gap-2">
                {{ customer.businessName || `${customer.firstName} ${customer.lastName}` }}
                <UBadge v-if="customer.newsletter" color="success" variant="subtle" size="xs">Newsletter</UBadge>
              </div>
            </div>
          </div>
          <UBadge v-if="eventCount(customer._id) > 0" color="warning" variant="subtle" size="xs">
            {{ eventCount(customer._id) }} event{{ eventCount(customer._id) !== 1 ? 's' : '' }}
          </UBadge>
        </div>
        <div class="space-y-1 text-xs">
          <div v-if="customer.email" class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-mail" class="text-sm shrink-0" />
            <a :href="`mailto:${customer.email}`" class="text-gold hover:underline truncate" @click.stop>{{ customer.email }}</a>
          </div>
          <div v-if="customer.phone" class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-phone" class="text-sm shrink-0" />
            <a :href="`tel:${customer.phone}`" class="text-parchment/70" @click.stop>{{ customer.phone }}</a>
          </div>
        </div>
      </div>
      <div v-if="customers.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No customers found
      </div>
    </div>
  </TableWrapper>
</template>
