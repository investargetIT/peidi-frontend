<template>
  <h2 style="text-align: center;">销售数据</h2>
  <h3 style="text-align: center">1.店铺总业绩展示</h3>

  <h3 style="text-align: center">2.商品业绩表</h3>

  <h2 style="text-align: center;">订单数据</h2>
  <h3 style="text-align: center">1.发货数据</h3>
  <van-row>
    <van-col span="24" class="cell">
      <div class="cell_label">今日总单量</div>
      <div class="cell_value">{{ orderData && orderData[0] }}</div>
    </van-col>
  </van-row>
  <van-row>
    <van-col span="12" class="cell">
      <div class="cell_label">订单待打印</div>
      <div class="cell_value">{{ orderData && orderData[1] }}</div>
    </van-col>
    <van-col span="12" class="cell">
      <div class="cell_label">今日已打印</div>
      <div class="cell_value">{{ orderData && orderData[2] }}</div>
    </van-col>
  </van-row>
  <van-row>
    <van-col span="12" class="cell">
      <div class="cell_label">实时订单待发货</div>
      <div class="cell_value">{{ orderData && orderData[3] }}</div>
    </van-col>
    <van-col span="12" class="cell">
      <div class="cell_label">实时今日已发货</div>
      <div class="cell_value">{{ orderData && orderData[4] }}</div>
    </van-col>
  </van-row>
  <h3 style="text-align: center">2.发货地图</h3>
  <div id="myChart" style="width: 100vw;height: 360px;"></div>
  <h3 style="text-align: center">3.年度发货数量</h3>
  <van-row>
    <van-col span="12" class="cell">
      <div class="cell_label">近30天累计发货数量</div>
      <div class="cell_value">{{ orderThirtyDaysData }}</div>
    </van-col>
    <van-col span="12" class="cell">
      <div class="cell_label">年度累计发货数量</div>
      <div class="cell_value">{{ orderYearData }}</div>
    </van-col>
  </van-row>
</template>

<script>
import * as echarts from "echarts";
import china from "~/assets/geo_china_full.json";

export default {
  data() {
    return {
      orderData: [],
      orderThirtyDaysData: null,
      orderYearData: null,
    };
  },
  mounted() {
    this.getSalesData('2024-01-01', '2024-02-01').then(res => {
      const result = this.groupSalesDataByChannel(res.result);
      console.log('result', result);
    });
    // this.getShipData('2024-01-01', '2024-01-31').then((res) => {
    //   if (res.code === 1000) {
    //     const data = [];
    //     res.result.forEach(element => {
    //       data.push({
    //         name: element[0],
    //         value: element[1],
    //       });
    //     });
    //     this.drawEcharts(data);
    //   }
    // });
    // this.getOrderData().then((res) => {
    //   if (res.code === 1000) {
    //     console.log(res);
    //     this.orderData = res.result[0];
    //   }
    // });
    // const date = new Date();
    // const dateStr = date.toISOString().slice(0, 10);
    // console.log('dateStr', dateStr);
    // date.setDate(date.getDate() - 30);
    // const startDateStr = date.toISOString().slice(0, 10);
    // console.log('start', startDateStr);
    // this.getShipData(startDateStr, dateStr).then((res) => {
    //   if (res.code === 1000) {
    //     console.log('result', res);
    //     let total = 0;
    //     res.result.forEach(element => {
    //       total += element[1];
    //     });
    //     this.orderThirtyDaysData = total;
    //   }
    // });
    // const year = new Date().getFullYear()
    // console.log('year', year);
    // this.getShipData(year + '-01-01', dateStr).then((res) => {
    //   if (res.code === 1000) {
    //     console.log('result', res);
    //     let total = 0;
    //     res.result.forEach(element => {
    //       total += element[1];
    //     });
    //     this.orderYearData = total;
    //   }
    // });
  },
  methods: {
    getSalesData(startDate, endDate) {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetSalesAmountRanking',
          params: [startDate, endDate],
        },
      });
    },
    getOrderData() {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetWMSOrderStats',
          params: [],
        },
      });
    },
    getShipData(startDate, endDate) {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetOrderCountByCity',
          params: [startDate, endDate],
        },
      });
    },
    groupSalesDataByChannel(data) {
      const channel = [];
      const amount = [];
      data.forEach(element => {
        const i = channel.indexOf(element[0]);
        if (i > -1) {
          amount[i] += element[3];
        } else {
          channel.push(element[0]);
          amount.push(0);
        }
      });
      const result = [];
      for (let index = 0; index < channel.length; index++) {
        const name = channel[index];
        const value = amount[index];
        result.push({ channel: name, amount: value })
      }
      return result;
    },
    drawEcharts(data) {
      echarts.registerMap('china', china);
      const myChart = echarts.init(document.getElementById('myChart'));
      const geoCoordMap = {}
      data.forEach(element => {
        const geoInfo = china.features.filter(f => f.properties.name == element.name);
        if (geoInfo.length > 0) {
          const geoValue = geoInfo[0].properties.center;
          geoCoordMap[element.name] = geoValue;
        }
      });
      var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          var geoCoord = geoCoordMap[data[i].name];
          if (geoCoord) {
            res.push({
              name: data[i].name,
              value: geoCoord.concat(data[i].value)
            });
          }
        }
        return res;
      };
      const option = {
        backgroundColor: '#404a59',
        title: {
          text: '2.发货地图',
          left: 'center',
          textStyle: {
            color: '#fff'
          },
          show: false,
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          data: ['订单数量'],
          textStyle: {
            color: '#fff'
          }
        },
        geo: {
          map: 'china',
          label: {
            emphasis: {
              show: false
            }
          },
          roam: false,
          itemStyle: {
            normal: {
              areaColor: '#323c48',
              borderColor: '#111'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          },
        },
        series: [
          {
            name: '订单数量',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(data),
            symbolSize: function (val) {
              return val[2] / 1000;
            },
            encode: {
              value: 2
            },
            label: {
              normal: {
                formatter: '{@[2]}',
                position: 'right',
                show: false
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: '#ddb926'
              }
            }
          },
          {
            name: 'Top 10',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(data.sort(function (a, b) {
              return b.value - a.value;
            }).slice(0, 10)),
            encode: {
              value: 2
            },
            symbolSize: function (val) {
              return val[2] / 1000;
            },
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
              normal: {
                formatter: '{@[2]}',
                position: 'right',
                show: false,
              }
            },
            itemStyle: {
              normal: {
                color: '#f4e925',
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            zlevel: 1
          }
        ]
      };
      myChart.setOption(option);
    }
  },
}
</script>

<style scoped>
.cell {
  text-align: center;
  padding: 20px 0;
}
.cell_label {
  font-size: 12px;
  margin-bottom: 8px;
}
.cell_value {
  font-size: 24px;
  font-weight: bold;
}
</style>
