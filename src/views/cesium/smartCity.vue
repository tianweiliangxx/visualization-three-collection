<template>
  <div class="smartCity">
    <div class="map" ref="mapContainer" id="mapContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import CircleScanSystem from '@/utils/cesium/CircleScanSystem.ts'

import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  TencentImageryProvider,
  type TencentImageryProviderOptions,
} from '@cesium-china/cesium-map'

import FireEffect from '@/utils/cesium/effect/FireEffect.js'
import SmokeEffect from '@/utils/cesium/effect/SmokeEffect.js'
import Popup from '@/utils/cesium/Popup'
// 地图容器dom
const mapContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  const viewer = initMap()

  loadBaseMap(viewer)

  loadSatellite(viewer)

  entryAnimation(viewer, () => {
    load3dtiles(viewer)

    loadEffect(viewer)

    loadAirplane(viewer)

    loadMsg(viewer)
  })
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
    imageryProviderViewModels: Cesium.createDefaultImageryProviderViewModels(), //可供BaseLayerPicker选择的图像图层ProviderViewModel数组
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

// 加载底图
function loadBaseMap(viewer: Cesium.Viewer) {
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
    // crs: 'WGS84', // 插件bug：WGS84对应的是GCJ02坐标系
    style: '4',
  }
  viewer.imageryLayers.add(new Cesium.ImageryLayer(new TencentImageryProvider(options)))
}

// 加载卫星
async function loadSatellite(viewer: Cesium.Viewer) {
  const czmldata = new Cesium.CzmlDataSource().load('/czml/wx.czml')
  await viewer.dataSources.add(czmldata)
  viewer.clock.shouldAnimate = true
}

// 进场动画
function entryAnimation(viewer: Cesium.Viewer, callback?: () => void) {
  const inters = 3
  let lon = 110
  let quan = 1
  const timer = setInterval(() => {
    lon = lon - inters
    if (lon < -180) {
      lon = 180
      quan = quan + 1
    }
    if (quan == 2 && lon > 110) {
      clearInterval(timer)
      // 第一层，地球自传
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(110, 10, 50000000.0),
        orientation: {
          heading: Cesium.Math.toRadians(358.0),
          pitch: Cesium.Math.toRadians(-89.5),
          roll: 0.0,
        },
        easingFunction: Cesium.EasingFunction.LINEAR_NONE,
        complete: () => {
          // 第二层 视角跳到指定位置
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.549708, 25.036475, 2662.5),
            // easingFunction: Cesium.EasingFunction.LINEAR_NONE,
            duration: 5,
            orientation: {
              heading: Cesium.Math.toRadians(2.8),
              pitch: Cesium.Math.toRadians(-84.8),
              roll: 0.0,
            },
            complete: callback,
          })
        },
      })
    } else {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lon, 10, 50000000.0),
        orientation: {
          heading: Cesium.Math.toRadians(358.0),
          pitch: Cesium.Math.toRadians(-89.5),
          roll: 0.0,
        },
      })
    }
  }, 30)
}

