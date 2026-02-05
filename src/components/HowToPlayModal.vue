<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <BaseModal
    :isOpen="true"
    :showCloseButton="true"
    @close="$emit('close')"
    content-class="p-8 md:p-10 text-center"
  >
    <!-- Header -->
    <template #header>
      <div class="space-y-2 w-full text-center">
        <h2
          class="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 tracking-tight"
        >
          How to Play
        </h2>
        <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
      </div>
    </template>

    <!-- Main Instruction -->
    <div class="space-y-6 w-full py-4">
      <p class="text-stone-600 dark:text-stone-300 font-sans text-lg leading-relaxed">
        You will be shown a photo of a Member of Parliament.
        <strong class="text-stone-900 dark:text-white block mt-2 text-xl"
          >Guess their party affiliation.</strong
        >
      </p>
    </div>

    <!-- Footer Action -->
    <template #footer>
      <button
        @click="$emit('close')"
        class="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-display font-bold text-lg rounded-xl shadow-lg hover:transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-widest uppercase"
      >
        Start Guessing
      </button>
    </template>
  </BaseModal>
</template>
