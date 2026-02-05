<template>
  <div class="relative z-50">
    <button
      @click="showStats = !showStats"
      class="relative overflow-hidden bg-white/90 dark:bg-stone-800/90 backdrop-blur-md pl-6 pr-6 py-3 rounded-full shadow-lg border border-stone-200 dark:border-stone-700 flex items-center gap-4 text-sm font-semibold text-stone-800 dark:text-stone-200 tabular-nums min-w-[300px] justify-center hover:bg-white dark:hover:bg-stone-800 transition-all"
    >
      <span class="whitespace-nowrap relative z-10">Correct: {{ store.score }}</span>
      <span class="text-stone-300 dark:text-stone-600 relative z-10">|</span>
      <span class="whitespace-nowrap relative z-10">Total: {{ store.attempts }}</span>
      <span class="text-stone-300 dark:text-stone-600 relative z-10">|</span>
      <span class="text-primary dark:text-green-400 font-bold relative z-10">{{ percentage }}%</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 text-stone-400 transition-transform duration-200 ml-1"
        :class="{ 'rotate-180': showStats }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Stats Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="showStats"
        class="absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-4 max-h-[400px] overflow-y-auto"
      >
        <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 px-2">
          Accuracy by Party
        </h3>
        <div class="space-y-3 mb-4">
          <div
            v-for="(stats, party) in store.partyStats"
            :key="party"
            class="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700/50"
          >
            <span
              class="font-bold w-12 text-sm"
              :class="partyColors[party] || 'text-stone-800 dark:text-stone-200'"
            >
              {{ party }}
            </span>

            <div
              class="flex-1 mx-3 h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden"
            >
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getAccuracyColor(stats.correct, stats.attempts).bg"
                :style="{ width: calculatePercentage(stats.correct, stats.attempts) + '%' }"
              ></div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-stone-400 font-mono"
                >{{ stats.correct }}/{{ stats.attempts }}</span
              >
              <span
                class="font-mono text-sm font-bold w-10 text-right"
                :class="getAccuracyColor(stats.correct, stats.attempts).text"
              >
                {{ calculatePercentage(stats.correct, stats.attempts) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Total Progress Section -->
        <div class="border-t border-stone-200 dark:border-stone-700 my-3 mx-2"></div>

        <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 px-2">
          Total Progress
        </h3>
        <div class="px-2 pb-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold text-stone-800 dark:text-stone-200"
              >MPs Guessed</span
            >
            <span class="text-xs text-stone-500 dark:text-stone-400 font-mono">
              {{ store.history.length }} / {{ store.members.length }}
            </span>
          </div>
          <div class="h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden w-full">
            <div
              class="h-full bg-primary dark:bg-green-500 rounded-full transition-all duration-500"
              :style="{
                width:
                  store.members.length > 0
                    ? (store.history.length / store.members.length) * 100 + '%'
                    : '0%',
              }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { computed, ref } from 'vue'

const store = useGameStore()
const showStats = ref(false)

const partyColors: Record<string, string> = {
  LPC: 'text-[#D71920]',
  CPC: 'text-[#003F72] dark:text-[#5F9FDF]', // Lightened for dark mode visibility
  NDP: 'text-[#F37021]',
  BQ: 'text-[#33B2CC]',
  GPC: 'text-[#3D8E33]',
}

const percentage = computed(() => {
  if (store.attempts === 0) return 0
  return Math.round((store.score / store.attempts) * 100)
})

const calculatePercentage = (correct: number, total: number) => {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

const getAccuracyColor = (correct: number, total: number) => {
  if (total === 0) return { text: 'text-stone-400', bg: 'bg-stone-300 dark:bg-stone-600' }
  const pct = (correct / total) * 100
  if (pct >= 80) return { text: 'text-green-500', bg: 'bg-green-500' }
  if (pct >= 70) return { text: 'text-teal-500', bg: 'bg-teal-500' }
  if (pct >= 60) return { text: 'text-yellow-500', bg: 'bg-yellow-500' }
  if (pct >= 50) return { text: 'text-orange-500', bg: 'bg-orange-500' }
  return { text: 'text-red-500', bg: 'bg-red-500' }
}
</script>
