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

const rangeLabel = computed(() => {
  const total = props.totalItems
  if (total <= 0) return ''
  const start = pagination.value.pageIndex * pagination.value.pageSize + 1
  const end = Math.min((pagination.value.pageIndex + 1) * pagination.value.pageSize, total)
  return `${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()}`
})
</script>

<template>
  <div>
    <slot name="header" />
    <div class="flex flex-wrap justify-between items-center gap-3 mb-3">
      <div class="flex items-center gap-3">
        <UInput
          v-model="searchInput"
          :placeholder="searchPlaceholder"
          icon="i-lucide-search"
          class="max-w-xs"
        />
        <slot name="filters" />
      </div>
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
      <div class="flex items-center gap-3">
        <span v-if="rangeLabel" class="text-xs text-parchment/50 hidden sm:inline">
          {{ rangeLabel }}
        </span>
        <UPagination
          :page="pagination.pageIndex + 1"
          @update:page="pagination = { ...pagination, pageIndex: $event - 1 }"
          :items-per-page="pagination.pageSize"
          :total="totalItems"
        />
      </div>
    </div>
  </div>
</template>
