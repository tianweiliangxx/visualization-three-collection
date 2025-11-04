// src/utils/DynamicWallMaterialProperty.js
import * as Cesium from 'cesium'

/**
 * 获取或创建数据源（显式传入 viewer）
 * @param {Cesium.Viewer} viewer - Cesium 实例
 * @param {string} datasouceName - 数据源名称
 * @returns {Cesium.CustomDataSource} 数据源实例
 */
export function map_common_addDatasouce(viewer, datasouceName) {
  let datasouce = viewer.dataSources._dataSources.find((t) => {
    return t && t.name === datasouceName
  })
  if (!datasouce) {
    datasouce = new Cesium.CustomDataSource(datasouceName)
    viewer.dataSources.add(datasouce)
  }
  return datasouce
}

/**
 * 动态墙材质类
 * @param {Object} options - 配置项
 * @param {Cesium.Color} options.color - 颜色
 * @param {number} options.duration - 动画周期（毫秒）
 * @param {string} options.trailImage - 贴图地址（可选）
 */
export class DynamicWallMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._colorSubscription = undefined
    this.color = options.color || Cesium.Color.BLUE // 显式使用 Cesium.Color
    this.duration = options.duration || 1000
    this.trailImage = options.trailImage
    this._time = new Date().getTime()

    // 生成唯一材质类型标识（避免重复）
    this.MaterialType = `wallType_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    this._registerMaterial() // 注册材质
  }

  /**
   * 生成带方向的墙体着色器
   * @param {Object} options - 着色器配置
   * @returns {string} GLSL 着色器代码
   */
  _getDirectionWallShader(options) {
    if (options && options.get) {
      let materail = `czm_material czm_getMaterial(czm_materialInput materialInput)
      {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;`
      if (options.freely === 'vertical') {
        // 垂直方向（由下到上）
        materail += `vec4 colorImage = texture(image, vec2(fract(st.s), fract(float(${options.count})*st.t${options.direction} time)));\n`
      } else {
        // 水平方向（逆时针）
        materail += `vec4 colorImage = texture(image, vec2(fract(float(${options.count})*st.s ${options.direction} time), fract(st.t)));\n`
      }
      // 泛光效果
      materail += `vec4 fragColor;
          fragColor.rgb = (colorImage.rgb + color.rgb) / 1.0;
          fragColor = czm_gammaCorrect(fragColor);
          material.diffuse = colorImage.rgb;
          material.alpha = colorImage.a;
          material.emission = fragColor.rgb;
          return material;
      }`
      return materail
    }
  }

  /**
   * 注册材质到 Cesium 材质缓存
   */
  _registerMaterial() {
    Cesium.Material._materialCache.addMaterial(this.MaterialType, {
      fabric: {
        type: this.MaterialType,
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.1),
          image: Cesium.Material.DefaultImageId,
          time: -20,
        },
        source: this._getDirectionWallShader({
          get: true,
          count: 2.0,
          freely: 'vertical',
          direction: '-',
        }),
      },
      translucent: function (material) {
        return true
      },
    })
  }

  // 实现 Cesium.MaterialProperty 接口
  getType() {
    return this.MaterialType
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrClonedDefault(
      this._color,
      time,
      Cesium.Color.WHITE,
      result.color,
    )
    result.image = this.trailImage || Cesium.Material.DefaultImageId
    if (this.duration) {
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration
    }
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof DynamicWallMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    )
  }
}

// 给原型添加必要的属性描述符（实现 Cesium 接口规范）
Object.defineProperties(DynamicWallMaterialProperty.prototype, {
  isConstant: {
    get: function () {
      return false
    },
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged
    },
  },
  color: Cesium.createPropertyDescriptor('color'),
})
