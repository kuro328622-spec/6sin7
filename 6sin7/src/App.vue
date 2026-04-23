<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from './store/user'

const userStore = useUserStore()

onMounted(() => {
  // 全局应用像素风状态
  userStore.applyPixelMode()
})
</script>

<style>
/* 全局样式：让背景色深色铺满全屏，避免切页闪白 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #0f172a; /* 对应 Tailwind 的 slate-900 */
}

/* 像素模式下的全局强制覆盖 */
.is-pixel-art, .is-pixel-art body, .is-pixel-art #app {
  /* 确保鼠标指针在任何地方都生效 */
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23fff' stroke='%23000' stroke-width='1' d='M10 2h4v2h2v2h2v2h2v2h2v12h-2v2h-2v2h-10v-2h-2v-2h-2v-12h2v-2h2v-2h2V2z'/%3E%3Cpath fill='%23000' d='M12 4h2v2h-2zM14 6h2v2h-2zM16 8h2v2h-2zM18 10h2v2h-2z'/%3E%3C/svg%3E"), auto !important;
}

.is-pixel-art body {
  background-color: #f7f1e3 !important;
}
</style>
