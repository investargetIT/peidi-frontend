<script setup>
  const runtimeConfig = useRuntimeConfig();
  const checkWeChatUnionID = (unionid) => {
    const filterByFormula = `{fldZzdmUhkpWQ}="${unionid}"`;
    $fetch(runtimeConfig.public.APITABLE_URL + `/fusion/v1/datasheets/dstGNwPDWPRFW8doGl/records?filterByFormula=${encodeURIComponent(filterByFormula)}`, {
      headers: {
        'Authorization': `Bearer ${runtimeConfig.public.APITABLE_API_TOKEN}`,
      },
    }).then((res) => {
      if (res.success) {
        if (res.data.total > 0) {
          navigateTo('/success');
        } else {
          navigateTo('/landing');
        }
      }
    });
  };
  let user = localStorage.getItem('user');
  if (user) {
    user = JSON.parse(user);
    await checkWeChatUnionID(user.unionid);
  }
  const route = useRoute();
  if (route.query.code) {
    showLoadingToast({
      duration: 0,
      message: '加载中...',
      forbidClick: true,
    });
    const formData = new FormData();
    formData.append('code', route.query.code);
    $fetch(runtimeConfig.public.INVESTARGET_API_BASE_URL + '/service/weixin/pduserinfo', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      closeToast();
      console.log(res);
      if (res.code === 1000) {
        localStorage.setItem('user', JSON.stringify(res.result));
        checkWeChatUnionID(res.result.unionid);
      }
    });
  }
  const handleAuthBtnClicked = () => {
    navigateTo(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${runtimeConfig.public.APP_ID}&redirect_uri=${runtimeConfig.public.REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`, { external: true });
  };
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg.jpg" />
  <div style="position: absolute;top: 300px; width: 100%;">
    <div style="width: 90%;margin:20px auto;background-color: rgba(255, 255, 255, .8);padding: 6px;border-radius: 4px;">
      <div>佩蒂智创宠物科技有限公司申请获得您的公开信息（昵称、头像等）用于以下作用：</div>
      <div style="color: gray;font-size: 14px;padding-left: 4px;">
        <div>• 公益活动展示</div>
        <div>• 领取优惠券</div>
        <div>• 添加企业微信</div>
      </div>
    </div>
    <van-button style="width: 50%;margin: 0 auto;" block color="orange" @click="handleAuthBtnClicked">立即授权</van-button>
  </div>
</template>
