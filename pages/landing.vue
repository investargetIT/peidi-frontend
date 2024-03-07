<script setup>
  useSeoMeta({
    title: '😙列表😈',
  });
</script>
<template>
  <div style="position: relative;">
    <van-image style="position: absolute;left: 0;top: 0;" width="100vw" height="100vh" fit="cover" position="center" src="/WechatIMG633.jpg" />
    <div style="position: relative;padding-top: 100px;">
      <NuxtLink to="/register"><van-button style="width: 50%;margin: auto;" block type="primary">点击按钮，为宠物发声！</van-button></NuxtLink>
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
