<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const over21 = () => {
  ageVerified.value = true;
  emit("close", true);
};
const under21 = () => {
  console.log("You must be 21 or older to proceed.");
  navigateTo("https://disney.com", { external: true });
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #content>
      <div class="flex flex-col">
        <h1 class="text-3xl text-center py-5">Are you 21 or older?</h1>
        <div class="flex justify-center gap-5 py-5">
          <UButton @click="over21()" color="neutral" size="xl">Yes</UButton>
          <UButton @click="under21()" color="neutral" size="xl">No</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
