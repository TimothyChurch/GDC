<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
const user = useCookie("user");
const set = () => {
  user.value = { name: "testing 123" };
};
</script>

<template>
  <div>
    {{ user }}
    {{ user.name }}
    <button @click="set()">test</button>
    <NuxtPage />
  </div>
</template>
