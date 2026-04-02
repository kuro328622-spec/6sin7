<script setup lang="ts">
import { useRouter } from 'vue-router'

// 定义响应式变量
const appName = '6sin7 研发实验室'

// 获取路由实例
const router = useRouter()

// 跳转函数
const handleEnterLab = () => {
  router.push('/lab')
}

const handleManualSort = () => {
  router.push('/manual-sort')
}

const openDocs = () => {
  window.open('https://element-plus.org/', '_blank' )
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
    
    <div class="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
      <h1 class="text-4xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-4 tracking-tight">
        {{ appName }}
      </h1>
      
      <p class="text-slate-400 mb-8 leading-relaxed">
        工程化环境：<span class="text-emerald-400 font-mono">Vite + Vue 3 + Tailwind v4</span> 已就绪。  

        代码规范已由 <span class="text-orange-400 font-mono">Husky</span> 守卫。
      </p>

      <div class="flex justify-center gap-4 flex-wrap">
        <el-button type="primary" size="large" round @click="handleEnterLab">
          进入实验场
        </el-button>
        
        <el-button type="success" size="large" round @click="handleManualSort">
          手动排序
        </el-button>
        
        <el-button type="info" size="large" round plain @click="openDocs">
          查看文档
        </el-button>
      </div>
      
      <div class="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        系统状态：核心引擎已启动
      </div>
    </div>
  </div>
</template>
