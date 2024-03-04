<script setup>
import { ref } from 'vue';

const tel = ref('');
const text = ref('');
const digit = ref('');
const number = ref('');
const password = ref('');

const disableFetchSmsCode = ref(false);

function send_sms_code_btn_clicked(event) {
  console.log('send_sms_code_btn_clicked', event);
  console.log('tel', tel.value);
}

function onSubmit(values) {
  console.log('onSubmit', values);
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
