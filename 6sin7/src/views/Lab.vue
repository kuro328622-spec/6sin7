<script setup lang="ts">
import { useRouter } from 'vue-router'

// 1. 获取路由实例
const router = useRouter()

// 2. 定义跳转函数
const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="p-10 text-white min-h-screen bg-slate-900">
    <h1 class="text-2xl font-bold">🧪 实验场</h1>
    <p class="mt-4 text-slate-400">这里将用来测试 Axios 拦截器和 AI Agent。</p>
    
    <el-button @click="goBack" class="mt-6" type="info" plain>
      返回首页
    </el-button>
  </div>
</template>