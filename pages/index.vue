<script setup>
  const runtimeConfig = useRuntimeConfig();
  useSeoMeta({
    title: '😙授权😈',
  });
  const route = useRoute();
  console.log(route.query.code);
  if (route.query.code) {
    // TODO: fetch user info
    navigateTo('/landing');
  }
  const handleAuthBtnClicked = () => {
    // navigateTo(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${runtimeConfig.public.APP_ID}&redirect_uri=${runtimeConfig.public.REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`, { external: true });
    navigateTo('/landing');
  };
</script>
<template>
  <div style="position: relative;">
    <van-image style="position: absolute;left: 0;top: 0;" width="100vw" height="100vh" fit="cover" position="center" src="/WechatIMG633.jpg" />
    <div style="position: relative;padding-top: 100px;">
      <van-button style="width: 50%;margin: auto;" block type="primary" @click="handleAuthBtnClicked">授权</van-button>
    </div>
  </div>
</template>

<style scoped>
body {
  /* The image used */
  background-image: url("/WechatIMG633.jpg");

  /* Full height */
  height: 100%;

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
