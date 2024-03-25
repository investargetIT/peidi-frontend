<script setup>
  import { initDingH5RemoteDebug } from "dingtalk-h5-remote-debug";
  import * as dd from 'dingtalk-jsapi'; // 此方式为整体加载，也可按需进行加载

  initDingH5RemoteDebug();
  const runtimeConfig = useRuntimeConfig();
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
        if (res.code === 1000) {
          localStorage.setItem('ddUserInfo', JSON.stringify(res.result));
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    onFail: function(err) {
      console.log(err);
    },
  });
</script>
