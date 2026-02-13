<script setup lang="ts">
const denied = ref(false);

const over21 = () => {
  ageVerified.value = true;
};

const under21 = () => {
  denied.value = true;
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="!ageVerified"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/95 backdrop-blur-sm"
    >
      <div class="bg-charcoal rounded-xl shadow-2xl border border-gold/20 max-w-md w-full mx-4 p-8 text-center">
        <img
          src="/images/Logo.png"
          alt="Galveston Distilling Company"
          class="h-24 mx-auto mb-6"
        />

        <template v-if="!denied">
          <h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-parchment mb-2">
            Welcome
          </h2>
          <p class="text-parchment/70 mb-8">
            You must be of legal drinking age to enter this site.
          </p>
          <p class="text-parchment text-lg font-semibold mb-6">
            Are you 21 or older?
          </p>
          <div class="flex justify-center gap-4">
            <button
              @click="over21"
              class="px-8 py-3 bg-gold text-espresso font-semibold rounded-md hover:bg-copper transition-colors duration-300"
            >
              Yes, I'm 21+
            </button>
            <button
              @click="under21"
              class="px-8 py-3 border border-parchment/30 text-parchment/70 font-semibold rounded-md hover:border-parchment/50 transition-colors duration-300"
            >
              No, I'm not
            </button>
          </div>
        </template>

        <template v-else>
          <h2 class="font-[Cormorant_Garamond] text-2xl font-bold text-parchment mb-4">
            Sorry
          </h2>
          <p class="text-parchment/70 mb-6">
            You must be 21 or older to access this site. Please visit again when you are of legal drinking age.
          </p>
          <p class="text-parchment/40 text-sm">
            Enjoy responsibly.
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>
