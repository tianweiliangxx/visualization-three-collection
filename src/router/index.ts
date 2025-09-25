import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/index.vue'),
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'drillDownMap',
          name: 'drillDownMap',
          component: () => import('@/views/echarts/drill-down-map.vue'),
        },
        {
          path: 'mapDisplay',
          name: 'mapDisplay',
          component: () => import('@/views/three/mapDisplay.vue'),
        },
      ],
    },
  ],
})

export default router
