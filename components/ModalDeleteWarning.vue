<script setup>
const isOpen = ref(deleteModal);
</script>

<template>
  <div>
    <UModal v-model="isOpen">
      <div class="flex flex-col justify-center p-4">
        <h1 class="self-center pb-4">
          Are you sure you want to delete this item?
        </h1>
        <div class="flex gap-3 justify-around">
          <UButton @click="deleteItem">Delete</UButton>
          <UButton @click="toggleDeleteModal()">Cancel</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>
