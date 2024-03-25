// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  pages: true,
  modules: ['@vant/nuxt'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      APP_ID: process.env.APP_ID,
      REDIRECT_URI: process.env.REDIRECT_URI,
      APITABLE_URL: process.env.APITABLE_URL,
      APITABLE_API_TOKEN: process.env.APITABLE_API_TOKEN,
      DINGTALK_CORP_ID: process.env.DINGTALK_CORP_ID,
      API_BASE_URL: process.env.API_BASE_URL,
      INVESTARGET_API_BASE_URL: process.env.INVESTARGET_API_BASE_URL,
    },
  },
})
