import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

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
    "nuxt-meta-pixel",
  ],
  mongoose: {
    uri: process.env.NUXT_ENV_MONGODB_URI,
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
      metapixel: {
        default: { id: "1254208522870414" },
      },
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || "ws://localhost:1880/ws",
    },
  },
});
