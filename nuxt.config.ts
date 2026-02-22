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
    uri: process.env.NUXT_ENV_MONGODB_URI,
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
  },
  runtimeConfig: {
    // Server
    sessionSecret: process.env.SESSION_SECRET,
    domain: process.env.DOMAIN,
    stripePriceId: process.env.STRIPE_PRICE_ID,
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
