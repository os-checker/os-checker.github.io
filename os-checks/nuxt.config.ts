import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',
  app: { baseURL: '/ci/' },
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@primevue/nuxt-module"],
  primevue: {
    options: {
      theme: { preset: Aura }
    }
  },
  css: ["primeicons/primeicons.css", "~/assets/style.css"]
})