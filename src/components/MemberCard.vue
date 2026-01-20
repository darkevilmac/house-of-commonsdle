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
        :alt="`Headshot of ${currentMember.firstName} ${currentMember.lastName}`"
        class="w-full h-full object-cover object-top"
        @error="handleImageError"
      />

      <div
        class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-32 text-center pointer-events-none"
        v-if="isCorrect !== null"
      >
        <h1
          class="text-white font-display text-2xl md:text-4xl font-bold mb-2 drop-shadow-md animate-fade-in"
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
const { currentMember, isCorrect } = storeToRefs(store)

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
