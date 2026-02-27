import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-mongoose",
    "@pinia/nuxt",
    ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module' as const] : []),
    "@unlok-co/nuxt-stripe",
    "nuxt-meta-pixel",
    "@nuxtjs/sitemap",
    "@nuxt/image",
  ],
  site: {
    url: process.env.DOMAIN || 'https://galvestondistilling.com',
  },
  sitemap: {
    exclude: ['/admin/**', '/login', '/return'],
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      meta: [
        { property: 'og:site_name', content: 'Galveston Distilling Co' },
        { property: 'og:type', content: 'website' },
      ],
    },
  },
  mongoose: {
    uri: process.env.NUXT_ENV_MONGODB_URI || '',
    options: {},
    modelsDir: "models",
    devtools: process.env.NODE_ENV !== 'production',
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
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },
    '/admin/**': { ssr: false },
    '/api/bottle/public': { swr: 300 },
    '/api/cocktail/public': { swr: 300 },
    '/api/event/upcoming': { swr: 60 },
  },
  runtimeConfig: {
    // Server — Nuxt auto-maps NUXT_SESSION_SECRET, NUXT_DOMAIN, etc. at runtime
    sessionSecret: '',
    domain: '',
    stripePriceId: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    stripe: {
      key: '',
      options: {},
    },
    // Client — Nuxt auto-maps NUXT_PUBLIC_* at runtime
    public: {
      stripe: {
        key: '',
        options: {},
      },
      metapixel: {
        default: { id: "1254208522870414" },
      },
      wsUrl: "ws://localhost:1880/ws",
    },
  },
});
