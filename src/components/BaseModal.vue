<script setup lang="ts">
defineProps<{
  isOpen: boolean
  maxWidth?: string // e.g. 'max-w-lg', 'max-w-md'
  contentClass?: string // Additional classes for the content area
  showCloseButton?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="relative w-full bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-4 border-white dark:border-stone-800 transition-all"
        :class="[maxWidth || 'max-w-lg']"
      >
        <!-- Header -->
        <div
          v-if="$slots.header"
          class="border-b border-stone-200 dark:border-stone-700 p-4 md:p-6 flex-shrink-0"
        >
          <slot name="header"></slot>
        </div>

        <!-- Close Button -->
        <button
          v-if="showCloseButton"
          @click="$emit('close')"
          class="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto custom-scrollbar flex-1" :class="contentClass">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="p-6 border-t border-stone-200 dark:border-stone-700 flex-shrink-0 bg-white dark:bg-stone-900"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>
