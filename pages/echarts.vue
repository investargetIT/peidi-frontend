<template>
  <h2 style="text-align: center;">销售数据</h2>
  <h3 style="text-align: center">1.店铺总业绩展示</h3>
  <div id="chart_shop_sales" style="width: 100%;height: 360px;"></div>
  <h3 style="text-align: center">2.商品业绩表</h3>
  <div id="chart_goods_sales" style="width: 100%;height: 560px;"></div>
  <h2 style="text-align: center;">订单数据</h2>
  <h3 style="text-align: center">1.发货数据</h3>
  <!-- <van-row>
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
  </van-row> -->
  <div id="chart_wms_data" style="width: 100%;height: 300px;"></div>
  <h3 style="text-align: center">2.发货地图</h3>
  <div id="myChart" style="width: 100%;height: 540px;"></div>
  <h3 style="text-align: center">3.年度发货数量</h3>
  <div id="chart_ship_data" style="width: 100%;height: 300px;"></div>

  <!-- <van-row>
    <van-col span="12" class="cell">
      <div class="cell_label">近30天累计发货数量</div>
      <div class="cell_value">{{ orderThirtyDaysData }}</div>
    </van-col>
    <van-col span="12" class="cell">
      <div class="cell_label">年度累计发货数量</div>
      <div class="cell_value">{{ orderYearData }}</div>
    </van-col>
  </van-row> -->
  <h2 style="text-align: center;">供应链数据</h2>
  <h3 style="text-align: center">1.部分商品现有库存</h3>
  <!-- <div id="chart_supply_chain" style="width: 100%;height: 300px;"></div> -->
  <div style="display: flex;width: 100%;margin: 0 auto;font-weight: bold;">
    <div style="flex: 1;">商品名称</div>
    <div style="flex: 1;text-align: center;">库存</div>
    <div style="flex: 1;text-align: center;">可发库存</div>
    <div style="flex: 1;text-align: center;">待发货量</div>
  </div>

  <div v-for="item in stockData" style="display: flex;align-items:center;width: 100%;margin: 10px auto;font-size: 14px;">
    <div style="flex: 1;">{{ item[0] }}</div>
    <div style="flex: 1;text-align: center;">{{ item[3] }}</div>
    <div style="flex: 1;text-align: center;">{{ item[4] }}</div>
    <div style="flex: 1;text-align: center;">{{ item[5] }}</div>
  </div>

  <div>
    <EasyDataTable
      :headers="headers"
      :items="items"
    />
  </div>

  <h2 style="text-align: center;">客服数据</h2>
  <h3 style="text-align: center">1.部分店铺DSR</h3>
  <div id="chart_shop_dsr" style="width: 100%;height: 300px;"></div>
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
      stockData: [],
      headers: [
        { text: "PLAYER", value: "player" },
        { text: "TEAM", value: "team" },
        { text: "NUMBER", value: "number" },
        { text: "POSITION", value: "position" },
        { text: "HEIGHT", value: "indicator.height" },
        { text: "WEIGHT (lbs)", value: "indicator.weight", sortable: true },
        { text: "LAST ATTENDED", value: "lastAttended", width: 200 },
        { text: "COUNTRY", value: "country" },
      ],
      items: [
        { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
        { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
        { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
        { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
      ],
    };
  },
  mounted() {
    Promise.all([
      this.getSalesData('2024-01-01 00:00:00', '2024-01-31 23:59:59'),
      this.getSalesData('2024-02-01 00:00:00', '2024-02-29 23:59:59'),
      this.getSalesData('2024-03-01 00:00:00', '2024-03-31 23:59:59'),
      this.getSalesData('2024-04-01 00:00:00', '2024-04-30 23:59:59'),
      this.getSalesData('2024-05-01 00:00:00', '2024-05-31 23:59:59'),
      this.getSalesData('2024-06-01 00:00:00', '2024-06-30 23:59:59'),
    ]).then(res => {
      const channel = [];
      const amount = [];
      res.forEach((element, index) => {
        const result = this.groupSalesDataByChannel(element.result);
        result.forEach(element => {
          const i = channel.indexOf(element.channel);
          if (i > -1) {
            amount[i]['data'][index] = parseInt(element.amount);
          } else {
            channel.push(element.channel);
            const value = [];
            value[index] = parseInt(element.amount);
            amount.push({ name: element.channel, data: value });
          }
        });
      });
      this.drawShopSalesChart(amount);
    });

    Promise.all([
      this.getGoodsSalesData('2024-01-01 00:00:00', '2024-01-31 23:59:59'),
      this.getGoodsSalesData('2024-02-01 00:00:00', '2024-02-29 23:59:59'),
      this.getGoodsSalesData('2024-03-01 00:00:00', '2024-03-31 23:59:59'),
      this.getGoodsSalesData('2024-04-01 00:00:00', '2024-04-30 23:59:59'),
      this.getGoodsSalesData('2024-05-01 00:00:00', '2024-05-31 23:59:59'),
      this.getGoodsSalesData('2024-06-01 00:00:00', '2024-06-30 23:59:59'),
    ]).then(res => {
      const channel = [];
      const amount = [];
      res.forEach((element, index) => {
        const result = this.groupGoodsSalesDataBySPU(element.result);
        result.forEach(element => {
          const i = channel.indexOf(element.channel);
          if (i > -1) {
            amount[i]['data'][index] = element.amount;
          } else {
            channel.push(element.channel);
            const value = [];
            value[index] = element.amount;
            amount.push({ name: element.channel, data: value });
          }
        });
      });
      this.drawGoodsSalesChart(amount);
    });

    this.getShipData('2024-01-01', '2024-05-31').then((res) => {
      if (res.code === 1000) {
        const data = [];
        res.result.forEach(element => {
          data.push({
            name: element[0],
            value: element[1],
          });
        });
        this.drawEcharts(data);
      }
    });
    this.getOrderData().then((res) => {
      if (res.code === 1000) {
        this.orderData = res.result[0];
        const data = this.groupWMSData(res.result[0]);
        this.drawWMSDataChart(data);
      }
    });
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    date.setDate(date.getDate() - 30);
    const startDateStr = date.toISOString().slice(0, 10);
    this.getShipData(startDateStr, dateStr).then((res) => {
      if (res.code === 1000) {
        let total = 0;
        res.result.forEach(element => {
          total += element[1];
        });
        this.orderThirtyDaysData = total;
      }
    });
    const year = new Date().getFullYear()
    this.getShipData(year + '-01-01', dateStr).then((res) => {
      if (res.code === 1000) {
        let total = 0;
        res.result.forEach(element => {
          total += element[1];
        });
        this.orderYearData = total;
      }
    });
    Promise.all([
      this.getShipData(startDateStr, dateStr),
      this.getShipData(year + '-01-01', dateStr),
    ]).then(res => {
      const value = [];
      res.forEach((element, index) => {
        if (element.code === 1000) {
          let total = 0;
          element.result.forEach(element => {
            total += element[1];
          });
          if (index == 0) {
            value.push({ name: '近30天累计发货数量', value: total });
          } else {
            value.push({ name: '年度累计发货数量', value: total });
          }
        }
      });
      this.drawShipDataChart(value);
    });
    this.getSupplyChainData().then(res => {
      if (res.code == 1000) {
        const data = this.groupSupplyChainDataByBrand(res.result);
        // this.drawSupplyChainChart(data);
        this.stockData = data.slice(0, 5);
      }
    });
    this.getShopDSRData().then(res => {
      if (res.code == 1000) {
        const data = this.groupShopDSRData(res.result.slice(0, 3));
        this.drawShopDSRChart(data);
      }
    });
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
    getGoodsSalesData(startDate, endDate) {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'CalculateSPUPerformance',
          params: [startDate, endDate],
        },
      });
    },
    getSupplyChainData() {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetSimplifiedStockDetails',
          params: [],
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
    getShopDSRData() {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetNeedSummaryRecords',
          params: [],
        },
      });
    },
    groupSalesDataByChannel(data) {
      const channel = [];
      const amount = [];
      data.forEach(element => {
        const i = channel.indexOf(element[0]);
        if (i > -1) {
          amount[i] += element[1];
        } else {
          channel.push(element[0]);
          amount.push(element[1]);
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
    groupGoodsSalesDataBySPU(data) {
      const channel = [];
      const amount = [];
      data.forEach(element => {
        const i = channel.indexOf(element[0]);
        if (i > -1) {
          amount[i] += parseInt(element[1]);
        } else {
          channel.push(element[0]);
          amount.push(parseInt(element[1]));
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
    groupSupplyChainDataByBrand(data) {
      data = data.sort((prev, next) => {
        return next[5] - prev[5];
      });
      return data;
      const channel = ['库存', '可发库存', '待发货量'];
      const amount = [];
      data.forEach(element => {
        if (amount[0]) {
          amount[0] += element[3];
        } else {
          amount[0] = element[3];
        }
        if (amount[1]) {
          amount[1] += element[4];
        } else {
          amount[1] = element[4];
        }
        if (amount[2]) {
          amount[2] += element[5];
        } else {
          amount[2] = element[5];
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
    groupWMSData(data) {
      const channel = ['今日总单量', '订单待打印', '今日已打印', '实时订单待发货', '实时今日已发货'];
      const amount = data;
      const result = [];
      for (let index = 0; index < channel.length; index++) {
        const name = channel[index];
        const value = amount[index];
        result.push({ name, value })
      }
      return result;
    },
    groupShopDSRData(data) {
      const result = [];
      for (let index = 0; index < data.length; index++) {
        const name = data[index][3];
        const value = data[index].slice(4, 7);
        result.push({ name, value })
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
          text: '2024年1-5月发货地图',
          top: 20,
          left: 'center',
          textStyle: {
            color: '#fff'
          },
        },
        tooltip: {
          trigger: 'item'
        },
        // legend: {
        //   orient: 'vertical',
        //   y: 'bottom',
        //   x: 'right',
        //   data: ['订单数量'],
        //   textStyle: {
        //     color: '#fff'
        //   }
        // },
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
              return val[2] / 4000;
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
              return val[2] / 4000;
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
    },
    drawShopSalesChart(data) {
      const chartDom = document.getElementById('chart_shop_sales');
      const myChart = echarts.init(chartDom);
      const option = {
        title: {
          text: '2024年渠道销售额（月度）',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 40,
          data: data.map(m => m.name)
        },
        grid: {
          top: 120,
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        yAxis: {
          type: 'value'
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };
      myChart.setOption(option);
    },
    drawGoodsSalesChart(data) {
      const chartDom = document.getElementById('chart_goods_sales');
      const myChart = echarts.init(chartDom);
      const option = {
        title: {
          text: '2024年SPU销售额（月度）',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 40,
          data: data.map(m => m.name)
        },
        grid: {
          top: 280,
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        yAxis: {
          type: 'value'
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };
      myChart.setOption(option);
    },
    drawSupplyChainChart(data) {
      const chartDom = document.getElementById('chart_supply_chain');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: data.map(m => ({ value: m.amount, name: m.channel })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    drawWMSDataChart(data) {
      const chartDom = document.getElementById('chart_wms_data');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    drawShipDataChart(data) {
      const chartDom = document.getElementById('chart_ship_data');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    drawShopDSRChart(data) {
      const chartDom = document.getElementById('chart_shop_dsr');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: 0,
          data: data.map(m => m.name),
        },
        radar: {
          shape: 'circle',
          indicator: [
            { name: '物流评分', max: 5 },
            { name: '商品评分', max: 5 },
            { name: '服务评分', max: 5 },
          ]
        },
        series: [
          {
            name: '店铺评分',
            type: 'radar',
            data,
          }
        ]
      };
      myChart.setOption(option);
    },
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
