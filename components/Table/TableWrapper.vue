<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const search = defineModel<string>('search', { default: '' })
const pagination = defineModel<{ pageIndex: number; pageSize: number }>('pagination', {
  default: () => ({ pageIndex: 0, pageSize: 10 }),
})

const props = withDefaults(defineProps<{
  totalItems: number
  loading?: boolean
  emptyIcon?: string
  emptyLabel?: string
  searchPlaceholder?: string
}>(), {
  loading: false,
  searchPlaceholder: 'Search...',
})

// Debounced search: local input syncs to model after 250ms idle
const searchInput = ref(search.value)
const debouncedSync = useDebounceFn((val: string) => {
  search.value = val
  pagination.value = { ...pagination.value, pageIndex: 0 }
}, 250)

watch(searchInput, (val) => debouncedSync(val))
watch(search, (val) => {
  if (val !== searchInput.value) searchInput.value = val
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center gap-3 mb-3">
      <UInput
        v-model="searchInput"
        :placeholder="searchPlaceholder"
        icon="i-lucide-search"
        class="max-w-xs"
      />
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div class="overflow-x-auto">
      <slot />
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-3">
      <UFormField label="Results per Page">
        <USelect
          :items="[5, 10, 20, 100]"
          :model-value="pagination.pageSize"
          @update:model-value="pagination = { ...pagination, pageSize: Number($event), pageIndex: 0 }"
        />
      </UFormField>
      <UPagination
        :model-value="pagination.pageIndex + 1"
        @update:model-value="pagination = { ...pagination, pageIndex: $event - 1 }"
        :items-per-page="pagination.pageSize"
        :total="totalItems"
      />
    </div>
  </div>
</template>
