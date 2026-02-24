<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { GDCEvent } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const eventStore = useEventStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const statusFilter = ref<string>("All");

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? filteredEvents.value.length
);

const filteredEvents = computed(() => {
  if (statusFilter.value === "All") return eventStore.events;
  return eventStore.events.filter((e) => e.status === statusFilter.value);
});

const statusColors: Record<string, string> = {
  Pending: "warning",
  Confirmed: "success",
  Completed: "info",
  Cancelled: "error",
};

function formatDate(val: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getContactName(row: GDCEvent): string {
  const c = row.contact as any;
  if (!c || typeof c === "string") return "—";
  return c.businessName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
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
    id: "date",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Date",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    accessorFn: (row) => row.date,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => getContactName(row),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return h(UBadge, {
        color: statusColors[status] || "neutral",
        variant: "subtle",
        size: "sm",
      }, () => status);
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

function getRowItems(row: Row<GDCEvent>) {
  return [
    {
      label: "Edit event",
      onSelect() {
        const clone = JSON.parse(JSON.stringify(row.original));
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
  ];
}

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
        <UButton icon="i-heroicons-plus-circle" size="xl" @click="addItem" variant="ghost">Add Event</UButton>
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
        :empty="'No events found'"
      >
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
      <div v-if="filteredEvents.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No events found
      </div>
    </div>
  </TableWrapper>
</template>
