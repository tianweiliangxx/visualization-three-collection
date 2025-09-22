<template>
  <div class="drillDownMap">
    <div class="container" ref="echartsBox"></div>
    <el-button class="btn" v-show="mapList.length > 1" @click="back">返回</el-button>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'drill-down-map',
})

import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const echartsBox = ref<HTMLElement | null>(null)
const mapList = ref<{ name: string; adcode: number }[]>([])

onMounted(async () => {
  const myEcharts = echarts.init(echartsBox.value)

  myEcharts.on('click', async function (params: any) {
    if (params.data) {
      const { adcode, name, level } = params.data
      if (level === 'district') {
        alert('无此区域地图显示！')
        // initChinaMap(); // 初始化中国地图
        return
      }
      const data = await getData(name, adcode)

      setOption(myEcharts, name, data, adcode)
    }
  })

  const data = await getData('china', 100000)

  setOption(myEcharts, 'china', data, 100000)
})

const back = async () => {
  const myEcharts = echartsBox.value && echarts.getInstanceByDom(echartsBox.value)
  if (mapList.value.length > 2) {
    const { name, adcode } = mapList.value[mapList.value.length - 2]
    mapList.value.splice(-2, 2)
    const data = await getData(name, adcode)

    if (myEcharts) setOption(myEcharts, name, data, adcode)
  } else if (mapList.value.length <= 2) {
    mapList.value = []
    const data = await getData('china', 100000)

    if (myEcharts) setOption(myEcharts, 'china', data, 100000)
  }
}

// 设置echarts属性
function setOption(myEchartsI: ECharts, name: string, data: any, adcode: number) {
  echarts.registerMap(name, data)
  const mapdata = data.features.map((item: any) => {
    return item.properties
  })
  console.log(mapdata)
  const option = {
    // tooltip 提示配置项
    tooltip: {
      formatter: function (params: any) {
        // 根据需要进行数据处理或格式化操作
        if (params && params.data) {
          const { adcode, name, level } = params.data
          console.log(adcode, name, level)
          // 返回自定义的tooltip内容
          return `${name}`
        }
      },
    },
    // tooltip: {
    //   trigger: 'item',
    // },
    // 地理坐标系组件用于地图的绘制
    geo: [
      {
        // 使用 registerMap 注册的地图名称。
        map: name,
        // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移，可以设置成 'scale' 或者 'move'。设置成 true 为都开启
        roam: true,
        // 图形上的文本标签，可用于说明图形的一些数据信息，比如值，名称等。
        // selectedMode: 'single',
        // 保持居中
        center: ['50%', '50%'],
        label: {
          show: true,
          color: '#dcdcdc',
          fontSize: 8,
        },
        // 地图区域的多边形 图形样式。
        itemStyle: {
          areaColor: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#061E3D' },
              { offset: 1, color: '#061E3D' },
            ],
          },
          borderColor: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              { offset: 0, color: '#00F6FF' },
              { offset: 1, color: '#87ADCB' },
            ],
            false,
          ),
          shadowColor: 'rgba(10,76,139,1)',
          shadowOffsetY: 0,
          shadowBlur: 10,
          borderWidth: 1,
        },
        // 设置高亮状态下的多边形和标签样式
        emphasis: {
          label: {
            color: '#fff',
            show: true,
            fontSize: 12,
          },
          itemStyle: {
            areaColor: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#073684' },
                { offset: 1, color: '#2B91B7' },
              ],
            },
          },
          focus: 'self',
        },
      },
    ],
    series: [
      {
        type: 'map',
        selectedMode: false,
        map: name,
        geoIndex: 0,
        roam: true,
        data: mapdata,
      },
    ],
  }

  myEchartsI.setOption(option)

  // 记录当前位置
  mapList.value.push({ name, adcode })
}

// 获取数据
async function getData(name: string, adcode: number) {
  const response = await fetch(`/json/geoJson/${adcode}_full.json`)

  // TODO: 判断是否成功

  return await response.json()
}

// 获取地图数据
</script>
<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  background: url('/images/bg.png') no-repeat;
  background-size: 100% 100%;
}
.btn {
  position: absolute;
  top: 20px;
  left: 20px;
}
</style>
