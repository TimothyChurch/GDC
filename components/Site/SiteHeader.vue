<script setup>
const route = useRoute();
const navList = [
  { name: "Home", link: "/" },
  { name: "Menu", link: "/menu" },
  { name: "Bottles", link: "/bottles" },
  { name: "Events", link: "/events" },
];
</script>

<template>
  <div>
    <div class="max-w-screen grid grid-cols-3 justify-around">
      <div
        name="Navbar"
        class="gap-5 font-bold text-2xl hidden md:flex justify-center"
      >
        <div v-for="i in navList" class="flex items-center">
          <NuxtLink :to="i.link">
            <h1 :class="i.link === route.path ? 'text' : 'shadow'">
              {{ i.name }}
            </h1>
          </NuxtLink>
        </div>
      </div>
      <div class="flex flex-col items-center">
        <img
          src="/images/Logo.png"
          alt="Galveston Distilling Company"
          class="h-48 px-2"
        />
      </div>
      <div class="text-2xl my-auto mx-5 hidden md:flex gap-3 justify-end">
        <a @click="toggleDark()">
          <Icon :name="isDark ? 'carbon:moon' : 'carbon:sun'" />
        </a>

        <NuxtLink to="/admin">
          <Icon name="carbon:user" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
