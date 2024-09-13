<template>
  <h2 style="text-align: center;">销售数据</h2>
  <h3 style="text-align: center">1.店铺总业绩展示</h3>
  <div id="chart_shop_sales" style="width: 100%;height: 400px;"></div>
  <h3 style="text-align: center">2.商品业绩表</h3>
  <div id="chart_goods_sales" style="width: 100%;height: 500px;" v-if="displayEchartsGoodsLine"></div>
  <div id="echarts_goods_pie" style="width: 100%;height: 800px;" v-if="displayEchartsGoodsPie"></div>
  <div id="echarts_spu_goals" style="margin-top: 20px;width: 100%;height: 400px;" v-if="displaySPUGoals"></div>

  <h2 style="text-align: center;">订单数据</h2>
  <h3 style="text-align: center">1.发货数据</h3>
  <div id="chart_wms_data" style="width: 100%;height: 300px;"></div>
  <h3 style="text-align: center">2.发货地图</h3>
  <div id="myChart" style="width: 100%;height: 600px;"></div>
  <h3 style="text-align: center">3.年度发货数量</h3>
  <div id="chart_ship_data" style="width: 100%;height: 300px;"></div>

  <h2 style="text-align: center;">供应链数据</h2>
  <h3 style="text-align: center">1.商品库存</h3>
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
import moment from 'moment';

