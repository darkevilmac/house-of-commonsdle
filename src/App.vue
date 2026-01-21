<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from './stores/game'
import { storeToRefs } from 'pinia'
import ScoreBoard from './components/ScoreBoard.vue'
import MemberCard from './components/MemberCard.vue'
import PartySelector from './components/PartySelector.vue'
import HowToPlayModal from './components/HowToPlayModal.vue'

const store = useGameStore()
const { feedbackMessage } = storeToRefs(store)
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
          <!-- Easter Egg Feedback -->
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-4 opacity-0"
          >
            <div
              v-if="feedbackMessage"
              class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-6 py-2 rounded-full border border-stone-200 dark:border-stone-700 shadow-lg z-50 whitespace-nowrap"
            >
              <span class="font-display font-bold text-lg text-stone-800 dark:text-white">
                {{ feedbackMessage }}
              </span>
            </div>
          </transition>

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

    <!-- Footer -->
    <footer
      class="absolute bottom-3 left-0 w-full px-6 flex justify-between items-end z-50 pointer-events-none text-stone-500/40 dark:text-stone-400/30 text-[10px] uppercase tracking-widest font-bold"
    >
      <!-- Left Side -->
      <div class="flex flex-col gap-0.5 pointer-events-auto">
        <span>MIT Licensed</span>
        <span>Data via OpenParliament</span>
      </div>

      <!-- Right Side -->
      <div class="flex flex-col items-end gap-0.5 pointer-events-auto text-right">
        <span>By Benjamin K (darkevilmac)</span>
        <a
          href="https://github.com/darkevilmac/HouseOfCommons-dle"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          title="View Source on GitHub"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3 fill-current opacity-50"
          >
            <path
              d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6-.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"
            />
          </svg>
          <span>Source Code</span>
        </a>
      </div>
    </footer>
  </div>
</template>
