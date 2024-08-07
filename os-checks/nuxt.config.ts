import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-08-06',
  app: {
    // baseURL: '/ci/',
    head: { link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }] }
  },
  devtools: {
    enabled: true,
    timeline: { enabled: true, },
  },
  modules: ["@primevue/nuxt-module"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.my-app-dark' },
      },
    }
  },
  css: [
    "primeicons/primeicons.css",
    "~/assets/style.css",
    "highlight.js/styles/base16/onedark.min.css"
  ],
  devServer: { host: '0.0.0.0', port: 3001 },
})