export default {
  data() {
    return {
      orderData: [],
      // orderThirtyDaysData: null,
      // orderYearData: null,
      stockData: [],
      spuEcharts: null,
      echartsGoodsPie: null,
      headers: [
        { text: "商品名称", value: "goods_name" },
        { text: "商家编码", value: "goods_no" },
        { text: "品牌", value: "brand" },
        { text: "库存", value: "total_stock" },
        { text: "可发库存", value: "usable_stock" },
        { text: "待发货量", value: "to_ship_stock" },
      ],
      items: [],
      yesterday: null,
      yesterdayStr: null,
      displaySPUGoals: false,
      displayEchartsGoodsPie: false,
      displayEchartsGoodsLine: true,
      // columns: [
      //   { text: '杭州', value: 'Hangzhou' },
      //   { text: '宁波', value: 'Ningbo' },
      //   { text: '温州', value: 'Wenzhou' },
      //   { text: '绍兴', value: 'Shaoxing' },
      //   { text: '湖州', value: 'Huzhou' },
      // ],
      // fieldValue: '',
      // showPicker: false,
      // onConfirm: ({ selectedOptions }) => {
      //   this.showPicker = false;
      //   this.fieldValue = selectedOptions[0].text;
      // },
    };
  },
  mounted() {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 1);
    this.yesterday = dateObj;
    this.yesterdayStr = moment().subtract(1, 'days').format().split('T')[0];

    this.getAndDrawChannelSalesData();
    this.getAndDrawSPUSalesData();

    this.getShipData(this.yesterday.getFullYear() + '-01-01 00:00:00', this.yesterdayStr + ' 23:59:59').then((res) => {
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
    date.setDate(this.yesterday.getDate() - 30);
    const startDateStr = date.toISOString().slice(0, 10);
    // this.getShipData(startDateStr, dateStr).then((res) => {
    //   if (res.code === 1000) {
    //     let total = 0;
    //     res.result.forEach(element => {
    //       total += element[1];
    //     });
    //     this.orderThirtyDaysData = total;
    //   }
    // });
    const year = this.yesterday.getFullYear();
    // this.getShipData(year + '-01-01', dateStr).then((res) => {
    //   if (res.code === 1000) {
    //     let total = 0;
    //     res.result.forEach(element => {
    //       total += element[1];
    //     });
    //     this.orderYearData = total;
    //   }
    // });
    Promise.all([
      this.getShipData(startDateStr + ' 00:00:00', this.yesterdayStr + ' 23:59:59'),
      this.getShipData(year + '-01-01 00:00:00', this.yesterdayStr + ' 23:59:59'),
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
    window.addEventListener('hashchange', this.hashChange);
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.hashChange);
  },
  methods: {
    hashChange() {
      console.log('hash changed', location.hash);
      if (location.hash) {
        let [date, spu] = location.hash.slice(1).split('/');
        console.log(date, spu);
        console.log(this.getLastDay(date));
        spu = decodeURIComponent(spu);
        console.log(spu);
        this.displayEchartsGoodsLine = false;
        this.displayEchartsGoodsPie = true;
        this.getSPUShopSalesData(spu, date + '-01 00:00:00', this.getLastDay(date) + ' 23:59:59');
      }
    },
    getLastDay(dateStr) {
      const [year, month] = dateStr.split('-').map(Number);
      const currentMonth = moment().format('YYYY-MM');
      if (currentMonth == dateStr) {
        return this.yesterdayStr;
      }
      const nextMonth = new Date(year, month, 0);
      const momentMonth = moment(nextMonth);
      return momentMonth.format('YYYY-MM-DD');
    },
    getAllMomentMonths() {
      const startDate = moment('2024-01-01');
      const endDate = moment().subtract(1, 'days');
      const betweenMonths = [];
      const date = startDate.startOf('month');
      while (date < endDate.endOf('month')) {
        betweenMonths.push(date.clone());
        date.add(1, 'month');
      }
      return betweenMonths;
    },
    getAllMonths() {
      return this.getAllMomentMonths().map(m => {
        const startDateTime = m.format('YYYY-MM-DD 00:00:00');
        let endDateTime = m.endOf('month');
        if (endDateTime > moment().subtract(1, 'days')) {
          endDateTime = moment().subtract(1, 'days');
        }
        endDateTime = endDateTime.format('YYYY-MM-DD 23:59:59');
        return { startDateTime, endDateTime };
      });
    },
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
    getAndDrawChannelSalesData() {
      Promise.all(this.getAllMonths().map(m => this.getSalesData(m.startDateTime, m.endDateTime)))
        .then(res => {
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
    getAndDrawSPUSalesData() {
      Promise.all(this.getAllMonths().map(m => this.getGoodsSalesData(m.startDateTime, m.endDateTime)))
        .then(res => {
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
          flush: true,
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
          subtext: `数据截止至${this.yesterdayStr}`,
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
      const echart = this;
      const chartDom = document.getElementById('chart_shop_sales');
      const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
      const option = {
        title: {
          text: '渠道销售额',
          subtext: `数据截止至${this.yesterdayStr}\n点击下方👇渠道名称可查看店铺销售额\n点击右侧👉重置按钮返回渠道销售额`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          triggerOn: 'click',
          order: 'valueDesc',
          className: 'echarts-tooltip',
          enterable: true,
        },
        legend: {
          type: 'scroll',
          top: 80,
          data: data.map(m => m.name)
        },
        grid: {
          left: 20,
          right: 30,
          top: 120,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.getAllMomentMonths().map(m => m.format('YYYY-MM')),
        },
        yAxis: {
          type: 'value'
        },
        toolbox: {
          feature: {
            myFeature: {
              show: true,
              title: '重置',
              icon: 'path://M16.68,22.2c-1.78,2.21-3.43,4.55-5.06,7.46C5.63,40.31,3.1,52.39,4.13,64.2c1.01,11.54,5.43,22.83,13.37,32.27 c2.85,3.39,5.91,6.38,9.13,8.97c11.11,8.93,24.28,13.34,37.41,13.22c13.13-0.13,26.21-4.78,37.14-13.98 c3.19-2.68,6.18-5.73,8.91-9.13c6.4-7.96,10.51-17.29,12.07-27.14c1.53-9.67,0.59-19.83-3.07-29.66 c-3.49-9.35-8.82-17.68-15.78-24.21C96.7,8.33,88.59,3.76,79.2,1.48c-2.94-0.71-5.94-1.18-8.99-1.37c-3.06-0.2-6.19-0.13-9.4,0.22 c-2.01,0.22-3.46,2.03-3.24,4.04c0.22,2.01,2.03,3.46,4.04,3.24c2.78-0.31,5.49-0.37,8.14-0.2c2.65,0.17,5.23,0.57,7.73,1.17 c8.11,1.96,15.1,5.91,20.84,11.29c6.14,5.75,10.85,13.12,13.94,21.43c3.21,8.61,4.04,17.51,2.7,25.96 C113.59,75.85,110,84,104.4,90.96c-2.47,3.07-5.12,5.78-7.91,8.13c-9.59,8.07-21.03,12.15-32.5,12.26 c-11.47,0.11-23-3.76-32.76-11.61c-2.9-2.33-5.62-4.98-8.13-7.97c-6.92-8.22-10.77-18.09-11.66-28.2 c-0.91-10.37,1.32-20.99,6.57-30.33c1.59-2.82,3.21-5.07,5.01-7.24l0.53,14.7c0.07,2.02,1.76,3.6,3.78,3.52 c2.02-0.07,3.6-1.76,3.52-3.78l-0.85-23.42c-0.07-2.02-1.76-3.6-3.78-3.52c-0.13,0-0.25,0.02-0.37,0.03l0,0l-22.7,3.19 c-2,0.28-3.4,2.12-3.12,4.13c0.28,2,2.12,3.4,4.13,3.12L16.68,22.2L16.68,22.2z',
              onclick: function () {
                echart.getAndDrawChannelSalesData();
              }
            }
          }
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };
      myChart.setOption(option, true);
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
    formatNumberWithCommas(number) {
      if (typeof number !== "number") {
        throw new TypeError("Input should be a valid number.");
      }
      // Convert the number to a string
      let numberString = number.toString();
      // Use regular expression to add commas as thousand separators
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return formattedString;
    },
    drawGoodsSalesChart(data) {
      const chartDom = document.getElementById('chart_goods_sales');
      const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
      this.spuEcharts = myChart;
      const echart = this;
      const option = {
        title: {
          text: 'SPU销售额',
          subtext: `数据截止至${this.yesterdayStr}\n点击下方👇SPU名称查看详情`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          triggerOn: 'click',
          order: 'valueDesc',
          className: 'echarts-tooltip',
          enterable: true,
          formatter: function (params) {
            params.sort((a, b) => {
              if (a.value === undefined && b.value !== undefined) return 1;
              if (a.value !== undefined && b.value === undefined) return -1;
              if (a.value === undefined && b.value === undefined) return 0;
              return b.value - a.value;
            });
            let html = `<div>${params[0].name}</div>`;
            for (let index = 0; index < params.length; index++) {
              const element = params[index];
              const link = `#${params[0].name}/${element.seriesName}`;
              const tooltipContent = '<div><a href="' + link + '"><div style="display: flex;justify-content: space-between;"><div>' + element.marker + element.seriesName + '</div><div>' + (element.value ? echart.formatNumberWithCommas(element.value) : '-') + '</div></div></a></div>';
              html += tooltipContent;
            }
            return html;
          },
        },
        legend: {
          type: 'scroll',
          top: 70,
          data: data.map(m => m.name)
        },
        grid: {
          left: 20,
          right: 30,
          top: 110,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.getAllMomentMonths().map(m => m.format('YYYY-MM')),
        },
        yAxis: {
          type: 'value'
        },
        series: data.map(m => ({ name: m.name, type: 'line', data: m.data })),
      };

      myChart.on('legendselectchanged', function (params) {
        if (params.name.length < 7) {
          echart.displayEchartsGoodsLine = false;
          echart.displayEchartsGoodsPie = true;
          echart.getSPUShopSalesData(params.name, '2024-01-01 00:00:00', echart.yesterdayStr + ' 23:59:59');
          echart.displaySPUGoals = true;
          echart.getSPUSalesGoalData(params.name);
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
    getSPUShopSalesData(spu, start, end) {
      this.getShopSPUSalesData(spu, start, end).then(res => {
        let { result: data } = res;
        data = data.map(m => ({ name: m[0], value: parseInt(m[1]) }));
        this.drawSPUShopSalesChart(data, spu, start.slice(0, 10), end.slice(0, 10));
      });
    },
    getSPUSalesGoalData(spu) {
      this.getGoodsSalesData('2024-01-01 00:00:00', this.yesterdayStr + ' 23:59:59').then(res => {
        const { result: allData } = res;
        let data = allData.filter(f => f[0] == spu);
        if (data.length > 0) {
          data = data[0]
        }
        const year = this.yesterday.getFullYear();
        const dayOfTheYear = Math.floor((this.yesterday - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24);
        const daysInYear = ((year % 4 === 0 && year % 100 > 0) || year %400 == 0) ? 366 : 365;
        data = [
          {
            value: parseInt(dayOfTheYear / daysInYear * 100),
            name: '时间完成率',
            title: {
              offsetCenter: ['0%', '-50%']
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '-30%']
            }
          },
          {
            value: parseInt(data[4]),
            name: '全年销售完成率',
            title: {
              offsetCenter: ['0%', '-10%']
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '10%']
            }
          },
          {
            value: parseInt(data[5]),
            name: '挑战目标完成率',
            title: {
              offsetCenter: ['0%', '30%']
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '50%']
            }
          }
        ];
        this.drawSPUGoal(data, spu);
      });
    },
    drawSPUShopSalesChart(data, spu, startDate, endDate) {
      const chartDom = document.getElementById('echarts_goods_pie');
      const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
      this.echartsGoodsPie = myChart;
      const nuxt = this;
      let option = {
        tooltip: {
          trigger: 'item'
        },
        title: {
          text: `${spu}各店铺销售额`,
          subtext: `${startDate}至${endDate}\n点击右侧👉重置按钮返回`,
          left: 'center',
        },
        toolbox: {
          feature: {
            myFeature: {
              show: true,
              title: '重置',
              icon: 'path://M16.68,22.2c-1.78,2.21-3.43,4.55-5.06,7.46C5.63,40.31,3.1,52.39,4.13,64.2c1.01,11.54,5.43,22.83,13.37,32.27 c2.85,3.39,5.91,6.38,9.13,8.97c11.11,8.93,24.28,13.34,37.41,13.22c13.13-0.13,26.21-4.78,37.14-13.98 c3.19-2.68,6.18-5.73,8.91-9.13c6.4-7.96,10.51-17.29,12.07-27.14c1.53-9.67,0.59-19.83-3.07-29.66 c-3.49-9.35-8.82-17.68-15.78-24.21C96.7,8.33,88.59,3.76,79.2,1.48c-2.94-0.71-5.94-1.18-8.99-1.37c-3.06-0.2-6.19-0.13-9.4,0.22 c-2.01,0.22-3.46,2.03-3.24,4.04c0.22,2.01,2.03,3.46,4.04,3.24c2.78-0.31,5.49-0.37,8.14-0.2c2.65,0.17,5.23,0.57,7.73,1.17 c8.11,1.96,15.1,5.91,20.84,11.29c6.14,5.75,10.85,13.12,13.94,21.43c3.21,8.61,4.04,17.51,2.7,25.96 C113.59,75.85,110,84,104.4,90.96c-2.47,3.07-5.12,5.78-7.91,8.13c-9.59,8.07-21.03,12.15-32.5,12.26 c-11.47,0.11-23-3.76-32.76-11.61c-2.9-2.33-5.62-4.98-8.13-7.97c-6.92-8.22-10.77-18.09-11.66-28.2 c-0.91-10.37,1.32-20.99,6.57-30.33c1.59-2.82,3.21-5.07,5.01-7.24l0.53,14.7c0.07,2.02,1.76,3.6,3.78,3.52 c2.02-0.07,3.6-1.76,3.52-3.78l-0.85-23.42c-0.07-2.02-1.76-3.6-3.78-3.52c-0.13,0-0.25,0.02-0.37,0.03l0,0l-22.7,3.19 c-2,0.28-3.4,2.12-3.12,4.13c0.28,2,2.12,3.4,4.13,3.12L16.68,22.2L16.68,22.2z',
              onclick: function () {
                nuxt.$router.push('#');
                nuxt.displayEchartsGoodsLine = true;
                nuxt.displayEchartsGoodsPie = false;
                nuxt.displaySPUGoals = false;
                nuxt.getAndDrawSPUSalesData();
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
      data.sort((a, b) => a.value - b.value);
      option = {
        tooltip: {
          trigger: 'item'
        },
        title: {
          text: `${spu}各店铺销售额`,
          subtext: `${startDate}至${endDate}\n点击右侧👉重置按钮返回`,
          left: 'center',
        },
        toolbox: {
          feature: {
            myFeature: {
              show: true,
              title: '重置',
              icon: 'path://M16.68,22.2c-1.78,2.21-3.43,4.55-5.06,7.46C5.63,40.31,3.1,52.39,4.13,64.2c1.01,11.54,5.43,22.83,13.37,32.27 c2.85,3.39,5.91,6.38,9.13,8.97c11.11,8.93,24.28,13.34,37.41,13.22c13.13-0.13,26.21-4.78,37.14-13.98 c3.19-2.68,6.18-5.73,8.91-9.13c6.4-7.96,10.51-17.29,12.07-27.14c1.53-9.67,0.59-19.83-3.07-29.66 c-3.49-9.35-8.82-17.68-15.78-24.21C96.7,8.33,88.59,3.76,79.2,1.48c-2.94-0.71-5.94-1.18-8.99-1.37c-3.06-0.2-6.19-0.13-9.4,0.22 c-2.01,0.22-3.46,2.03-3.24,4.04c0.22,2.01,2.03,3.46,4.04,3.24c2.78-0.31,5.49-0.37,8.14-0.2c2.65,0.17,5.23,0.57,7.73,1.17 c8.11,1.96,15.1,5.91,20.84,11.29c6.14,5.75,10.85,13.12,13.94,21.43c3.21,8.61,4.04,17.51,2.7,25.96 C113.59,75.85,110,84,104.4,90.96c-2.47,3.07-5.12,5.78-7.91,8.13c-9.59,8.07-21.03,12.15-32.5,12.26 c-11.47,0.11-23-3.76-32.76-11.61c-2.9-2.33-5.62-4.98-8.13-7.97c-6.92-8.22-10.77-18.09-11.66-28.2 c-0.91-10.37,1.32-20.99,6.57-30.33c1.59-2.82,3.21-5.07,5.01-7.24l0.53,14.7c0.07,2.02,1.76,3.6,3.78,3.52 c2.02-0.07,3.6-1.76,3.52-3.78l-0.85-23.42c-0.07-2.02-1.76-3.6-3.78-3.52c-0.13,0-0.25,0.02-0.37,0.03l0,0l-22.7,3.19 c-2,0.28-3.4,2.12-3.12,4.13c0.28,2,2.12,3.4,4.13,3.12L16.68,22.2L16.68,22.2z',
              onclick: function () {
                nuxt.$router.push('#');
                nuxt.displayEchartsGoodsLine = true;
                nuxt.displayEchartsGoodsPie = false;
                nuxt.displaySPUGoals = false;
                nuxt.getAndDrawSPUSalesData();
              }
            }
          }
        },
        legend: {},
        grid: {
          top: 80,
          left: 10,
          right: 10,
          containLabel: true
        },
        xAxis: {
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: {
          type: 'category',
          data: data.map(m => m.name)
        },
        series: [
          {
            type: 'bar',
            data: data.map(m => m.value)
          }
        ],
      };
      this.echartsGoodsPie.setOption(option, true);
    },
    drawSPUGoal(gaugeData, spu) {
      const chartDom = document.getElementById('echarts_spu_goals');
      const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
      const option = {
        title: {
          text: `2024年${spu}销售额目标完成百分比`,
          subtext: `数据截止至${this.yesterdayStr}`,
          left: 'center',
        },
        series: [
          {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                borderWidth: 1,
                borderColor: '#464646'
              }
            },
            axisLine: {
              lineStyle: {
                width: 40
              }
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              distance: 50
            },
            data: gaugeData,
            title: {
              fontSize: 14
            },
            detail: {
              width: 50,
              height: 14,
              fontSize: 14,
              color: 'inherit',
              borderColor: 'inherit',
              borderRadius: 20,
              borderWidth: 1,
              formatter: '{value}%'
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
    drawChannelShopSalesChart(channel_name) {
      Promise.all(
        this.getAllMonths().map(m => this.getShopSalesData(channel_name, m.startDateTime, m.endDateTime))
      ).then(res => {
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

<style>
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
.echarts-tooltip {
  min-width: 200px;
  max-height: 250px;
  overflow: auto;
}
</style>
