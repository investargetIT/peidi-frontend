<script setup>
  useSeoMeta({
    title: '😙列表😈',
  });
  let user = localStorage.getItem('user');
  user = JSON.parse(user);
  console.log(user);
</script>

<template>
  <div style="position: relative;padding-top: 100px;">
    <van-row justify="center">
      <van-image
        width="50"
        height="50"
        :src="user.headimgurl"
      />
    </van-row>
    <van-row justify="center">
      <div>欢迎你，{{ user.nickname }}</div>
    </van-row>

    <NuxtLink to="/register">
      <van-button style="width: 50%;margin: auto;" block type="primary">点击按钮，为宠物发声！</van-button>
    </NuxtLink>
  </div>
</template>

<style scoped>
  
</style>
