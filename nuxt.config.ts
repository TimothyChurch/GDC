// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	modules: [
		'@nuxt/ui',
		'@nuxtjs/tailwindcss',
		'@vueuse/nuxt',
		'nuxt-mongoose',
		'@pinia/nuxt',
		'@nuxt/test-utils/module',
	],
	mongoose: {
		uri: 'mongodb+srv://TChurch:EricAvis1989@galvestondistillingco.pjkvjym.mongodb.net/',
		options: {},
		modelsDir: 'models',
		devtools: true,
	},
	devServer: {
		port: 3001,
	},
});
