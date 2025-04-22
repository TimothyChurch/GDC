<script setup lang="ts">
const route = useRoute();
const navList = [
  { label: "Home", link: "/", icon: "carbon:home" },
  { label: "Menu", link: "/menu", icon: "carbon:menu" },
  { label: "Bottles", link: "/bottles", icon: "carbon:wine-bottle" },
  { label: "Events", link: "/events", icon: "carbon:calendar" },
];
const mobileNav = ref([
  { label: "Home", link: "/", icon: "i-carbon-home" },
  { label: "Menu", link: "/menu", icon: "i-carbon-menu" },
  { label: "Bottles", link: "/bottles", icon: "i-carbon-wine-bottle" },
  { label: "Events", link: "/events", icon: "i-carbon-calendar" },
]);
</script>

<template>
  <div>
    <div class="max-w-screen grid grid-cols-2 lg:grid-cols-3 justify-around">
      <div
        name="Navbar"
        class="gap-5 font-bold text-2xl hidden md:flex justify-center"
      >
        <div v-for="i in navList" class="flex items-center">
          <NuxtLink :to="i.link">
            <h1 :class="i.link === route.path ? 'text' : 'shadow'">
              {{ i.label }}
            </h1>
          </NuxtLink>
        </div>
      </div>
      <div class="hidden lg:flex flex-col items-center">
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
    <div class="max-w-screen flex justify-around">
      <UDropdownMenu
        :items="mobileNav"
        :content="{
          align: 'center',
          side: 'bottom',
        }"
        :ui="{
          content: 'w-48',
        }"
      >
        <UButton icon="i-carbon-menu" class="h-12 w-12" variant="ghost" />
      </UDropdownMenu>
    </div>
  </div>
</template>
