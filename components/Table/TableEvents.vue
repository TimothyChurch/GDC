<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { GDCEvent } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const eventStore = useEventStore();
const router = useRouter();
const { confirm } = useDeleteConfirm();

const UBadge = resolveComponent("UBadge");

const statusFilter = ref<string>("All");

const filteredEvents = computed(() => {
  if (statusFilter.value === "All") return eventStore.events;
  return eventStore.events.filter((e) => e.status === statusFilter.value);
});

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => filteredEvents.value.length)
);

const statusColors: Record<string, string> = {
  Pending: "warning",
  Confirmed: "success",
  Completed: "info",
  Cancelled: "error",
};

function formatDate(val: string) {
  if (!val) return "\u2014";
  return new Date(val).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getContactName(row: GDCEvent): string {
  const c = row.contact as any;
  if (!c || typeof c === "string") return "\u2014";
  return c.businessName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "\u2014";
}

function getContactEmail(row: GDCEvent): string {
  const c = row.contact as any;
  if (!c || typeof c === "string") return "";
  return c.email || "";
}

function getContactPhone(row: GDCEvent): string {
  const c = row.contact as any;
  if (!c || typeof c === "string") return "";
  return c.phone || "";
}

const columns: TableColumn<GDCEvent>[] = [
  expandColumn<GDCEvent>(),
  sortableColumn<GDCEvent>("date", "Date", {
    id: "date",
    accessorFn: (row) => row.date,
    cell: ({ getValue }) => formatDate(getValue() as string),
  }),
  sortableColumn<GDCEvent>("contact", "Contact", {
    id: "contact",
    accessorFn: (row) => getContactName(row),
  }),
  sortableColumn<GDCEvent>("type", "Type"),
  sortableColumn<GDCEvent>("status", "Status", {
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return h(UBadge, {
        color: statusColors[status] || "neutral",
        variant: "subtle",
        size: "sm",
      }, () => status);
    },
  }),
  actionsColumn<GDCEvent>((row) => [
    {
      label: "View details",
      onSelect() {
        router.push(`/admin/events/${row.original._id}`);
      },
    },
    {
      label: "Edit event",
      onSelect() {
        const clone = structuredClone(toRaw(row.original));
        eventStore.event = { ...clone, contact: typeof row.original.contact === 'object' ? (row.original.contact as any)._id : clone.contact };
        openPanel();
      },
    },
    {
      label: "Delete event",
      variant: "danger",
      async onClick() {
        const name = `${row.original.type} on ${formatDate(row.original.date)}`;
        const confirmed = await confirm("Event", name);
        if (confirmed) {
          eventStore.deleteEvent(row.original._id);
        }
      },
    },
  ]),
];

// Panel slide-over
import { LazyPanelEvent } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelEvent);
const openPanel = async () => await panel.open();

const addItem = () => {
  eventStore.resetEvent();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="eventStore.loading"
    search-placeholder="Search events..."
  >
    <template #actions>
      <div class="flex items-center gap-2 flex-wrap">
        <UButton
          v-for="status in ['All', 'Pending', 'Confirmed']"
          :key="status"
          :variant="statusFilter === status ? 'solid' : 'outline'"
          :color="statusFilter === status ? (status === 'Pending' ? 'warning' : status === 'Confirmed' ? 'success' : 'primary') : 'neutral'"
          size="sm"
          @click="statusFilter = status; pagination.pageIndex = 0"
        >
          {{ status }}
        </UButton>
        <UButton icon="i-lucide-plus-circle" size="xl" @click="addItem" variant="ghost">Add Event</UButton>
      </div>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="filteredEvents"
        :columns="columns"
        :loading="eventStore.loading"
        @select="(_e: Event, row: any) => { eventStore.event = { ...structuredClone(toRaw(row.original)), contact: typeof row.original.contact === 'object' ? (row.original.contact as any)._id : row.original.contact }; openPanel() }"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-calendar" title="No events found" description="Schedule tastings, tours, and private events" action-label="Add Event" @action="addItem" />
        </template>
        <template #expanded="{ row }">
          <div class="flex gap-6 flex-wrap py-2 px-4">
            <UFormField label="Group Size">
              <span>{{ row.original.groupSize }}</span>
            </UFormField>
            <UFormField label="Email">
              <span v-if="getContactEmail(row.original)">{{ getContactEmail(row.original) }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Phone">
              <span v-if="getContactPhone(row.original)">{{ getContactPhone(row.original) }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
            <UFormField label="Notes">
              <span v-if="row.original.notes">{{ row.original.notes }}</span>
              <span v-else class="text-parchment/60">N/A</span>
            </UFormField>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="evt in filteredEvents.filter(e => {
          if (!search) return true;
          const term = search.toLowerCase();
          return getContactName(e).toLowerCase().includes(term) || e.type.toLowerCase().includes(term) || e.status.toLowerCase().includes(term);
        })"
        :key="evt._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
        @click="eventStore.event = { ...evt, contact: typeof evt.contact === 'object' ? (evt.contact as any)._id : evt.contact }; openPanel()"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ getContactName(evt) }}</div>
            <div class="text-xs text-parchment/60">{{ evt.type }}</div>
          </div>
          <UBadge :color="statusColors[evt.status] || 'neutral'" variant="subtle" size="xs">
            {{ evt.status }}
          </UBadge>
        </div>
        <div class="space-y-1 text-xs">
          <div class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-calendar" class="text-sm shrink-0" />
            <span>{{ formatDate(evt.date) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-parchment/50">
            <UIcon name="i-lucide-users" class="text-sm shrink-0" />
            <span>Group of {{ evt.groupSize }}</span>
          </div>
        </div>
      </div>
      <BaseEmptyState v-if="filteredEvents.length === 0" icon="i-lucide-calendar" title="No events found" description="Schedule tastings, tours, and private events" action-label="Add Event" @action="addItem" />
    </div>
  </TableWrapper>
</template>
