import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-31",
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-mongoose",
    "@pinia/nuxt",
    ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module' as const] : []),
    "nuxt-meta-pixel",
    "@nuxtjs/sitemap",
    "@nuxt/image",
  ],
  image: {
    quality: 80,
    format: ['webp', 'jpg'],
  },
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
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    },
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
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://www.facebook.com; frame-src https://www.facebook.com; connect-src 'self' https://*.facebook.com https://*.facebook.net",
      },
    },
    '/': { prerender: true },
    '/about': { prerender: true },
    '/privacy': { prerender: true },
    '/contact': { prerender: true },
    '/api/**': {
      headers: { 'Cache-Control': 'private, no-store' },
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
    squareAccessToken: '',
    squareWebhookSignatureKey: '',
    squareEnvironment: 'sandbox',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    // Client — Nuxt auto-maps NUXT_PUBLIC_* at runtime
    public: {
      squareLocationId: '',
      metapixel: {
        default: { id: "1254208522870414" },
      },
      wsUrl: "",
    },
  },
});
