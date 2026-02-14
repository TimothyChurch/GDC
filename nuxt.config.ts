import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-mongoose",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
    "@unlok-co/nuxt-stripe",
    "nuxt-meta-pixel",
  ],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'og:site_name', content: 'Galveston Distilling Co' },
        { name: 'og:type', content: 'website' },
      ],
    },
  },
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
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  },
  runtimeConfig: {
    // Server
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
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
