import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-mongoose",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
    "@unlok-co/nuxt-stripe",
  ],
  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: "models",
    devtools: true,
  },
  devServer: {
    port: 3001,
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    // Server
    stripe: {
      key: process.env.STRIPE_SECRET_KEY,
      options: {},
    },
    // Client
    public: {
      stripe: {
        key: process.env.STRIPE_PUBLIC_KEY,
        options: {},
      },
    },
  },
});
