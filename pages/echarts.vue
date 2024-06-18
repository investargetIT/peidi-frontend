<template>
  <van-row>
    <div id="myChart" style="width: 100vw;height: 100vh"></div>
  </van-row>
</template>

<script>
import echarts from "echarts";
import china from "echarts/map/json/china.json";

export default {
  mounted() {
    const runtimeConfig = useRuntimeConfig();
    $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
      },
      body: {
        name: 'GetOrderCountByCity',
        params: ["2024-01-01", "2024-01-31"]
      },
    }).then((res) => {
      if (res.code === 1000) {
        const data = [];
        res.result.forEach(element => {
          data.push({
            name: element[0],
            value: element[1],
          });
        });
        this.drawEcharts(data.slice(0, 10));
      }
    });
  },
  methods: {
    drawEcharts(data) {
      echarts.registerMap('china', china);
      const myChart = echarts.init(document.getElementById('myChart'));
      var option = {
        title: {
          text: '《发货地图表》TOP10',
          // subtext: 'Data from Wikipedia',
          // sublink:
          //   'http://zh.wikipedia.org/wiki/%E9%A6%99%E6%B8%AF%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83#cite_note-12'
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{b}<br/>{c}',
        },
        // toolbox: {
        //   show: true,
        //   orient: 'vertical',
        //   left: 'right',
        //   top: 'center',
        //   feature: {
        //     dataView: { readOnly: false },
        //     restore: {},
        //     saveAsImage: {}
        //   }
        // },
        visualMap: {
          min: data[data.length -1]['value'],
          max: data[0]['value'],
          text: ['高', '低'],
          realtime: false,
          calculable: true,
          inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
          }
        },
        series: [
          {
            name: '发货数据',
            type: 'map',
            map: 'china',
            // label: {
            //   show: true
            // },
            data,
            nameMap: {
              '广东': '广东省',
              '江苏': '江苏省',
              '上海': '上海市',
              '浙江': '浙江省',
              '北京': '北京市',
              '四川': '四川省',
              '山东': '山东省',
              '湖北': '湖北省',
              '安徽': '安徽省',
              '河南': '河南省',
              '湖南': '湖南省',
              '辽宁': '辽宁省',
              '河北': '河北省',
              '福建': '福建省',
              '重庆': '重庆市',
              '陕西': '陕西省',
              '天津': '天津市',
              '江西': '江西省',
              '广西': '广西壮族自治区',
              '黑龙江': '黑龙江省',
              '云南': '云南省',
              '山西': '山西省',
              '贵州': '贵州省',
              '吉林': '吉林省',
              '内蒙古': '内蒙古自治区',
              '海南': '海南省',
              '甘肃': '甘肃省',
              '宁夏': '宁夏回族自治区',
              '青海': '青海省',
              '新疆': '新疆维吾尔自治区',
              '西藏': '西藏自治区',
            }
          }
        ]
      };
      myChart.setOption(option);
    }
  },
}
</script>
