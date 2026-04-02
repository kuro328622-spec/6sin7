import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' 
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    // 对应你目录里的 views/Home.vue
    component: () => import('../views/Home.vue') 
  },
  {
    path: '/lab',
    name: 'Lab',
    // 对应你目录里的 views/Lab.vue
    component: () => import('../views/Lab.vue')
  },
  {
    path: '/manual-sort',
    name: 'ManualSort',
    // 对应你目录里的 views/ManualSort.vue
    component: () => import('../views/ManualSort.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
