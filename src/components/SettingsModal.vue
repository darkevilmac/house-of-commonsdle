<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BaseModal from './BaseModal.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useGameStore()
const { settings, members } = storeToRefs(store)

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

const toggleAmericanMode = () => {
  store.updateSettings({ americanMode: !settings.value.americanMode })
}

const toggleEasyMode = () => {
  store.updateSettings({ easyMode: !settings.value.easyMode })
}

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []

  const query = searchQuery.value.toLowerCase()
  return members.value
    .filter((m) => {
      // Filter out already excluded members
      if (settings.value.excludedIds.includes(m.id)) return false

      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase()
      const riding = m.constituency.toLowerCase()

      return fullName.includes(query) || riding.includes(query)
    })
    .slice(0, 5) // Limit to 5 results
})

const updateDropdownPosition = () => {
  if (searchInput.value) {
    const rect = searchInput.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
    }
  }
}

watch(searchQuery, async () => {
  await nextTick()
  updateDropdownPosition()
})

// Update position on scroll/resize to prevent detachment visual glitches
const handleScrollResize = () => {
  if (searchResults.value.length > 0) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollResize, true)
  window.addEventListener('resize', handleScrollResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollResize, true)
  window.removeEventListener('resize', handleScrollResize)
})

const addExclusion = (memberId: string) => {
  store.addToExcludedList(memberId)
  // List is always hidden now, no need to toggle setting
  searchQuery.value = '' // Clear search after adding
}

const resetExclusions = () => {
  if (
    confirm(
      'Are you sure you want to reset the exclusion list? ALL excluded members will be restored.',
    )
  ) {
    store.resetExcludedList()
  }
}
</script>

<template>
  <BaseModal
    :isOpen="true"
    :showCloseButton="true"
    @close="$emit('close')"
    content-class="p-8 md:p-10"
  >
    <!-- Header -->
    <template #header>
      <div class="space-y-2 flex-shrink-0 w-full text-center">
        <h2
          class="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 tracking-tight"
        >
          Settings
        </h2>
        <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
      </div>
    </template>

    <!-- Settings Options -->
    <div class="space-y-6 w-full text-left">
      <!-- American Mode Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-stone-800 dark:text-white">American Mode</h3>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            Two buttons: Conservative vs. Everyone Else
          </p>
        </div>
        <button
          @click="toggleAmericanMode"
          class="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none flex-shrink-0"
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
        <div>
          <h3 class="font-bold text-lg text-stone-800 dark:text-white">Easy Mode</h3>
          <p class="text-sm text-stone-500 dark:text-stone-400">Show riding name before guessing</p>
        </div>
        <button
          @click="toggleEasyMode"
          class="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none flex-shrink-0"
          :class="settings.easyMode ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-700'"
        >
          <span
            class="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out"
            :class="settings.easyMode ? 'translate-x-6' : 'translate-x-0'"
          ></span>
        </button>
      </div>

      <hr class="border-stone-200 dark:border-stone-800" />

      <!-- Exclusions Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg text-stone-800 dark:text-white">Excluded Members</h3>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search to exclude..."
            class="w-full px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 border-2 border-transparent focus:border-stone-300 dark:focus:border-stone-600 focus:outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400"
          />

          <!-- Dropdown Results (Teleported) -->
          <Teleport to="body">
            <div
              v-if="searchResults.length > 0"
              class="fixed z-[9999] bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
              :style="{
                top: dropdownPosition.top + 8 + 'px',
                left: dropdownPosition.left + 'px',
                width: dropdownPosition.width + 'px',
              }"
            >
              <button
                v-for="member in searchResults"
                :key="member.id"
                @click="addExclusion(member.id)"
                class="w-full text-left px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border-b last:border-0 border-stone-100 dark:border-stone-700"
              >
                <div class="font-bold text-stone-800 dark:text-stone-200">
                  {{ member.firstName }} {{ member.lastName }}
                </div>
                <div class="text-xs text-stone-500">
                  {{ member.constituency }} • {{ member.party }}
                </div>
              </button>
            </div>
            <div
              v-else-if="searchQuery.length >= 2"
              class="fixed z-[9999] bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 p-4 text-center text-stone-500"
              :style="{
                top: dropdownPosition.top + 8 + 'px',
                left: dropdownPosition.left + 'px',
                width: dropdownPosition.width + 'px',
              }"
            >
              No matches found
            </div>
          </Teleport>
        </div>

        <!-- Exclusions Feedback (List Hidden) -->
        <div
          v-if="settings.excludedIds.length > 0"
          class="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-800 text-center text-stone-400 italic text-sm"
        >
          {{ settings.excludedIds.length }} members excluded (List Hidden)
        </div>

        <!-- Reset Button -->
        <button
          v-if="settings.excludedIds.length > 0"
          @click="resetExclusions"
          class="w-full py-2 mt-2 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Reset Exclusion List
        </button>
      </div>
    </div>

    <!-- Footer Action -->
    <template #footer>
      <button
        @click="$emit('close')"
        class="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-display font-bold text-lg rounded-xl shadow-lg hover:transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-widest uppercase flex-shrink-0"
      >
        Done
      </button>
    </template>
  </BaseModal>
</template>
