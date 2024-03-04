<script setup>
</script>

<template>
  <van-button type="primary" @click="showToast('toast')">button</van-button>
  <van-button type="success" @click="showNotify('notify')">button</van-button>
  <lazy-van-button type="default">lazy button</lazy-van-button>
</template>

<style scoped>
.hello {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 3rem;
  padding: 2rem;
}
</style>
