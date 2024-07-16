<template>
  <h2 style="text-align: center;">销售数据</h2>
  <h3 style="text-align: center">1.店铺总业绩展示</h3>
  <div id="chart_shop_sales" style="width: 100%;height: 400px;"></div>
  <h3 style="text-align: center">2.商品业绩表</h3>
  <div id="chart_goods_sales" style="width: 100%;height: 460px;"></div>
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
  <div id="myChart" style="width: 100%;height: 600px;"></div>
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
  <h3 style="text-align: center">1.商品库存</h3>
  <!-- <div id="chart_supply_chain" style="width: 100%;height: 300px;"></div> -->
  <!-- <div style="display: flex;width: 100%;margin: 0 auto;font-weight: bold;">
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
  </div> -->

  <EasyDataTable
    :headers="headers"
    :items="items"
    :rows-per-page="5"
  />

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
      spuEcharts: null,
      headers: [
        { text: "商品名称", value: "goods_name" },
        { text: "商家编码", value: "goods_no" },
        { text: "品牌", value: "brand" },
        { text: "库存", value: "total_stock" },
        { text: "可发库存", value: "usable_stock" },
        { text: "待发货量", value: "to_ship_stock" },
      ],
      items: [],
      yesterdayStr: null,
    };
  },
  mounted() {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 1);
    const yesterdayStr = dateObj.toISOString().split('T')[0];
    this.yesterdayStr = yesterdayStr;
    Promise.all([
      this.getSalesData('2024-01-01 00:00:00', '2024-01-31 23:59:59'),
      this.getSalesData('2024-02-01 00:00:00', '2024-02-29 23:59:59'),
      this.getSalesData('2024-03-01 00:00:00', '2024-03-31 23:59:59'),
      this.getSalesData('2024-04-01 00:00:00', '2024-04-30 23:59:59'),
      this.getSalesData('2024-05-01 00:00:00', '2024-05-31 23:59:59'),
      this.getSalesData('2024-06-01 00:00:00', '2024-06-30 23:59:59'),
      this.getSalesData('2024-07-01 00:00:00', yesterdayStr + ' 23:59:59'),
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

    this.getAndDrawSPUSalesData();

    this.getShipData('2024-01-01', yesterdayStr).then((res) => {
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
        this.items = data.map(m => {
          const goods_name = m[0];
          const goods_no = m[1];
          const brand = m[2];
          const total_stock = m[3];
          const usable_stock = m[4];
          const to_ship_stock = m[5];
          return { goods_name, goods_no, brand, total_stock, usable_stock, to_ship_stock };
        });
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
    getAndDrawSPUSalesData() {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - 1);
      const yesterdayStr = dateObj.toISOString().split('T')[0];
      Promise.all([
        this.getGoodsSalesData('2024-01-01 00:00:00', '2024-01-31 23:59:59'),
        this.getGoodsSalesData('2024-02-01 00:00:00', '2024-02-29 23:59:59'),
        this.getGoodsSalesData('2024-03-01 00:00:00', '2024-03-31 23:59:59'),
        this.getGoodsSalesData('2024-04-01 00:00:00', '2024-04-30 23:59:59'),
        this.getGoodsSalesData('2024-05-01 00:00:00', '2024-05-31 23:59:59'),
        this.getGoodsSalesData('2024-06-01 00:00:00', '2024-06-30 23:59:59'),
        this.getGoodsSalesData('2024-07-01 00:00:00', yesterdayStr + ' 23:59:59')
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
    },
    getShopSalesData(shopName, startDate, endDate) {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'GetSalesAmountRankingByChannel',
          params: [shopName, startDate, endDate],
        },
      });
    },
    getShopSPUSalesData(spu, startDate, endDate) {
      const runtimeConfig = useRuntimeConfig();
      return $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
        },
        body: {
          name: 'CalculateShopBySPU',
          params: [spu, startDate, endDate],
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
          flush: true,
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
          text: '2024年发货地图',
          subtext: `数据截止日期${this.yesterdayStr}`,
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
          text: '2024年渠道销售额',
          subtext: `数据截止日期${this.yesterdayStr}\n点击下方👇渠道名称可查看店铺销售额\n点击右侧👉重置按钮返回渠道销售额`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          type: 'scroll',
          top: 80,
          data: data.map(m => m.name)
        },
        grid: {
          left: 10,
          right: 10,
          top: 120,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        },
        yAxis: {
          type: 'value'
        },
        toolbox: {
          feature: {
            restore: {
              show: true
            }
          }
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };
      myChart.setOption(option);
      const echart = this;
      myChart.on('legendselectchanged', function (params) {
        // // State if legend is selected.
        // var isSelected = params.selected[params.name];
        // // print in the console.
        // console.log(
        //   (isSelected ? 'Selected' : 'Not Selected') + 'legend' + params.name
        // );
        // // print for all legends.
        // console.log(params.selected);
        if (params.name.length < 5) {
          echart.drawChannelShopSalesChart(params.name);
        }
      });
    },
    drawGoodsSalesChart(data) {
      const chartDom = document.getElementById('chart_goods_sales');
      const myChart = echarts.init(chartDom);
      this.spuEcharts = myChart;
      const option = {
        title: {
          text: '2024年SPU销售额',
          subtext: `数据截止日期${this.yesterdayStr}\n点击下方👇SPU名称可查看各店铺销售额`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          type: 'scroll',
          top: 60,
          data: data.map(m => m.name)
        },
        grid: {
          left: 10,
          right: 10,
          top: 90,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        },
        yAxis: {
          type: 'value'
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };
      const echart = this;
      myChart.on('legendselectchanged', function (params) {
        if (params.name.length < 7) {
          echart.getSPUShopSalesData(params.name);
        }
      });
      myChart.setOption(option, true);
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
    getSPUShopSalesData(spu) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - 1);
      const yesterdayStr = dateObj.toISOString().split('T')[0];
      this.getShopSPUSalesData(spu,'2024-01-01 00:00:00', yesterdayStr + ' 23:59:59').then(res => {
        let { result: data } = res;
        data = data.map(m => ({ name: m[0], value: parseInt(m[1]) }));
        this.drawSPUShopSalesChart(data, spu);
      });
    },
    drawSPUShopSalesChart(data, spu) {
      const echarts = this;
      const option = {
        tooltip: {
          trigger: 'item'
        },
        title: {
          text: `2024年${spu}各店铺销售额`,
          subtext: `数据截止日期${this.yesterdayStr}\n点击右侧👉重置按钮返回`,
          left: 'center',
        },
        toolbox: {
          feature: {
            myFeature: {
              show: true,
              title: '重置',
              icon: 'path://M16.68,22.2c-1.78,2.21-3.43,4.55-5.06,7.46C5.63,40.31,3.1,52.39,4.13,64.2c1.01,11.54,5.43,22.83,13.37,32.27 c2.85,3.39,5.91,6.38,9.13,8.97c11.11,8.93,24.28,13.34,37.41,13.22c13.13-0.13,26.21-4.78,37.14-13.98 c3.19-2.68,6.18-5.73,8.91-9.13c6.4-7.96,10.51-17.29,12.07-27.14c1.53-9.67,0.59-19.83-3.07-29.66 c-3.49-9.35-8.82-17.68-15.78-24.21C96.7,8.33,88.59,3.76,79.2,1.48c-2.94-0.71-5.94-1.18-8.99-1.37c-3.06-0.2-6.19-0.13-9.4,0.22 c-2.01,0.22-3.46,2.03-3.24,4.04c0.22,2.01,2.03,3.46,4.04,3.24c2.78-0.31,5.49-0.37,8.14-0.2c2.65,0.17,5.23,0.57,7.73,1.17 c8.11,1.96,15.1,5.91,20.84,11.29c6.14,5.75,10.85,13.12,13.94,21.43c3.21,8.61,4.04,17.51,2.7,25.96 C113.59,75.85,110,84,104.4,90.96c-2.47,3.07-5.12,5.78-7.91,8.13c-9.59,8.07-21.03,12.15-32.5,12.26 c-11.47,0.11-23-3.76-32.76-11.61c-2.9-2.33-5.62-4.98-8.13-7.97c-6.92-8.22-10.77-18.09-11.66-28.2 c-0.91-10.37,1.32-20.99,6.57-30.33c1.59-2.82,3.21-5.07,5.01-7.24l0.53,14.7c0.07,2.02,1.76,3.6,3.78,3.52 c2.02-0.07,3.6-1.76,3.52-3.78l-0.85-23.42c-0.07-2.02-1.76-3.6-3.78-3.52c-0.13,0-0.25,0.02-0.37,0.03l0,0l-22.7,3.19 c-2,0.28-3.4,2.12-3.12,4.13c0.28,2,2.12,3.4,4.13,3.12L16.68,22.2L16.68,22.2z',
              onclick: function () {
                echarts.getAndDrawSPUSalesData();
              }
            }
          }
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
      this.spuEcharts.setOption(option, true);
    },
    // drawSPUGoal() {
    //   const chartDom = document.getElementById('echarts_spu_goals');
    //   const myChart = echarts.init(chartDom);
    //   const gaugeData = [
    //     {
    //       value: 20,
    //       name: 'Perfect',
    //       title: {
    //         offsetCenter: ['0%', '-35%']
    //       },
    //       detail: {
    //         valueAnimation: true,
    //         offsetCenter: ['0%', '-20%']
    //       }
    //     },
    //     {
    //       value: 40,
    //       name: 'Good',
    //       title: {
    //         offsetCenter: ['0%', '-5%']
    //       },
    //       detail: {
    //         valueAnimation: true,
    //         offsetCenter: ['0%', '10%']
    //       }
    //     },
    //     {
    //       value: 60,
    //       name: 'Commonly',
    //       title: {
    //         offsetCenter: ['0%', '25%']
    //       },
    //       detail: {
    //         valueAnimation: true,
    //         offsetCenter: ['0%', '40%']
    //       }
    //     }
    //   ];
    //   const option = {
    //     series: [
    //       {
    //         type: 'gauge',
    //         startAngle: 90,
    //         endAngle: -270,
    //         pointer: {
    //           show: false
    //         },
    //         progress: {
    //           show: true,
    //           overlap: false,
    //           roundCap: true,
    //           clip: false,
    //           itemStyle: {
    //             borderWidth: 1,
    //             borderColor: '#464646'
    //           }
    //         },
    //         axisLine: {
    //           lineStyle: {
    //             width: 40
    //           }
    //         },
    //         splitLine: {
    //           show: false,
    //           distance: 0,
    //           length: 10
    //         },
    //         axisTick: {
    //           show: false
    //         },
    //         axisLabel: {
    //           show: false,
    //           distance: 50
    //         },
    //         data: gaugeData,
    //         title: {
    //           fontSize: 14
    //         },
    //         detail: {
    //           width: 50,
    //           height: 14,
    //           fontSize: 14,
    //           color: 'inherit',
    //           borderColor: 'inherit',
    //           borderRadius: 20,
    //           borderWidth: 1,
    //           formatter: '{value}%'
    //         }
    //       }
    //     ]
    //   };
    //   myChart.setOption(option);
    // },
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
    drawChannelShopSalesChart(channel_name) {
      Promise.all([
        this.getShopSalesData(channel_name, '2024-01-01 00:00:00', '2024-01-31 23:59:59'),
        this.getShopSalesData(channel_name, '2024-02-01 00:00:00', '2024-02-29 23:59:59'),
        this.getShopSalesData(channel_name, '2024-03-01 00:00:00', '2024-03-31 23:59:59'),
        this.getShopSalesData(channel_name, '2024-04-01 00:00:00', '2024-04-30 23:59:59'),
        this.getShopSalesData(channel_name, '2024-05-01 00:00:00', '2024-05-31 23:59:59'),
        this.getShopSalesData(channel_name, '2024-06-01 00:00:00', '2024-06-30 23:59:59'),
        this.getShopSalesData(channel_name, '2024-07-01 00:00:00', this.yesterdayStr + ' 23:59:59'),
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
