<template>
  <router-view />
</template>

<script setup lang="ts">
// 这里暂时不需要写逻辑
</script>

<style>
/* 全局样式：让背景色深色铺满全屏，避免切页闪白 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #0f172a; /* 对应 Tailwind 的 slate-900 */
}
</style>