<script setup>
import { ModalAge } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalAge);
onMounted(() => {
  console.log(ageVerified);
  if (!ageVerified.value) {
    console.log("Age verification required");
    modal.open();
  }
});
</script>

<template>
  <div
    class="h-screen w-screen max-h-screen max-w-screen flex flex-col overflow-clip"
  >
    <SiteHeader />
    <slot />
    <SiteFooter />
  </div>
</template>
