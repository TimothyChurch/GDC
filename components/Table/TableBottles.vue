<script setup>
const router = useRouter();

const bottleStore = useBottleStore();
const searchFilter = ref("");
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
      :global-filter="searchFilter"
      @select="onSelect"
    />
  </div>
</template>
