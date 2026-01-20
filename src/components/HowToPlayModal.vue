<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
}>()
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
            How to Play
          </h2>
          <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
        </div>

        <!-- Main Instruction -->
        <div class="space-y-6 w-full">
          <p class="text-stone-600 dark:text-stone-300 font-sans text-lg leading-relaxed">
            You will be shown a photo of a Member of Parliament.
            <strong class="text-stone-900 dark:text-white block mt-2 text-xl"
              >Guess their party affiliation.</strong
            >
          </p>
        </div>

        <!-- Action Button -->
        <button
          @click="$emit('close')"
          class="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-display font-bold text-lg rounded-xl shadow-lg hover:transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-widest uppercase"
        >
          Start Guessing
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
