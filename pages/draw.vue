<script>
export default {
  data () {
    return {
      blocks: [{ padding: '13px', background: '#617df2' }],
      prizes: [
        { fonts: [
          { text: '爵宴鸭肉干', top: '10%', fontSize: 16 },
          { text: '100g1包', top: '36%', fontSize: 14 },
        ], background: '#e9e8fe' },
        { fonts: [
          { text: '爵宴风干粮', top: '10%', fontSize: 16 },
          { text: '50g1包', top: '36%', fontSize: 14 },
        ], background: '#b8c5f2' },
        { fonts: [
          { text: '爵宴风干粮', top: '10%', fontSize: 16 },
          { text: '50g1包', top: '36%', fontSize: 14 },
        ], background: '#e9e8fe' },
        { fonts: [
          { text: '爵宴鸭肉干', top: '10%', fontSize: 16 },
          { text: '100g1包', top: '36%', fontSize: 14 },
        ], background: '#b8c5f2' },
        { fonts: [
          { text: '爵宴罐头', top: '10%', fontSize: 16 },
          { text: '130g1个', top: '36%', fontSize: 14 },
        ], background: '#e9e8fe' },
        { fonts: [
          { text: '爵宴风干粮', top: '10%', fontSize: 16 },
          { text: '50g1包', top: '36%', fontSize: 14 },
        ], background: '#b8c5f2' },
        { fonts: [
          { text: '爵宴风干粮', top: '10%', fontSize: 16 },
          { text: '50g1包', top: '36%', fontSize: 14 },
        ], background: '#e9e8fe' },
        { fonts: [
          { text: '爵宴罐头', top: '10%', fontSize: 16 },
          { text: '130g1个', top: '36%', fontSize: 14 },
        ], background: '#b8c5f2' },
      ],
      buttons: [{
        radius: '35%',
        background: '#8a9bf3',
        pointer: true,
        fonts: [{ text: '开始', top: '-10px' }],
      }],
      result: null,
      date: null,
    };
  },
  mounted: function() {
    let draw = localStorage.getItem('draw');
    console.log('draw', draw);
    if (!draw) return;
    draw = JSON.parse(draw);
    this.result = draw.result;
    this.date = draw.date;
  },
  methods: {
    // 点击抽奖按钮会触发star回调
    startCallback () {
      if (!!this.result) {
        showToast('感谢您参与本次抽奖活动');
        return;
      }
      // 调用抽奖组件的play方法开始游戏
      this.$refs.myLucky.play();
      // 模拟调用接口异步抽奖
      setTimeout(() => {
        // 假设后端返回的中奖索引是0
        const index = this.getIndexFromRandomNum();
        // 调用stop停止旋转并传递中奖索引
        this.$refs.myLucky.stop(index);
      }, 3000);
    },
    // 抽奖结束会触发end回调
    endCallback (prize) {
      const drawResult = prize.fonts.map(m => m.text).join('');
      const date = new Date().toLocaleDateString();
      const draw = {
        result: drawResult,
        date,
      }
      localStorage.setItem('draw', JSON.stringify(draw));
      this.result = drawResult;
      this.date = date;

      // 更新记录，增加奖品作为用户标签
      let record = localStorage.getItem('record');
      if (!record) return;
      record = JSON.parse(record);
      const runtimeConfig = useRuntimeConfig();
      $fetch(runtimeConfig.public.APITABLE_URL + '/fusion/v1/datasheets/dstfD2Z1kElRo2vhnf/records', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runtimeConfig.public.APITABLE_API_TOKEN}`,
        },
        body: {
          'records': [{
            'recordId': record.recordId,
            'fields': {
              '用户标签': ['京宠联萌派对&北京', drawResult], // 用户标签
            }
          }],
        },
      });
    },
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getIndexFromRandomNum() {
      const num = this.getRandomInt(1, 100);
      if (num == 1) {
        return 0;
      }
      if (num >= 2 && num <= 25) {
        return 1;
      }
      if (num >= 26 && num <= 49) {
        return 2;
      }
      if (num == 50) {
        return 3;
      }
      if (num == 51) {
        return 4;
      }
      if (num >= 52 && num <= 75) {
        return 5;
      }
      if (num >= 76 && num <= 99) {
        return 6;
      }
      if (num == 100) {
        return 7;
      }
    },
  }
}
</script>

<template>
  <van-image style="position: relative;" width="100vw" src="/bg_blur2.jpg" />
  <div style="position: absolute;top: 50px; width: 100%;">
    <div style="width: 80%;margin:auto;text-align: center;color: white;"><span style="background-color: #617df2;">感谢您参与发声公益活动！<br>佩蒂邀请您参与抽奖活动！</span></div>
    <van-row justify="center" style="margin: 20px 0;">
      <LuckyWheel
        ref="myLucky"
        width="300px"
        height="300px"
        :prizes="prizes"
        :blocks="blocks"
        :buttons="buttons"
        @start="startCallback"
        @end="endCallback"
      />
    </van-row>
    <div v-if="!!result" style="width: 80%;margin:20px auto;padding: 6px;color: white;background-color: #617df2;font-size: 14px;">
      <div>恭喜您抽中<span style="font-size: 16px;font-weight: bold;">{{ result }}</span>！请前往<b>D.A.O coffee•西西里村咖啡店</b>领取</div>
      <div style="font-size: 14px;margin: 6px 0;">地址:东枫国际体育园内(距地铁10号中心结湖站C口(东南口)步行560m)</div>
      <div style="font-size: 14px;">ps:奖品仅限当天({{ date }})领取，请及时前往</div>
    </div>
  </div>
</template>
