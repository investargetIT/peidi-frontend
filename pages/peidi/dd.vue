<script setup>
  import { initDingH5RemoteDebug } from "dingtalk-h5-remote-debug";
  import * as dd from 'dingtalk-jsapi'; // 此方式为整体加载，也可按需进行加载

  initDingH5RemoteDebug();
  const runtimeConfig = useRuntimeConfig();
  const ddEmail = ref('');

  let redirect_uri = runtimeConfig.public.APITABLE_URL;
  const route = useRoute();
  if (route.query.redirect_uri) {
    redirect_uri += decodeURIComponent(route.query.redirect_uri);
    console.log('redirect_uri', redirect_uri);
  }

  dd.runtime.permission.requestAuthCode({
    corpId: runtimeConfig.public.DINGTALK_CORP_ID, // 企业id
    onSuccess: function (info) {
      console.log(info);
      const { code } = info; // 通过该免登授权码可以获取用户身份
      $fetch(runtimeConfig.public.API_BASE_URL + '/service/dinguserinfo', {
        method: 'POST',
        body: { code },
      }).then((res) => {
        console.log(res);
        if (res.code === 1000 && res.result.errcode === 0) {
          const { result: ddUserInfo } = res.result;
          console.log('ddUserInfo', ddUserInfo);
          const { org_email } = ddUserInfo;
          ddEmail.value = org_email;
          if (ddEmail.value) {
            console.log('ddEmail', ddEmail.value);
            return $fetch(runtimeConfig.public.APITABLE_URL + '/api/v1/signIn', {
              method: 'POST',
              body: {
                username: ddEmail.value,
                credential: runtimeConfig.public.APITABLE_DEFAULT_PASSWORD,
                type: 'password',
              },
            });
          }
        }
      }).then(res => {
        if (res) {
          console.log('signIn', res);
          if (res.success) {
            return navigateTo(redirect_uri, { external: true });
          } else {
            return $fetch(runtimeConfig.public.APITABLE_URL + '/api/v1/register', {
              method: 'POST',
              body: {
                username: ddEmail.value,
                credential: runtimeConfig.public.APITABLE_DEFAULT_PASSWORD,
              },
            });
          }
        }
      }).then(res => {
        console.log('register', res);
        if (res && res.success) {
          return navigateTo(redirect_uri, { external: true });
        }
      });
    },
    onFail: function(err) {
      console.error(err);
    },
  });
</script>

<template>
  <h1 v-if="ddEmail === undefined">邮箱不存在，请联系系统管理员</h1>
</template>