// 加载3dtiles数据
async function load3dtiles(viewer: Cesium.Viewer) {
  const tileset = await Cesium.Cesium3DTileset.fromUrl('/data/tileset.json')
  viewer.scene.primitives.add(tileset)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(121.549884, 25.025771, 1050.6),
    duration: 2,
    orientation: {
      heading: Cesium.Math.toRadians(0.7),
      pitch: Cesium.Math.toRadians(-38.7),
      roll: 0.0,
    },
  })

  customShader(viewer, tileset)

  // 添加自定义着色器
  function customShader(viewer: Cesium.Viewer, tileset: Cesium.Cesium3DTileset) {
    tileset.customShader = new Cesium.CustomShader({
      fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                            vec3 positionMC = fsInput.attributes.positionMC;
                            material.diffuse = vec3(0.0, 1.0-positionMC.y*0.005, 1.0-positionMC.y*0.0015);

                            float _baseHeight = 18.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
                            float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _heightRange) 默认是 0-60米
                            float _glowRange = 120.0; // 光环的移动范围(高度)

                            float vtxf_height = fsInput.attributes.positionMC.y - _baseHeight;
                            float vtxf_a11 = fract(czm_frameNumber / 360.0) * 3.14159265 * 2.0; //此处括号内分母为移动速度
                            float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
                            material.diffuse *= vec3(vtxf_a12, vtxf_a12, vtxf_a12);

                            float vtxf_a13 = fract(czm_frameNumber / 360.0); //此处括号内分母为移动速度，数值越大，速度越慢
                            float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
                            vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
                            float vtxf_diff = step(0.01, abs(vtxf_h - vtxf_a13)); // 0.1 为高亮光条的范围（粗细）
                            material.diffuse += material.diffuse * (1.0 - vtxf_diff);
                        }`,
    })
    viewer.scene.globe.depthTestAgainstTerrain = true //（开启）
  }
}

// 加载特效
function loadEffect(viewer: Cesium.Viewer) {
  new CircleScanSystem(viewer, {
    type: 'Circle',
    lon: '121.554532',
    lat: '25.042364',
    radius: 100,
  })
  // var circleScanSystem1 = new CircleScanSystem(viewer, {
  //   type: "Circle",
  //   lon: "121.552956",
  //   lat: "25.037859",
  //   radius: 100,
  // });
  new CircleScanSystem(viewer, {
    type: 'Radar',
    lon: '121.5463',
    lat: '25.041775',
    radius: 200,
  })
  new CircleScanSystem(viewer, {
    type: 'Radar',
    lon: '121.55649',
    lat: '25.034101',
    radius: 80,
  })
  // 火效果
  new FireEffect(viewer, {
    lng: 121.55001,
    lat: 25.039343,
  })
  new FireEffect(viewer, {
    lng: 121.551034,
    lat: 25.036803,
  })
  // 烟效果
  new SmokeEffect(viewer, {
    lng: 121.551034,
    lat: 25.036803,
  })
}

// 加载飞机
function loadAirplane(viewer: Cesium.Viewer) {
  let start = new Cesium.JulianDate.fromDate(new Date())

  // 开始时间  cesium用的JulianDate:代表天文朱利安时间,用的是世界协调时,比北京时间晚8个小时, 加上东8时，就是当前的真正时间
  start = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate())
  const center = Cesium.JulianDate.addSeconds(start, 90, new Cesium.JulianDate())
  const center2 = Cesium.JulianDate.addSeconds(start, 180, new Cesium.JulianDate())
  const center3 = Cesium.JulianDate.addSeconds(start, 270, new Cesium.JulianDate())
  const stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate())

  // 设置时钟范围
  viewer.clock.startTime = start.clone()
  viewer.clock.stopTime = stop.clone()
  viewer.clock.currentTime = start.clone()

  // 循环结束时后续动作
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP

  // 时间速率控制速度，时间调快多少倍，比如原来用时360秒，调整10倍后，现在用时36秒
  viewer.clock.multiplier = 10
  //给下方时间线设置边界
  viewer.timeline.zoomTo(start, stop)

  const position = new Cesium.SampledPositionProperty()
  const position_cone = new Cesium.SampledPositionProperty()

  const startPos = Cesium.Cartesian3.fromDegrees(121.54502359550423, 25.04103506115554, 300)
  const centerPos = Cesium.Cartesian3.fromDegrees(121.55653842563282, 25.040757514098885, 300)
  const centerPos2 = Cesium.Cartesian3.fromDegrees(121.55626812445513, 25.033279833487114, 300)
  const centerPos3 = Cesium.Cartesian3.fromDegrees(121.54412259158227, 25.0335247429108, 300)
  const endPos = Cesium.Cartesian3.fromDegrees(121.54502359550423, 25.04103506115554, 300)

  const startPos_cone = Cesium.Cartesian3.fromDegrees(121.54502359550423, 25.04103506115554, 210)
  const centerPos_cone = Cesium.Cartesian3.fromDegrees(121.55653842563282, 25.040757514098885, 210)
  const centerPos2_cone = Cesium.Cartesian3.fromDegrees(121.55626812445513, 25.033279833487114, 210)
  const centerPos3_cone = Cesium.Cartesian3.fromDegrees(121.54412259158227, 25.0335247429108, 210)
  const endPos_cone = Cesium.Cartesian3.fromDegrees(121.54502359550423, 25.04103506115554, 210)

  position.addSample(start, startPos)
  position.addSample(center, centerPos)
  position.addSample(center2, centerPos2)
  position.addSample(center3, centerPos3)
  position.addSample(stop, endPos)

  position_cone.addSample(start, startPos_cone)
  position_cone.addSample(center, centerPos_cone)
  position_cone.addSample(center2, centerPos2_cone)
  position_cone.addSample(center3, centerPos3_cone)
  position_cone.addSample(stop, endPos_cone)

  console.log(Cesium.SceneTransforms)

  // 飞机模型
  viewer.entities.add({
    // 将实体availability设置为与模拟时间相同的时间间隔。
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    position: position, // 计算实体位置属性
    orientation: new Cesium.VelocityOrientationProperty(position),
    model: {
      uri: '/data/missile/scene.gltf',
      scale: 10,
      minimumPixelSize: 32,
    },

    // 路径
    path: {
      show: false,
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.BLUE,
      }),
      width: 5,
    },
  })
  // 模拟飞机扫描区域
  viewer.entities.add({
    // 将实体availability设置为与模拟时间相同的时间间隔。
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    position: position_cone, // 计算实体位置属性
    orientation: new Cesium.VelocityOrientationProperty(position),
    // model: {
    //   uri: 'missile/scene.gltf',
    //   scale: 10,
    //   minimumPixelSize: 32
    // },
    cylinder: {
      material: Cesium.Color.fromCssColorString('rgba(255,240,0, 0.35)'),
      length: 200, //圆柱体的长度
      topRadius: 0, //顶部半径
      bottomRadius: 70,
    },
    // 路径
    path: {
      show: false,
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.BLUE,
      }),
      width: 5,
    },
  })
}

// 加载弹窗信息
function loadMsg(viewer: Cesium.Viewer) {
  console.log(viewer)
  const popup = new Popup({
    viewer: viewer,
    className: 'bx-popup-ctn2',
  })

  console.log(popup)
  popup.add({
    geometry: Cesium.Cartesian3.fromDegrees(121.551034, 25.036803, 30),
    content: {
      header: '事件提醒',
      content: `
              <div><span>事件名称：</span><span>沃尔玛发生火灾</span></div>
              <div><span>监控编号：</span><span>${parseInt(String(Math.random() * 100))}</span></div>
              <div><span>发生时间：</span><span>2024-08-03 12:00:33</span></div>
              <div><span>火灾等级：</span><span>一般</span></div>
                  `,
    },
    isclose: true,
  })

  popup.add({
    // lon: "121.554532",
    // lat: "25.042364",
    geometry: Cesium.Cartesian3.fromDegrees(121.554532, 25.042364, 30),
    content: {
      header: '事件提醒',
      content: `
              <div><span>事件名称：</span><span>仁和路发生打架斗殴</span></div>
              <div><span>监控编号：</span><span>${parseInt(String(Math.random() * 100))}</span></div>
              <div><span>发生时间：</span><span>2024-08-03 14:00:33</span></div>
              <div><span>案件等级：</span><span>紧急！</span></div>
                  `,
    },
    isclose: true,
  })
}
</script>
<style lang="scss">
.smartCity {
  width: 100%;
  height: 100%;
  .map {
    width: 100%;
    height: 100%;
  }

  .bx-popup-ctn2 {
    position: absolute;
    z-index: 999;
    color: #fff;
    /* margin: -80px 0 0; */
    margin: 0 0 0 0;
    transform: translate(-50%, -100%);
  }

  .bx-popup-ctn2 .divpoint-wrap {
    padding: 0;
    width: max-content;
  }

  .bx-popup-ctn2 .divpoint-center {
    background: linear-gradient(
      45deg,
      #4f869d,
      rgba(18, 93, 120, 0.65),
      40%,
      rgba(30, 127, 162, 0.65)
    );
    border: 1px solid #40aee2;
    border-radius: 5px;
    box-shadow: 0 0 10px 2px #29baf1;
  }

  .bx-popup-ctn2 .bx-popup-tip {
    width: 17px;
    background: #fff;
    height: 17px;
    padding: 1px;
    margin: -10px auto 0;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .bx-popup-ctn2 .bx-popup-header-ctn {
    background: rgba(0, 173, 255, 0.49);
    color: #fff;
    font-size: 15px;
    padding: 4px;
  }

  .bx-popup-ctn2 .bx-popup-close {
    position: absolute;
    top: 4px;
    right: 2px;
    width: 26px;
    height: 26px;
    cursor: pointer;
  }

  .bx-popup-ctn2 .bx-popup-content-ctn {
    padding: 10px;
  }

  .bx-popup-ctn2 .directional {
    bottom: 0;
    left: 0;
    width: 2px;
    height: 40px;
    background-color: #28bbf0;
    transform: none;
    margin: 0 0 0px 50%;
  }

  .bx-popup-ctn2 .divpoint-border {
    transition: 0.3s ease-in;
    background:
      linear-gradient(0, #8cdee5 2px, #8cdee5 0) no-repeat,
      linear-gradient(-90deg, #8cdee5 2px, #8cdee5 0) no-repeat,
      linear-gradient(-180deg, #8cdee5 2px, #8cdee5 0) no-repeat,
      linear-gradient(-270deg, #8cdee5 2px, #8cdee5 0) no-repeat;
    background-size:
      0 2px,
      2px 0,
      0 2px,
      2px 0;
    background-position:
      0 0,
      100% 0,
      100% 100%,
      0 100%;
  }

  .bx-popup-ctn2 .divpoint-border:hover {
    background-size:
      100% 2px,
      2px 100%,
      100% 2px,
      2px 100%;
  }
}
</style>
