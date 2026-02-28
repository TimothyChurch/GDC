<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types'
import { getPaginationRowModel } from '@tanstack/vue-table'

const userStore = useUserStore()
const { confirm } = useDeleteConfirm()

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => userStore.users.length)
)

const columns: TableColumn<User>[] = [
  sortableColumn<User>('firstName', 'Name', {
    id: 'firstName',
    accessorFn: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(),
    cell: ({ row }) => {
      const first = row.original.firstName || ''
      const last = row.original.lastName || ''
      return `${first} ${last}`.trim() || 'N/A'
    },
  }),
  sortableColumn<User>('email', 'Email'),
  actionsColumn<User>((row) => [
    {
      label: 'Edit user',
      onSelect() {
        userStore.setUser(row.original._id)
        openPanel()
      },
    },
    {
      label: 'Delete user',
      variant: 'danger',
      async onClick() {
        const name = `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || row.original.email
        const confirmed = await confirm('User', name)
        if (confirmed) {
          userStore.deleteUser(row.original._id)
        }
      },
    },
  ]),
]

// Panel slide-over
import { LazyPanelUser } from '#components'
const overlay = useOverlay()
const panel = overlay.create(LazyPanelUser)
const openPanel = async () => await panel.open()

const addUser = () => {
  userStore.resetUser()
  openPanel()
}
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="userStore.loading"
    search-placeholder="Search users..."
  >
    <template #actions>
      <UButton icon="i-lucide-plus" size="xl" @click="addUser" variant="ghost">Add User</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="userStore.users"
        :columns="columns"
        :loading="userStore.loading"
        @select="(_e: Event, row: any) => { userStore.setUser(row.original._id); openPanel() }"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-user" title="No users found" description="Add users to manage admin access" action-label="Add User" @action="addUser" />
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="user in userStore.users.filter(u => {
          if (!search) return true;
          const term = search.toLowerCase();
          return (u.firstName || '').toLowerCase().includes(term) || (u.lastName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term);
        })"
        :key="user._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="userStore.setUser(user._id); openPanel()"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper">
            {{ (user.firstName?.[0] || user.email?.[0] || '?').toUpperCase() }}
          </div>
          <div>
            <div class="text-sm font-medium text-parchment">{{ `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A' }}</div>
            <div class="text-xs text-parchment/60">{{ user.email }}</div>
          </div>
        </div>
      </div>
      <BaseEmptyState v-if="userStore.users.length === 0" icon="i-lucide-user" title="No users found" description="Add users to manage admin access" action-label="Add User" @action="addUser" />
    </div>
  </TableWrapper>
</template>
