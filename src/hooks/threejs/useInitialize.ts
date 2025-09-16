import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import * as THREE from 'three'

type Handle = (
  scene: THREE.Scene,
  cameraRef: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) => void

export const useInitialize = (
  containerRef: Ref<HTMLDivElement | null>,
  initializeHandle?: Handle | null,
  resizeHandle?: Handle | null,
  renderHandle?: Handle | null,
) => {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let frameId = 0

  // 渲染循环函数
  const render = () => {
    if (scene && camera && renderer) {
      renderHandle && renderHandle(scene, camera, renderer)
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(render)
    }
  }

  const init = () => {
    if (containerRef.value) {
      const { clientWidth, clientHeight } = containerRef.value
      console.log(clientWidth, clientHeight)

      // 创建场景
      scene = new THREE.Scene()

      // 创建相机
      camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000)

      camera.position.set(0, 0, 10)

      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true })

      renderer.setSize(clientWidth, clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.shadowMap.enabled = true

      // 将canvas插入到页面
      containerRef.value.append(renderer.domElement)

      // 启动渲染
      render()
      console.log(123123)

      initializeHandle && initializeHandle(scene, camera, renderer)
    }
  }

  const onResize = () => {
    if (containerRef.value && scene && camera && renderer) {
      const { clientWidth, clientHeight } = containerRef.value

      // 更新相机
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()

      // 更新渲染器
      renderer.setSize(clientWidth, clientHeight)
      // 设置渲染器的像素比
      renderer.setPixelRatio(window.devicePixelRatio)

      resizeHandle && resizeHandle(scene, camera, renderer)
    }
  }

  // 组件挂载时初始化
  onMounted(() => {
    init()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    frameId && window.cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
  })

  return {
    scene,
    camera,
    renderer,
    resize: onResize,
  }
}
