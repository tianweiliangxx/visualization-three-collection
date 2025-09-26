<template>
  <div class="smartCity">
    <div class="map" ref="mapContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  TencentImageryProvider,
  type TencentImageryProviderOptions,
} from '@cesium-china/cesium-map'

// 地图容器dom
const mapContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  const viewer = initMap()
  // 清除默认底图
  viewer.imageryLayers.remove(viewer.imageryLayers.get(0))
  // 清除默认地形
  viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
  // 加载单张图片
  const imageryProvider = new Cesium.SingleTileImageryProvider({
    url: '/images/cesium/world_b.jpg',
    tileWidth: 8176,
    tileHeight: 4032,
  })
  viewer.imageryLayers.addImageryProvider(imageryProvider)

  const options = {
    crs: 'WGS84', // 使用84坐标系，默认为：GCJ02
    style: 4,
  }
  viewer.imageryLayers.add(
    new Cesium.ImageryLayer(new TencentImageryProvider(<TencentImageryProviderOptions>options)),
  )
})

// 初始化地球
function initMap() {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZDZkNmIwYi0wMTlkLTQzNmQtOGE0Yy00MGI4OTcxYjQwMmEiLCJpZCI6MTYxNTY5LCJpYXQiOjE2OTI1ODYxNDZ9.l_jsbRiee3ChY2oU2CgBFj3wVyjTKU3N60LBecpwqzw'
  const viewer = new Cesium.Viewer(mapContainer.value!, {
    // terrain: Cesium.Terrain.fromWorldTerrain(),
    animation: true, //是否创建动画小器件，左下角仪表

    baseLayerPicker: false, //是否显示图层选择器
    fullscreenButton: false, //是否显示全屏按钮
    geocoder: false, //是否显示geocoder小器件，右上角查询按钮
    homeButton: false, //是否显示Home按钮
    infoBox: false, //是否显示信息框
    sceneModePicker: false, //是否显示3D/2D选择器
    selectionIndicator: false, //是否显示选取指示器组件
    timeline: true, //是否显示时间轴
    navigationHelpButton: false, //是否显示右上角的帮助按钮
    scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
    // clock: new Cesium.Clock(), //用于控制当前时间的时钟对象
    selectedImageryProviderViewModel: undefined, //当前图像图层的显示模型，仅baseLayerPicker设为true有意义
    // imageryProviderViewModels: Cesium.createDefaultImageryProviderViewModels(), //可供BaseLayerPicker选择的图像图层ProviderViewModel数组
    selectedTerrainProviderViewModel: undefined, //当前地形图层的显示模型，仅baseLayerPicker设为true有意义
    // terrainProviderViewModels: Cesium.createDefaultTerrainProviderViewModels(), //可供BaseLayerPicker选择的地形图层ProviderViewModel数组
    fullscreenElement: document.body, //全屏时渲染的HTML元素,
    useDefaultRenderLoop: true, //如果需要控制渲染循环，则设为true
    targetFrameRate: undefined, //使用默认render loop时的帧率
    showRenderLoopErrors: false, //如果设为true，将在一个HTML面板中显示错误信息
    automaticallyTrackDataSourceClocks: true, //自动追踪最近添加的数据源的时钟设置

    contextOptions: {
      // 支持html2cavas截图
      webgl: {
        preserveDrawingBuffer: true, // 设置为 true 来启用
      },
    },

    //传递给Scene对象的上下文参数（scene.options）
    sceneMode: Cesium.SceneMode.SCENE3D, //初始场景模式
    mapProjection: new Cesium.WebMercatorProjection(), //地图投影体系
    dataSources: new Cesium.DataSourceCollection(),
  })

  return viewer
}
</script>
<style lang="scss" scoped>
.smartCity {
  width: 100%;
  height: 100%;
  .map {
    width: 100%;
    height: 100%;
  }
}
</style>
