import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-08-28',
  app: {
    // baseURL: '/os-checker/',
    head: { link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }] }
  },
  devtools: {
    enabled: true,
    timeline: { enabled: true, },
  },
  modules: ["@primevue/nuxt-module", "@pinia/nuxt"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.my-app-dark' },
      },
    }
  },
  css: ["primeicons/primeicons.css", "~/assets/style.css", "~/assets/highlightjs.scss"],
  devServer: { host: '0.0.0.0', port: 3001 },
  runtimeConfig: {
    public: {
      debug: process.env.DEBUG ? true : false,
    }
  }
})
