<template>
  <van-row>
    <div id="myChart" style="width: 100vw;height: 100vh"></div>
  </van-row>
</template>

<script>
import * as echarts from "echarts";
import china from "~/assets/geo_china_full.json";

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
        this.drawEcharts(data);
      }
    });
  },
  methods: {
    drawEcharts(data) {
      echarts.registerMap('china', china);
      const myChart = echarts.init(document.getElementById('myChart'));
      const geoCoordMap = {}
      data.forEach(element => {
        const geoInfo = china.features.filter(f => f.properties.name == element.name);
        const geoValue = geoInfo[0].properties.center;
        geoCoordMap[element.name] = geoValue;
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
          text: '发货地图表',
          left: 'center',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          data: ['发货数据'],
          textStyle: {
            color: '#fff'
          }
        },
        geo: {
          map: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam: true,
          itemStyle: {
            normal: {
              areaColor: '#323c48',
              borderColor: '#111'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          }
        },
        series: [
          {
            name: '发货数据',
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
