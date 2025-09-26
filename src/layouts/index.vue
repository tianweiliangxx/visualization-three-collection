<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="config.sideWidth">
        <el-scrollbar>
          <el-menu :default-openeds="['1', '3']" @select="handleSelect">
            <el-sub-menu index="1">
              <template #title>
                <el-icon><icon-menu /></el-icon>echarts
              </template>
              <el-menu-item @click="handleClick('/drillDownMap')" index="1-1"
                >地图下钻效果</el-menu-item
              >
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><icon-menu /></el-icon>Threejs
              </template>
              <el-menu-item @click="handleClick('/mapDisplay')" index="2-1" route="/mapDisplay"
                >地图展示</el-menu-item
              >
            </el-sub-menu>
            <el-sub-menu index="3">
              <template #title>
                <el-icon><icon-menu /></el-icon>Cesium
              </template>
              <el-menu-item @click="handleClick('/smartCity')" index="3-1" route="/mapDisplay"
                >智慧城市</el-menu-item
              >
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container>
        <el-header>这里是header暂时留白</el-header>
        <el-main :style="mainStyle">
          <router-view></router-view>
        </el-main>
        <!--        <el-footer>Footer</el-footer>-->
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { config } from '@/config/index.ts'
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mainStyle = {
  width: `calc(100vw - ${config.sideWidth})`,
  height: `calc(100vh - ${config.headerHeight})`,
}

// 激活菜单事件
const handleSelect = (event: any) => {
  console.log(event)
}

// 点击菜单事件
const handleClick = (path) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.el-menu {
  border-right: none;
}

.el-main {
  padding: 0;
  overflow: hidden;
}
</style>
