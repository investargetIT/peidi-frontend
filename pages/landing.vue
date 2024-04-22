<script setup>
  // useSeoMeta({
  //   title: '😙欢迎（待修改）😈',
  // });
  let user = localStorage.getItem('user');
  user = JSON.parse(user);
  const runtimeConfig = useRuntimeConfig();
  const list = ref([]);
  const total = ref(0);
  $fetch(runtimeConfig.public.APITABLE_URL + `/fusion/v1/datasheets/dstGNwPDWPRFW8doGl/records?fields=${encodeURIComponent(['fldBcjNrgEoh1', 'fldDW1myivghv'])}&fieldKey=id`, {
    headers: {
      'Authorization': `Bearer ${runtimeConfig.public.APITABLE_API_TOKEN}`,
    },
  }).then((res) => {
    console.log(res);
    list.value = res.data.records.filter(f => f.fields.fldDW1myivghv);
    total.value = res.data.total;
  });
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg.jpg" />
  <div style="position: absolute;top: 0; width: 100%;height: 280px;overflow: hidden;">
    <div style="position: absolute;right: 0;" :class="`${list.length > 0 && 'list'}`">
      <div v-for="item in list" style="text-align: right;">
        <div style="margin: 2px;background-color: rgba(0, 0, 0, .5);display: inline-block;padding: 4px 10px;border-radius: 14px;">
          <van-image round style="vertical-align: middle;margin-right: 4px;" width="20" :src="item.fields['fldDW1myivghv']['text']" />
          <span style="color: white;vertical-align: middle;font-size: 12px;">{{ item.fields['fldBcjNrgEoh1'] }}</span>
        </div>
      </div>
    </div>
  </div>
  <div style="position: absolute;top: 280px; width: 100%;">
    <van-row justify="center">
      <van-image width="50" height="50" :src="user && user.headimgurl" />
    </van-row>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">欢迎你，{{ user && user.nickname }}</span></div>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">和小狗握爪，为它发声！</span></div>
    <van-row justify="center">
      <NuxtLink to="/register">
        <van-image width="340" src="/paw.png" />
      </NuxtLink>
    </van-row>
    <div style="width: 80%;margin:20px auto;text-align: center;color: white;"><span style="background-color: orange;">你是第{{ total + 1 }}位小狗守护者</span></div>
  </div>
</template>

<style scoped>
  .list {
    top: 280px;
    animation: move 60s linear infinite;
  }
  @keyframes move {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(calc(-100% - 280px));
    }
  }
</style>
