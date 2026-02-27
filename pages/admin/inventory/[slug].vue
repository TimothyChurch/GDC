<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = route.params.slug as string

const categories = useInventoryCategories()
const category = computed(() => categories.value.find((c) => c.key === slug))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}
</script>

<template>
  <div v-if="category">
    <AdminPageHeader
      :title="category.label"
      :subtitle="category.description"
      :icon="category.icon"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory :category="category.category" />
  </div>
</template>
