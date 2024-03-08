<script setup>
  useSeoMeta({
    title: '😙欢迎😈',
  });
  let user = localStorage.getItem('user');
  user = JSON.parse(user);
  console.log(user);
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg.jpg" />
  <div style="position: absolute;top: 50px; width: 100%;">
    <van-row justify="center">
      <van-image width="50" height="50" :src="user && user.headimgurl" />
    </van-row>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">欢迎你，{{ user && user.nickname }}</span></div>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">和小狗握爪，为它发声！</span></div>
    <van-row justify="center">
      <NuxtLink to="/register">
        <van-image width="100" src="/paw.png" style="background-color: orange;"/>
      </NuxtLink>
    </van-row>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">你是第{{ 999 }}位小狗守护者</span></div>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">击掌1800次，佩蒂星球将开启XXX公益项目</span></div>
  </div>
</template>
