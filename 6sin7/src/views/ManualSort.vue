<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import confetti from 'canvas-confetti'

interface Bar {
  id: number
  value: number
  isDragging: boolean
  offsetX: number
}

const bars = ref<Bar[]>([])
const barCount = ref(8)
const minValue = ref(10)
const maxValue = ref(100)
const draggedId = ref<number | null>(null)
const dragStartX = ref(0)
const audioContext = ref<AudioContext | null>(null)
const containerRect = ref<DOMRect | null>(null)
const wasSorted = ref(false) // 用于追踪上一次的排序状态

const maxBarValue = computed(() => Math.max(...bars.value.map(b => b.value), 1))

// 检测排序是否完成（从小到大）
const isSorted = computed(() => {
  if (bars.value.length === 0) return false
  return bars.value.every((bar, index) => {
    if (index === 0) return true
    return bar.value >= bars.value[index - 1].value
  })
})

// 监听排序完成状态
watch(isSorted, (newVal) => {
  if (newVal && !wasSorted.value) {
    // 从未排序 -> 已排序：触发彩带和音效
    triggerConfettiWithSound()
    wasSorted.value = true
  } else if (!newVal && wasSorted.value) {
    // 从已排序 -> 未排序：重置状态
    wasSorted.value = false
  }
})

const initializeAudio = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
}

// 生成不重复的随机数数组
const generateUniqueRandomNumbers = (count: number, min: number, max: number): number[] => {
  const range = max - min + 1
  
  if (count >= range) {
    return Array.from({ length: range }, (_, i) => min + i).sort(() => Math.random() - 0.5)
  }
  
  const numbers: number[] = []
  const used = new Set<number>()
  
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * range) + min
    if (!used.has(num)) {
      numbers.push(num)
      used.add(num)
    }
  }
  
  return numbers
}

const generateBars = () => {
  const values = generateUniqueRandomNumbers(barCount.value, minValue.value, maxValue.value)
  bars.value = Array.from({ length: barCount.value }, (_, i) => ({
    id: i,
    value: values[i],
    isDragging: false,
    offsetX: 0
  }))
  wasSorted.value = isSorted.value // 初始化时检查是否已排序
}

const resetBars = () => generateBars()

const playSound = (frequency: number, duration: number = 0.1) => {
  if (!audioContext.value) return
  const ctx = audioContext.value
  if (ctx.state === 'suspended') ctx.resume()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(frequency, now)
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration)
  osc.start(now)
  osc.stop(now + duration)
}

// 像素风彩带效果函数
const triggerConfetti = () => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    shapes: ['square'], // 使用方形，更符合像素风
    colors: ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa']
  }

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    })
  }

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

// 彩带 + 音效联动
const triggerConfettiWithSound = () => {
  // 播放胜利音效
  playSound(523.25, 0.2) // C5
  setTimeout(() => playSound(659.25, 0.2), 150) // E5
  setTimeout(() => playSound(783.99, 0.4), 300) // G5
  
  triggerConfetti()
}

