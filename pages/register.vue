<script setup>
import { ref } from 'vue';
import { areaList } from '@vant/area-data';

// useSeoMeta({
//   title: '😙发声（待修改）😈',
// });

const runtimeConfig = useRuntimeConfig();

const tel = ref('');
const text = ref('');
const digit = ref('');
const number = ref('');
const password = ref('');
const groupChecked = ref([]);

const city = ref('');
const show = ref(false);
const onFinish = ({ selectedOptions }) => {
  show.value = false;
  city.value = selectedOptions.map((option) => option.text).join('/');
};

const disableFetchSmsCode = ref(false);
const countdown = ref(60);

let user = localStorage.getItem('user');
user = JSON.parse(user);

const fetchSMSCodeCountdown = () => {
  const countdownInterval = setInterval(() => {
    if (disableFetchSmsCode.value) {
      countdown.value--;
      if (countdown.value <= 0) {
        disableFetchSmsCode.value = false;
        countdown.value = 60;
        countdownInterval && clearInterval(countdownInterval);
      }
    }
  }, 1000);
}

async function send_sms_code_btn_clicked(event) {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  const req = await $fetch('https://api.investarget.com/service/sms', {
    method: 'POST',
    headers: {
      source: 99,
    },
    body: {
      mobile: tel.value,
    },
  });
  closeToast();
  console.log(req);
  const { code, result } = req;
  if (code != 1000) {
    return;
  }
  const { status, smstoken } = result;
  if (status != 'success') {
    return;
  }
  localStorage.setItem('smstoken', smstoken);
  disableFetchSmsCode.value = true;
  fetchSMSCodeCountdown();
  showToast('验证码发送成功，请注意查收');
}

async function onSubmit(values) {

  console.log('onSubmit', values);
  const smstoken = localStorage.getItem('smstoken');
  console.log('smstoken', smstoken);
  if (!smstoken) {
    showToast('请先获取验证码');
    return;
  }
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  const req = await $fetch('https://api.investarget.com/user/checkSms', {
    method: 'POST',
    headers: {
      source: 99,
    },
    body: {
      mobile: tel.value,
      mobilecode: digit.value,
      mobilecodetoken: smstoken,
    },
  });
  console.log(req);
  const { code, result } = req;
  if (code != 1000) {
    closeToast();
    showToast('验证失败，请输入正确的验证码');
    return;
  }
  
  const req1 = await $fetch(runtimeConfig.public.APITABLE_URL + '/fusion/v1/datasheets/dstGNwPDWPRFW8doGl/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${runtimeConfig.public.APITABLE_API_TOKEN}`,
    },
    body: {
      'records': [{
        'fields': {
          'fldBNEfobFEGs': text.value, // 宠物姓名
          'fldlK5h1BJDB3': groupChecked.value, // 宠物类别
          'fld3Bqp5Pfkb6': tel.value, // 手机号码
          'fldE0DSztgMVz': ['深宠展2024(3.14-3.17)'], // 用户标签
          'fldeuBBZ4OyS1': city.value, // 所在城市
          'fldBcjNrgEoh1': user && user.nickname, // 微信昵称
          'fldDW1myivghv': user && user.headimgurl, // 微信头像
          'fldZzdmUhkpWQ': user && user.unionid, // 微信unionid
        }
      }],
      'fieldKey': 'id',
    },
  });
  console.log(req1);
  if (req1.success) {
    closeToast();
    navigateTo('/success');
  }
  closeToast();
}
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg_blur.jpg" />
  <div style="position: absolute;top: 50px; width: 100%;">
    <van-row justify="center">
      <van-image width="50" height="50" :src="user && user.headimgurl" />
    </van-row>
    <div style="width: 80%;margin:20px auto;text-align: center;">{{ user && user.nickname }}</div>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="text" name="name" label="宠物姓名" placeholder="请输入爱宠姓名"
          :rules="[{ required: true, message: '请输入爱宠姓名' }]" />
        <van-field name="checkboxGroup" label="宠物类别" :rules="[{ required: true, message: '请选择宠物类别' }]">
          <template #input>
            <van-checkbox-group v-model="groupChecked" direction="horizontal">
              <van-checkbox name="猫" shape="square">猫</van-checkbox>
              <van-checkbox name="狗" shape="square">狗</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>

        <van-field v-model="city" is-link readonly label="所在城市" placeholder="请选择所在城市" :rules="[{ required: true, message: '请选择所在城市' }]" @click="show = true" />
        <van-popup v-model:show="show" round position="bottom">
          <van-area title="所在城市" :area-list="areaList" :columns-num="2" @cancel="show = false" @confirm="onFinish" />
        </van-popup>

        <van-field v-model="tel" name="tel" type="tel" label="手机号" placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]" />
        <van-field v-model="digit" name="sms_code" type="digit" label="验证码" placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]">
          <template #button>
            <van-button type="primary" size="small" :disabled="disableFetchSmsCode"
              @click="send_sms_code_btn_clicked">{{ !disableFetchSmsCode ? '发送验证码' : `${countdown}秒后重试`}}</van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>
