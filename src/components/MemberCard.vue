<template>
  <div
    class="relative h-full max-h-[50vh] md:max-h-[55vh] max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 animate-slide-up mx-auto bg-gray-200 dark:bg-stone-800"
  >
    <Transition
      enter-active-class="transition-opacity duration-500 ease-in-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-500 ease-in-out"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!imageReady"
        key="loading"
        class="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200 dark:bg-stone-800"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Only show member when image is ready - prevents alt text flash -->
      <div v-else-if="currentMember" :key="currentMember.id" class="absolute inset-0 w-full h-full">
        <img
          :src="currentMember.imagePath"
          alt="MP image"
          class="w-full h-full object-cover object-top"
          @error="handleImageError"
        />

        <div
          class="absolute top-6 right-6 z-20 transition-all duration-300 transform"
          :class="isCorrect !== null ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
        >
          <div
            class="w-14 h-14 rounded-full shadow-lg border border-stone-200 dark:border-stone-700 p-2 flex items-center justify-center backdrop-blur-md"
            :class="getPartyBackground(currentMember.partyCode)"
          >
            <PartyLogo
              :partyCode="currentMember.partyCode"
              class="text-stone-800 dark:text-white"
            />
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
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'
import PartyLogo from './PartyLogo.vue'

const store = useGameStore()
const { currentMember, isCorrect, settings, imageReady } = storeToRefs(store)

const partyBackgrounds: Record<string, string> = {
  LPC: 'bg-gradient-to-br from-[#FAD4D4] to-[#F5A9A9]',
  CPC: 'bg-gradient-to-br from-[#D0E0F0] to-[#B0CDE0]',
  NDP: 'bg-gradient-to-br from-[#FDE0C2] to-[#FCCA95]',
  BQ: 'bg-gradient-to-br from-[#D1F2FF] to-[#A3E0FF]',
  GPC: 'bg-gradient-to-br from-[#D6F5D6] to-[#A6EBA6]',
}

const getPartyBackground = (code: string) => {
  return partyBackgrounds[code] || 'bg-white/90 dark:bg-stone-800/90'
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
