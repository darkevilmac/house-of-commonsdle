<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useGameStore()
const { settings } = storeToRefs(store)

const toggleAmericanMode = () => {
    store.updateSettings({ americanMode: !settings.value.americanMode })
}

const toggleEasyMode = () => {
    store.updateSettings({ easyMode: !settings.value.easyMode })
}

</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
      @click="$emit('close')"
    ></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in border-4 border-white dark:border-stone-800"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>

      <div class="p-8 md:p-10 flex flex-col items-center text-center space-y-8">
        <!-- Header -->
        <div class="space-y-2">
          <h2
            class="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 tracking-tight"
          >
            Settings
          </h2>
          <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
        </div>

        <!-- Settings Options -->
        <div class="space-y-6 w-full px-4">
            <!-- American Mode Toggle -->
            <div class="flex items-center justify-between">
                <div class="text-left">
                    <h3 class="font-bold text-lg text-stone-800 dark:text-white">American Mode</h3>
                    <p class="text-sm text-stone-500 dark:text-stone-400">Two buttons: Conservative vs. Everyone Else</p>
                </div>
                <button 
                    @click="toggleAmericanMode"
                    class="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="settings.americanMode ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-700'"
                >
                    <span 
                        class="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out"
                        :class="settings.americanMode ? 'translate-x-6' : 'translate-x-0'"
                    ></span>
                </button>
            </div>

            <!-- Easy Mode Toggle -->
            <div class="flex items-center justify-between">
                <div class="text-left">
                    <h3 class="font-bold text-lg text-stone-800 dark:text-white">Easy Mode</h3>
                    <p class="text-sm text-stone-500 dark:text-stone-400">Show riding name before guessing</p>
                </div>
                <button 
                    @click="toggleEasyMode"
                    class="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="settings.easyMode ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-700'"
                >
                    <span 
                        class="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out"
                        :class="settings.easyMode ? 'translate-x-6' : 'translate-x-0'"
                    ></span>
                </button>
            </div>
        </div>

        <!-- Action Button -->
        <button
          @click="$emit('close')"
          class="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-display font-bold text-lg rounded-xl shadow-lg hover:transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-widest uppercase"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
