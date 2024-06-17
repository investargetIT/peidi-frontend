<template>
  <div id="myChart" style="width: 50vw;height: 50vh;"></div>
</template>

<script>
import echarts from "echarts";
import china from "echarts/map/json/china.json";

export default {
  mounted() {
    console.log('china', china)
    const runtimeConfig = useRuntimeConfig();
    $fetch(runtimeConfig.public.API_BASE_URL + '/bi/call-proc?name=GetOrderCountByCity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${runtimeConfig.public.DJANGO_API_TOKEN}`,
      },
      body: ["2024-01-01", "2024-01-31"],
    }).then((res) => {
      console.log(res);
      if (res.code === 1000) {
      }
    });
    console.log(echarts)
    echarts.registerMap('china', china);
    const myChart = echarts.init(document.getElementById('myChart'));
    var option = {
      title: {
        text: '发货数据',
        // subtext: 'Data from Wikipedia',
        // sublink:
        //   'http://zh.wikipedia.org/wiki/%E9%A6%99%E6%B8%AF%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83#cite_note-12'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} (p / km2)'
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {}
        }
      },
      visualMap: {
        min: 800,
        max: 50000,
        text: ['High', 'Low'],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['lightskyblue', 'yellow', 'orangered']
        }
      },
      series: [
        {
          name: '香港18区人口密度',
          type: 'map',
          map: 'china',
          // label: {
          //   show: true
          // },
          data: [
            { name: '四川省', value: 20057.34 },
          ],
          nameMap: {
            '四川': '四川省',
          }
        }
      ]
    };
    myChart.setOption(option);
  }
}
</script>
