// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,
  modules: ['@vant/nuxt'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      APP_ID: process.env.APP_ID,
      REDIRECT_URI: process.env.REDIRECT_URI,
    },
  },
})
