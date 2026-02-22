<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types'
import type { Row } from '@tanstack/vue-table'

const userStore = useUserStore()
const { confirm } = useDeleteConfirm()

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const search = ref('')
const pagination = ref({ pageIndex: 0, pageSize: 10 })

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'firstName',
    header: 'Name',
    cell: ({ row }) => {
      const first = row.original.firstName || ''
      const last = row.original.lastName || ''
      return `${first} ${last}`.trim() || 'N/A'
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: { align: 'end' },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown',
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown',
            })
        )
      )
    },
  },
]

function getRowItems(row: Row<User>) {
  return [
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
  ]
}

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
    :total-items="userStore.users.length"
    :loading="userStore.loading"
    search-placeholder="Search users..."
  >
    <template #actions>
      <UButton icon="i-lucide-plus" size="xl" @click="addUser" variant="ghost">Add User</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :data="userStore.users"
        :columns="columns"
        :loading="userStore.loading"
        :empty="'No users found'"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="user in userStore.users"
        :key="user._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
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
      <div v-if="userStore.users.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No users found
      </div>
    </div>
  </TableWrapper>
</template>
