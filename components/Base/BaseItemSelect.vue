<script setup lang="ts">
import type { Item, ItemCategory } from '~/types'

const props = withDefaults(defineProps<{
  modelValue: string | null
  filterByType?: string | string[]
  filterByCategory?: string | string[]
  filterFn?: (item: Item) => boolean
  placeholder?: string
  size?: string
  disabled?: boolean
  allowCreate?: boolean
  createCategory?: ItemCategory
  createType?: string
}>(), {
  modelValue: null,
  placeholder: 'Select item...',
  size: 'md',
  disabled: false,
  allowCreate: true,
  createCategory: 'Other',
  createType: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  created: [item: Item]
}>()

const itemStore = useItemStore()
const toast = useToast()
const creating = ref(false)

const filteredItems = computed(() => {
  let result = itemStore.items

  if (props.filterByType) {
    const types = Array.isArray(props.filterByType)
      ? props.filterByType.map(t => t.toLowerCase())
      : [props.filterByType.toLowerCase()]
    result = result.filter(i => types.includes(i.type?.toLowerCase() || ''))
  }

  if (props.filterByCategory) {
    const categories = Array.isArray(props.filterByCategory)
      ? props.filterByCategory
      : [props.filterByCategory]
    result = result.filter(i => categories.includes(i.category || 'Other'))
  }

  if (props.filterFn) {
    result = result.filter(props.filterFn)
  }

  return result
})

const selectItems = computed(() =>
  filteredItems.value.map(i => ({ label: i.name, value: i._id }))
)

const selected = computed({
  get: () => props.modelValue || undefined,
  set: (val: string | undefined) => emit('update:modelValue', val || null),
})

const handleCreate = async (name: string) => {
  if (creating.value) return
  creating.value = true
  try {
    const body: Record<string, any> = {
      name,
      category: props.createCategory,
    }
    if (props.createType) {
      body.type = props.createType
    }
    const newItem = await $fetch<Item>('/api/item/create', {
      method: 'POST',
      body,
    })
    itemStore.items.push(newItem)
    emit('update:modelValue', newItem._id)
    emit('created', newItem)
    toast.add({
      title: `Created "${newItem.name}"`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (error: any) {
    toast.add({
      title: 'Failed to create item',
      description: error?.data?.message || error?.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <USelectMenu
    v-model="selected"
    :items="selectItems"
    value-key="value"
    :placeholder="placeholder"
    :size="size as any"
    :disabled="disabled || creating"
    :loading="creating"
    searchable
    :create-item="allowCreate ? { position: 'bottom' } : false"
    @create="handleCreate"
  />
</template>
