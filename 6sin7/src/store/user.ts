import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const isPixelMode = ref(false)

  // 动作
  const applyPixelMode = () => {
    if (isPixelMode.value) {
      document.documentElement.classList.add('is-pixel-art')
    } else {
      document.documentElement.classList.remove('is-pixel-art')
    }
  }

  const togglePixelMode = () => {
    isPixelMode.value = !isPixelMode.value
    applyPixelMode()
  }

  return {
    isPixelMode,
    applyPixelMode,
    togglePixelMode
  }
}, {
  persist: true
})