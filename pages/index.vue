<script setup>
  const runtimeConfig = useRuntimeConfig();
  useSeoMeta({
    title: '😙授权😈',
  });
  const route = useRoute();
  if (route.query.code) {
    const formData = new FormData();
    formData.append('code', route.query.code);
    $fetch('https://api.investarget.com/service/weixin/pduserinfo', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      console.log(res);
      navigateTo('/landing');
    });
  }
  const handleAuthBtnClicked = () => {
    // navigateTo(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${runtimeConfig.public.APP_ID}&redirect_uri=${runtimeConfig.public.REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`, { external: true });
    navigateTo('/landing');
  };
</script>
<template>
  <div style="position: relative;padding-top: 100px;">
    <van-button style="width: 50%;margin: auto;" block type="primary" @click="handleAuthBtnClicked">授权</van-button>
  </div>
</template>

<style>
  body {
    width: 100vw;
    height: 100vh;
    background: url('/WechatIMG633.jpg') no-repeat center center fixed;
    background-size: cover;
  }
</style>
