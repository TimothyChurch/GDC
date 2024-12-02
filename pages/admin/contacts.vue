<script setup>
definePageMeta({
  layout: "admin",
});
const contactStore = useContactStore();
</script>

<template>
  <div>
    <TableContacts />
  </div>
</template>
