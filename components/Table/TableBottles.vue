<script setup>
const router = useRouter();

const bottleStore = useBottleStore();
const searchFilter = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
// Modal component info
import { ModalBottle } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalBottle);
const newBottle = () => {
  bottleStore.resetBottle();
  openModal();
};
const openModal = async () => await modal.open();
//
const onSelect = (row) => {
  // bottleStore.selectBottle(row.original._id);
  // openModal();
  router.push('/admin/bottles/' + row.original._id);
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between">
      <UInput
        v-model="searchFilter"
        placeholder="Search cocktails"
        class="mb-4"
      />
      <UButton
        icon="i-heroicons-plus-circle"
        size="xl"
        @click="newBottle"
        variant="ghost"
        >Add Bottle</UButton
      >
    </div>
    <UTable
      :data="bottleStore.bottles"
      v-model:global-filter="searchFilter"
      v-model:pagination="pagination"
      :loading="bottleStore.loading"
      :empty="{ icon: 'i-lucide-wine', label: 'No bottles found' }"
      @select="onSelect"
    />
    <div class="flex justify-between items-center mt-2">
      <UFormGroup label="Results per Page">
        <USelect
          :options="[5, 10, 20, 100]"
          :model-value="pagination.pageSize"
          @update:model-value="pagination = { ...pagination, pageSize: Number($event), pageIndex: 0 }" />
      </UFormGroup>
      <UPagination
        :model-value="pagination.pageIndex + 1"
        @update:model-value="pagination = { ...pagination, pageIndex: $event - 1 }"
        :page-count="pagination.pageSize"
        :total="bottleStore.bottles.length" />
    </div>
  </div>
</template>
