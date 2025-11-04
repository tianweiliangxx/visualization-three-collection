<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="config.sideWidth" class="aside">
        <el-scrollbar>
          <el-menu :default-openeds="['1', '3']" @select="handleSelect">
            <el-menu-item index="0" @click="handleClick('/')">
              <el-icon><icon-menu /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-sub-menu index="10">
              <template #title>
                <el-icon><icon-menu /></el-icon>echarts
              </template>
              <el-menu-item @click="handleClick('/drillDownMap')" index="1-1"
                >地图下钻效果</el-menu-item
              >
            </el-sub-menu>
            <el-sub-menu index="20">
              <template #title>
                <el-icon><icon-menu /></el-icon>Threejs
              </template>
              <el-menu-item @click="handleClick('/mapDisplay')" index="2-1" route="/mapDisplay"
                >地图展示</el-menu-item
              >
            </el-sub-menu>
            <el-sub-menu index="30">
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

.el-aside {
  border-right: 1px solid #e4e7ed;
}

.el-header {
  border-bottom: 1px solid #e4e7ed;
}

.el-main {
  padding: 0;
  overflow: hidden;
}
</style>
