<script setup lang="ts">
const route = useRoute();
const mobileOpen = ref(false);

const navList = [
  { label: "Home", link: "/", icon: "carbon:home" },
  { label: "Menu", link: "/menu", icon: "carbon:restaurant" },
  { label: "Bottles", link: "/bottles", icon: "carbon:wine-bottle" },
  { label: "Events", link: "/events", icon: "carbon:calendar" },
];

const isActive = (link: string) => {
  if (link === "/") return route.path === "/";
  return route.path.startsWith(link);
};
</script>

<template>
  <header class="sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-gold/20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Desktop nav -->
      <div class="hidden lg:grid grid-cols-3 items-center py-2">
        <nav class="flex gap-6">
          <NuxtLink
            v-for="item in navList"
            :key="item.link"
            :to="item.link"
            class="text-sm font-semibold tracking-wide uppercase transition-colors duration-300"
            :class="isActive(item.link) ? 'text-gold' : 'text-parchment/70 hover:text-gold'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex justify-center">
          <NuxtLink to="/">
            <img
              src="/images/Logo.png"
              alt="Galveston Distilling Company"
              class="h-20 px-2"
            />
          </NuxtLink>
        </div>

        <div class="flex items-center gap-4 justify-end text-xl">
          <a @click="toggleDark()" class="text-parchment/70 hover:text-gold transition-colors cursor-pointer">
            <Icon :name="isDark ? 'carbon:moon' : 'carbon:sun'" />
          </a>
          <NuxtLink to="/admin" class="text-parchment/70 hover:text-gold transition-colors">
            <Icon name="carbon:user" />
          </NuxtLink>
        </div>
      </div>

      <!-- Mobile nav bar -->
      <div class="flex items-center justify-between py-3 lg:hidden">
        <NuxtLink to="/">
          <img
            src="/images/Logo.png"
            alt="Galveston Distilling Company"
            class="h-14"
          />
        </NuxtLink>
        <button
          @click="mobileOpen = true"
          class="text-parchment/80 hover:text-gold transition-colors bg-transparent p-2"
          aria-label="Open menu"
        >
          <Icon name="carbon:menu" class="text-2xl" />
        </button>
      </div>
    </div>

    <!-- Mobile slide-out drawer -->
    <USlideover v-model:open="mobileOpen" side="right" class="lg:hidden">
      <template #content>
        <div class="flex flex-col h-full bg-charcoal p-6">
          <div class="flex items-center justify-between mb-8">
            <img
              src="/images/Logo.png"
              alt="Galveston Distilling Company"
              class="h-16"
            />
            <button
              @click="mobileOpen = false"
              class="text-parchment/60 hover:text-gold transition-colors bg-transparent p-1"
              aria-label="Close menu"
            >
              <Icon name="carbon:close" class="text-2xl" />
            </button>
          </div>

          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in navList"
              :key="item.link"
              :to="item.link"
              @click="mobileOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
              :class="isActive(item.link) ? 'text-gold bg-gold/10' : 'text-parchment/80 hover:text-gold hover:bg-gold/5'"
            >
              <Icon :name="item.icon" class="text-xl" />
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="border-t border-parchment/10 mt-6 pt-6 flex flex-col gap-1">
            <NuxtLink
              to="/admin"
              @click="mobileOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-parchment/80 hover:text-gold hover:bg-gold/5 transition-colors"
            >
              <Icon name="carbon:user" class="text-xl" />
              <span class="text-lg font-semibold">Admin</span>
            </NuxtLink>
            <button
              @click="toggleDark(); mobileOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-parchment/80 hover:text-gold hover:bg-gold/5 transition-colors bg-transparent w-full text-left"
            >
              <Icon :name="isDark ? 'carbon:moon' : 'carbon:sun'" class="text-xl" />
              <span class="text-lg font-semibold">{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
            </button>
          </div>
        </div>
      </template>
    </USlideover>
  </header>
</template>
