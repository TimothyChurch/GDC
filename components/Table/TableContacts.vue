<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Contact } from "~/types";
import type { Row } from "@tanstack/vue-table";

const router = useRouter();
const contactStore = useContactStore();
contactStore.getContacts();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

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
    accessorFn: (row) => row.businessName || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Type",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
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
        router.push(`/admin/contacts/${row.original._id}`);
      },
    },
    {
      label: "Edit contact",
      onSelect() {
        contactStore.contact = row.original;
        openPanel();
      },
    },
    {
      label: "Delete contact",
      variant: "danger",
      async onClick() {
        const name = row.original.businessName || `${row.original.firstName} ${row.original.lastName}`;
        const confirmed = await confirm("Contact", name);
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

const addItem = () => {
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="contactStore.contacts.length"
    :loading="contactStore.loading"
    search-placeholder="Search contacts..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addItem" variant="ghost">Add Contact</UButton>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :data="contactStore.contacts"
        :columns="columns"
        :loading="contactStore.loading"
        :empty="{ icon: 'i-lucide-users', label: 'No contacts found' }"
      >
        <template #expanded="{ row }">
          <div class="flex gap-6 flex-wrap py-2 px-4">
            <UFormField label="Website">
              <a v-if="row.original.website" :href="row.original.website" target="_blank" class="text-gold hover:underline">{{ row.original.website }}</a>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Address">
              <span v-if="row.original.address">{{ row.original.address }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Email">
              <span v-if="row.original.email">{{ row.original.email }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Phone">
              <span v-if="row.original.phone">{{ row.original.phone }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="contact in contactStore.contacts.filter(c => {
          if (!search) return true;
          const term = search.toLowerCase();
          return (c.businessName?.toLowerCase().includes(term)) || (`${c.firstName} ${c.lastName}`.toLowerCase().includes(term)) || c.type?.toLowerCase().includes(term);
        })"
        :key="contact._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
        @click="router.push(`/admin/contacts/${contact._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper">
              {{ (contact.firstName?.[0] || contact.businessName?.[0] || '?').toUpperCase() }}
            </div>
            <div>
              <div class="text-sm font-medium text-parchment">{{ contact.businessName || `${contact.firstName} ${contact.lastName}` }}</div>
              <div v-if="contact.type" class="text-xs text-parchment/60">{{ contact.type }}</div>
            </div>
          </div>
        </div>
        <div class="space-y-1 text-xs">
          <div v-if="contact.email" class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-mail" class="text-sm shrink-0" />
            <a :href="`mailto:${contact.email}`" class="text-gold hover:underline truncate" @click.stop>{{ contact.email }}</a>
          </div>
          <div v-if="contact.phone" class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-phone" class="text-sm shrink-0" />
            <a :href="`tel:${contact.phone}`" class="text-parchment/70" @click.stop>{{ contact.phone }}</a>
          </div>
        </div>
      </div>
      <div v-if="contactStore.contacts.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No contacts found
      </div>
    </div>
  </TableWrapper>
</template>
