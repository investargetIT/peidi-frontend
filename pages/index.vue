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
      if (res.code === 1000) {
        localStorage.setItem('user', JSON.stringify(res.result));
        navigateTo('/landing');
      }
    });
  }
  const handleAuthBtnClicked = () => {
    navigateTo(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${runtimeConfig.public.APP_ID}&redirect_uri=${runtimeConfig.public.REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`, { external: true });
    // navigateTo('/landing');
  };
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg.jpg" />
  <div style="position: absolute;top: 100px; width: 100%;">
    <van-button style="width: 50%;margin: 0 auto;" block type="primary" @click="handleAuthBtnClicked">授权</van-button>
  </div>
</template>
