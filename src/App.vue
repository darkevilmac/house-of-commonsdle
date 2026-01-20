<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from './stores/game'
import ScoreBoard from './components/ScoreBoard.vue'
import MemberCard from './components/MemberCard.vue'
import PartySelector from './components/PartySelector.vue'
import HowToPlayModal from './components/HowToPlayModal.vue'

const store = useGameStore()
const showHelp = ref(false)

const closeHelp = () => {
  showHelp.value = false
  localStorage.setItem('hasSeenHelp', 'true')
}

const openHelp = () => {
  showHelp.value = true
}

onMounted(() => {
  store.loadMembers()

  // Check if first visit
  const hasSeenHelp = localStorage.getItem('hasSeenHelp')
  if (!hasSeenHelp) {
    showHelp.value = true
  }
})
</script>

<template>
  <div
    class="h-screen w-screen overflow-hidden flex flex-col bg-background-light dark:bg-background-dark text-stone-800 dark:text-stone-100 font-sans antialiased relative selection:bg-primary selection:text-white"
  >
    <!-- Header -->
    <div class="absolute top-6 left-6 z-50 animate-fade-in flex items-center gap-3">
      <div
        class="flex items-center gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 dark:border-white/10 shadow-sm"
      >
        <span class="material-symbols-outlined text-primary dark:text-green-600 text-2xl"
          >account_balance</span
        >
        <span class="font-display font-bold text-lg tracking-tight text-stone-900 dark:text-white"
          >Commons<span class="italic text-stone-600 dark:text-stone-300">dle</span></span
        >
      </div>

      <!-- Help Button -->
      <button
        @click="openHelp"
        class="flex items-center justify-center w-10 h-10 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 shadow-sm text-stone-600 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-black/70 hover:scale-105 transition-all duration-200"
        title="How to Play"
      >
        <span class="font-display font-bold text-lg">?</span>
      </button>
    </div>

    <!-- Stats (ScoreBoard) -->
    <div class="absolute top-6 right-6 z-50 animate-fade-in">
      <ScoreBoard />
    </div>

    <main class="flex-grow flex flex-col items-center justify-center w-full h-full relative z-10">
      <!-- active game -->
      <template v-if="!store.isGameOver">
        <div
          class="flex flex-col items-center justify-center w-full h-full pb-32 md:pb-40 px-4 pt-12"
        >
          <MemberCard />
        </div>

        <div
          class="absolute bottom-0 w-full z-40 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark dark:via-background-dark/95 pt-12 pb-12 md:pb-14 px-4"
        >
          <PartySelector />
        </div>
      </template>

      <!-- Game Over Screen -->
      <template v-else>
        <div
          class="flex flex-col items-center justify-center gap-6 animate-fade-in p-6 text-center max-w-lg"
        >
          <div
            class="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 w-full"
          >
            <h2 class="text-3xl font-display font-bold text-stone-800 dark:text-white mb-2">
              Game Over!
            </h2>
            <p class="text-stone-600 dark:text-stone-300 mb-6">You've guessed all the MPs!</p>

            <div class="grid grid-cols-2 gap-4 mb-8">
              <div
                class="bg-stone-100 dark:bg-stone-700/50 p-4 rounded-xl flex flex-col items-center"
              >
                <span
                  class="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >Total Score</span
                >
                <span class="text-2xl font-bold text-stone-800 dark:text-white"
                  >{{ store.score }} / {{ store.attempts }}</span
                >
              </div>
              <div
                class="bg-stone-100 dark:bg-stone-700/50 p-4 rounded-xl flex flex-col items-center"
              >
                <span
                  class="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >Accuracy</span
                >
                <span class="text-2xl font-bold text-primary dark:text-green-400"
                  >{{ Math.round((store.score / store.attempts) * 100) || 0 }}%</span
                >
              </div>
            </div>

            <button
              @click="store.resetGame()"
              class="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Play Again
            </button>
          </div>
        </div>
      </template>
    </main>

    <!-- Modals -->
    <HowToPlayModal v-if="showHelp" @close="closeHelp" />
  </div>
</template>
