<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Contact } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const router = useRouter();
const contactStore = useContactStore();
contactStore.ensureLoaded();
const { confirm } = useDeleteConfirm();

const UBadge = resolveComponent("UBadge");

const newsletterOnly = ref(false);

const filteredContacts = computed(() => {
  if (newsletterOnly.value) {
    return contactStore.contacts.filter((c) => c.newsletter);
  }
  return contactStore.contacts;
});

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => filteredContacts.value.length)
);

const columns: TableColumn<Contact>[] = [
  expandColumn<Contact>(),
  sortableColumn<Contact>("name", "Name", {
    id: "name",
    accessorFn: (row) => row.businessName || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
    cell: ({ row, getValue }) => {
      const name = getValue() as string;
      const badges = [];
      if (row.original.newsletter) {
        badges.push(
          h(UBadge, { color: 'success', variant: 'subtle', size: 'sm' }, () => 'Newsletter')
        );
      }
      if (badges.length) {
        return h('div', { class: 'flex items-center gap-2' }, [name, ...badges]);
      }
      return name;
    },
  }),
  sortableColumn<Contact>("type", "Type"),
  actionsColumn<Contact>((row) => [
    {
      label: "View Details",
      onSelect() {
        router.push(`/admin/contacts/${row.original._id}`);
      },
    },
    {
      label: "Edit contact",
      onSelect() {
        contactStore.contact = JSON.parse(JSON.stringify(row.original));
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
  ]),
];

// Panel slide-over
import { LazyPanelContact } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelContact);
const openPanel = async () => await panel.open();

const addItem = () => {
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="contactStore.loading"
    search-placeholder="Search contacts..."
  >
    <template #actions>
      <div class="flex items-center gap-2">
        <UButton
          :icon="newsletterOnly ? 'i-lucide-mail-check' : 'i-lucide-mail'"
          :variant="newsletterOnly ? 'solid' : 'outline'"
          :color="newsletterOnly ? 'success' : 'neutral'"
          size="sm"
          @click="newsletterOnly = !newsletterOnly; pagination.pageIndex = 0"
        >
          Newsletter
        </UButton>
        <UButton icon="i-heroicons-plus-circle" size="xl" @click="addItem" variant="ghost">Add Contact</UButton>
      </div>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="filteredContacts"
        :columns="columns"
        :loading="contactStore.loading"
        :empty="newsletterOnly ? 'No newsletter subscribers' : 'No contacts found'"
        @select="(_e: Event, row: any) => router.push(`/admin/contacts/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
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
        v-for="contact in filteredContacts.filter(c => {
          if (!search) return true;
          const term = search.toLowerCase();
          return (c.businessName?.toLowerCase().includes(term)) || (`${c.firstName} ${c.lastName}`.toLowerCase().includes(term)) || c.type?.toLowerCase().includes(term);
        })"
        :key="contact._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/contacts/${contact._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper">
              {{ (contact.firstName?.[0] || contact.businessName?.[0] || '?').toUpperCase() }}
            </div>
            <div>
              <div class="text-sm font-medium text-parchment flex items-center gap-2">
                {{ contact.businessName || `${contact.firstName} ${contact.lastName}` }}
                <UBadge v-if="contact.newsletter" color="success" variant="subtle" size="xs">Newsletter</UBadge>
              </div>
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
      <div v-if="filteredContacts.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        {{ newsletterOnly ? 'No newsletter subscribers' : 'No contacts found' }}
      </div>
    </div>
  </TableWrapper>
</template>
