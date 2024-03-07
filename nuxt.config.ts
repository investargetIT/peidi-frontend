// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,
  modules: ['@vant/nuxt'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      APP_ID: process.env.APP_ID,
      REDIRECT_URI: process.env.REDIRECT_URI,
      APITABLE_URL: process.env.APITABLE_URL,
      APITABLE_API_TOKEN: process.env.APITABLE_API_TOKEN,
    },
  },
})