const handleMouseDown = (barId: number, event: MouseEvent) => {
  initializeAudio()
  draggedId.value = barId
  dragStartX.value = event.clientX
  
  const container = document.querySelector('.bars-container') as HTMLElement
  if (container) {
    containerRect.value = container.getBoundingClientRect()
  }
  
  const bar = bars.value.find(b => b.id === barId)
  if (bar) {
    bar.isDragging = true
    playSound(200, 0.08)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (draggedId.value === null || !containerRect.value) return
  
  const bar = bars.value.find(b => b.id === draggedId.value)
  if (!bar) return
  
  const deltaX = event.clientX - dragStartX.value
  bar.offsetX = deltaX
  
  if (Math.random() > 0.95) playSound(200, 0.05)
}

const handleMouseUp = () => {
  if (draggedId.value === null) return
  
  const bar = bars.value.find(b => b.id === draggedId.value)
  if (!bar || !containerRect.value) return
  
  const totalGap = (barCount.value - 1) * 8
  const availableWidth = containerRect.value.width - 32
  const barWidth = (availableWidth - totalGap) / barCount.value
  
  const draggedIndex = bars.value.findIndex(b => b.id === draggedId.value)
  const targetPosition = draggedIndex * (barWidth + 8) + bar.offsetX
  const targetIndex = Math.round(targetPosition / (barWidth + 8))
  const validTargetIndex = Math.max(0, Math.min(targetIndex, barCount.value - 1))
  
  if (validTargetIndex !== draggedIndex) {
    const draggedBar = bars.value.splice(draggedIndex, 1)[0]
    bars.value.splice(validTargetIndex, 0, draggedBar)
    playSound(400, 0.1)
  }
  
  bar.isDragging = false
  bar.offsetX = 0
  draggedId.value = null
  dragStartX.value = 0
  containerRect.value = null
}

onMounted(() => {
  generateBars()
  initializeAudio()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

const updateBarCount = () => {
  generateBars()
}

const updateRange = () => {
  generateBars()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 font-sans">
    <div class="max-w-7xl mx-auto">
      <!-- 标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          手动排序 (Manual Sort)
        </h1>
        <p class="text-slate-400">
          拖拽柱体进行排序，体验弹性动画和实时音效反馈
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧设置面板 -->
        <div class="lg:col-span-1">
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-8">
            <h2 class="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span class="text-sky-400">⚙️</span>
              设置面板
            </h2>

            <!-- 柱体数量设置 -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-300 mb-3">
                柱体数量
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="barCount"
                  type="range"
                  min="3"
                  max="20"
                  @change="updateBarCount"
                  class="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <span class="text-sky-400 font-bold w-12 text-right">{{ barCount }}</span>
              </div>
            </div>

            <!-- 数值范围设置 -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-300 mb-3">
                最小值
              </label>
              <input
                v-model.number="minValue"
                type="number"
                @change="updateRange"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-300 mb-3">
                最大值
              </label>
              <input
                v-model.number="maxValue"
                type="number"
                @change="updateRange"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <!-- 重置按钮 -->
            <button
              @click="resetBars"
              class="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              🔄 重置排序
            </button>

            <!-- 提示信息 -->
            <div class="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p class="text-xs text-slate-400 leading-relaxed">
                <span class="text-emerald-400 font-semibold">💡 提示：</span>
                点击并拖拽柱体来交换它们的位置。您会听到音效反馈，并看到平滑的弹性动画。
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧排序可视化区域 -->
        <div class="lg:col-span-3">
          <div class="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <!-- 排序容器 -->
            <div
              class="bars-container relative w-full bg-gradient-to-b from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden"
              style="height: 400px"
              @mouseup="handleMouseUp"
            >
              <!-- 柱体 -->
              <div class="absolute inset-0 flex items-end justify-start gap-2 p-4 w-full h-full">
                <transition-group
                  name="bar"
                  tag="div"
                  class="flex items-end justify-start gap-2 w-full h-full"
                >
                  <div
                    v-for="(bar) in bars"
                    :key="bar.id"
                    class="flex-1 relative group cursor-grab active:cursor-grabbing h-full flex items-end bar-wrapper"
                    @mousedown="handleMouseDown(bar.id, $event)"
                    :style="{
                      transform: bar.isDragging ? `translateX(${bar.offsetX}px)` : 'translateX(0)',
                      zIndex: bar.isDragging ? 50 : 0,
                    }"
                  >
                    <!-- 柱体背景 -->
                    <div
                      class="bar-element w-full rounded-t-lg transition-all"
                      :style="{
                        height: `${(bar.value / maxBarValue) * 100}%`,
                        backgroundColor: bar.isDragging
                          ? 'rgb(59, 130, 246)' // 拖拽时为蓝色
                          : isSorted ? 'rgb(16, 185, 129)' : 'rgb(34, 197, 94)', // 排序完成时颜色微调
                        boxShadow: bar.isDragging
                          ? '0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                          : '0 4px 12px rgba(0, 0, 0, 0.3)',
                        transform: bar.isDragging ? 'scale(1.05, 1) translateY(-5px)' : 'scale(1)',
                      }"
                    />

                    <!-- 柱体数值标签 -->
                    <div
                      class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-slate-300 whitespace-nowrap pointer-events-none transition-opacity duration-200"
                      :class="bar.isDragging ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'"
                    >
                      {{ bar.value }}
                    </div>

                    <!-- 悬停效果 -->
                    <div
                      class="absolute bottom-0 left-0 right-0 rounded-t-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                      :style="{
                        height: `${(bar.value / maxBarValue) * 100}%`,
                        backgroundColor: 'rgb(255, 255, 255)',
                      }"
                    />
                  </div>
                </transition-group>
              </div>

              <!-- 网格线 -->
              <div class="absolute inset-0 pointer-events-none opacity-10">
                <div class="absolute inset-0 flex flex-col justify-between">
                  <div v-for="i in 5" :key="`h-${i}`" class="border-t border-slate-400 flex-1" />
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <p class="text-xs text-slate-400 mb-1">柱体数量</p>
                <p class="text-2xl font-bold text-sky-400">{{ barCount }}</p>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <p class="text-xs text-slate-400 mb-1">最大值</p>
                <p class="text-2xl font-bold text-emerald-400">{{ maxBarValue }}</p>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-4 text-center">
                <p class="text-xs text-slate-400 mb-1">值范围</p>
                <p class="text-sm font-bold text-purple-400">{{ minValue }} - {{ maxValue }}</p>
              </div>
            </div>

            <!-- 排序完成提示 -->
            <transition name="fade">
              <div v-if="isSorted" class="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                <span class="text-2xl">🎉</span>
                <p class="text-emerald-400 font-bold tracking-wide">
                  恭喜！排序已完美完成
                </p>
                <span class="text-2xl">🎉</span>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 柱体容器 - 拖拽时平滑移动 */
.bar-wrapper {
  transition: transform 0.1s ease-out;
}

.bar-wrapper.active {
  transition: none; /* 拖拽时禁用过渡，实现实时跟随 */
}

/* 平滑过渡 - 弹性动画 */
.bar-element {
  transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              background-color 0.3s ease,
              box-shadow 0.3s ease,
              transform 0.2s ease;
  will-change: height, transform;
}

/* 悬停时的光标变化 */
.cursor-grab {
  cursor: grab;
}

.cursor-grab:active {
  cursor: grabbing;
}

/* transition-group 动画 */
.bar-move {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 渐变动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .bars-container {
    height: 300px !important;
  }
}

@media (max-width: 640px) {
  .bars-container {
    height: 250px !important;
  }
}
</style>
