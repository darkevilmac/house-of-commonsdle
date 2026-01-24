<template>
  <div
    class="relative h-full max-h-[50vh] md:max-h-[55vh] max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 animate-slide-up mx-auto"
  >
    <div
      v-if="!currentMember"
      class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-stone-800"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <template v-else>
      <img
        :src="currentMember.imagePath"
        alt="MP image"
        class="w-full h-full object-cover object-top"
        @error="handleImageError"
      />

      <!-- Party Badge -->
      <div 
        class="absolute top-6 right-6 z-20 transition-all duration-300 transform"
        :class="isCorrect !== null ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
      >
        <div class="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-stone-200 dark:border-stone-700">
            <span class="text-stone-800 dark:text-white font-bold text-sm tracking-wide uppercase">
                {{ currentMember.party }}
            </span>
        </div>
      </div>

      <div
        class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-32 text-center pointer-events-none"
        v-if="isCorrect !== null || settings.easyMode"
      >
        <h1
          class="text-white font-display text-2xl md:text-4xl font-bold mb-2 drop-shadow-md transition-opacity duration-300"
          :class="isCorrect !== null ? 'opacity-100' : 'opacity-0'"
        >
          {{ currentMember.firstName }} {{ currentMember.lastName }}
        </h1>

        <p
          class="text-stone-200 text-base md:text-lg font-medium tracking-wide drop-shadow-sm animate-fade-in"
        >
          Riding of {{ currentMember.constituency }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'

const store = useGameStore()
const { currentMember, isCorrect, settings } = storeToRefs(store)

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
