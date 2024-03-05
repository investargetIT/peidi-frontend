<script setup>
import { ref } from 'vue';

const tel = ref('');
const text = ref('');
const digit = ref('');
const number = ref('');
const password = ref('');
const groupChecked = ref([]);

const disableFetchSmsCode = ref(false);

async function send_sms_code_btn_clicked(event) {
  const req = await $fetch('https://api.investarget.com/service/sms', {
    method: 'POST',
    headers: {
      source: 99,
    },
    body: {
      mobile: tel.value,
    },
  });
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
  showNotify({ type: 'success', message: '验证码发送成功，请注意查收' });
}

async function onSubmit(values) {
  console.log('onSubmit', values);
  const smstoken = localStorage.getItem('smstoken');
  console.log('smstoken', smstoken);
  if (!smstoken) {
    showNotify('请先获取验证码');
    return;
  }
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
    showNotify('验证失败，请输入正确的验证码');
    return;
  }
  const req1 = await $fetch('http://39.107.14.53:8080/fusion/v1/datasheets/dstGNwPDWPRFW8doGl/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer usk0DNfyg8WewOTJvi9DWgz',
    },
    body: {
      'records': [{
        'fields': {
          'fldBNEfobFEGs': text.value, // 宠物姓名
          'fldlK5h1BJDB3': groupChecked.value, // 宠物类别
          'fld3Bqp5Pfkb6': tel.value, // 手机号码
        }
      }],
      'fieldKey': 'id',
    },
  });
  console.log(req1);
  if (req1.success) {
    showNotify({ type: 'success', message: '报名成功，感谢您的参与！' });
    setTimeout(() => window.open('https://taoquan.taobao.com/coupon/unify_apply.htm?sellerId=2206358157998&activityId=3b9dbf5e57224bf98944143cc244cb5c&toolName=shopCoupon'), 3000);
  }
}
</script>

<template>
  <div style="margin: 16px;">
    <van-row justify="center">
      <van-image width="100" height="100" fit="cover" position="center"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
    </van-row>
  </div>
  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-field v-model="text" name="name" label="宠物姓名" placeholder="请输入爱宠姓名" :rules="[{ required: true, message: '请输入爱宠姓名' }]" />
      <van-field name="checkboxGroup" label="宠物类别">
        <template #input>
          <van-checkbox-group v-model="groupChecked" direction="horizontal">
            <van-checkbox name="猫" shape="square">猫</van-checkbox>
            <van-checkbox name="狗" shape="square">狗</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>
      <van-field v-model="tel" name="tel" type="tel" label="手机号" placeholder="请输入手机号" :rules="[{ required: true, message: '请输入手机号' }]" />
      <van-field v-model="digit" name="sms_code" type="digit" label="验证码" placeholder="请输入验证码" :rules="[{ required: true, message: '请输入验证码' }]">
        <template #button>
          <van-button type="primary" size="small" :disabled="disableFetchSmsCode" @click="send_sms_code_btn_clicked">发送验证码</van-button>
        </template>
      </van-field>
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">提交</van-button>
    </div>
  </van-form>
</template>

<style>
body {
  background-color: #eff2f5;
}
</style>
