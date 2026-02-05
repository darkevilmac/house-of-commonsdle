<template>
  <div
    class="max-w-6xl mx-auto grid gap-3 md:gap-6 h-28 md:h-36 w-full transition-all duration-300"
    :class="parties.length === 2 ? 'grid-cols-2' : 'grid-cols-5'"
  >
    <button
      v-for="party in parties"
      :key="party.code"
      @click="submitGuess(party.code)"
      :disabled="isCorrect !== null"
      class="relative w-full h-full rounded-xl md:rounded-2xl shadow-sm active:scale-95 transition-all duration-300 overflow-hidden group flex flex-col items-center justify-center gap-1 md:gap-2 disabled:cursor-default border-2 border-transparent hover:border-black/40"
      :class="[party.bgClass, getButtonState(party.code)]"
    >
      <div class="w-full flex-grow flex items-center justify-center p-2 mb-1">
        <template v-if="party.logos">
          <div class="flex items-center justify-center gap-2 h-16 w-full pointer-events-none px-2">
            <img
              v-for="(logo, idx) in party.logos"
              :key="idx"
              :src="logo"
              class="h-8 md:h-10 w-auto max-w-[2.5rem] md:max-w-[3.5rem] object-contain drop-shadow-sm"
            />
          </div>
        </template>
        <template v-else>
          <img
            :src="party.logo"
            :alt="party.name"
            class="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-sm transition-transform duration-300"
            :class="party.logoClass"
          />
        </template>
      </div>

      <span
        class="text-[10px] md:text-sm font-bold tracking-widest uppercase mb-2 md:mb-3"
        :class="party.textClass"
      >
        <span class="hidden md:block">{{ party.name }}</span>
        <span class="md:hidden">{{ party.shortName || party.name }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import lpcLogo from '@/assets/lpc.png'
import cpcLogo from '@/assets/cpc.svg'
import ndpLogo from '@/assets/ndp.svg'
import bqLogo from '@/assets/bq.png'
import gpcLogo from '@/assets/gpc.png'

const store = useGameStore()
const { isCorrect, lastGuess, currentMember } = storeToRefs(store)

const allParties = [
  {
    code: 'LPC',
    name: 'Liberal',
    shortName: 'Liberal',
    logo: lpcLogo,
    bgClass: 'bg-gradient-to-br from-[#FAD4D4] to-[#F5A9A9]',
    textClass: 'text-[#D71920]',
    logoClass: 'scale-90 translate-y-1',
  },
  {
    code: 'CPC',
    name: 'Conservative',
    shortName: 'CPC',
    logo: cpcLogo,
    bgClass: 'bg-gradient-to-br from-[#D0E0F0] to-[#B0CDE0]',
    textClass: 'text-[#003F72]',
    logoClass: 'scale-95 translate-y-[6px]',
  },
  {
    code: 'NDP',
    name: 'NDP',
    shortName: 'NDP',
    logo: ndpLogo,
    bgClass: 'bg-gradient-to-br from-[#FDE0C2] to-[#FCCA95]',
    textClass: 'text-[#F37021]',
    logoClass: 'scale-[1.35] translate-y-1',
  },
  {
    code: 'BQ',
    name: 'Bloc',
    shortName: 'BQ',
    logo: bqLogo,
    bgClass: 'bg-gradient-to-br from-[#D1F2FF] to-[#A3E0FF]',
    textClass: 'text-[#33B2CC]',
    logoClass: 'scale-105 translate-y-1',
  },
  {
    code: 'GPC',
    name: 'Green',
    shortName: 'Green',
    logo: gpcLogo,
    bgClass: 'bg-gradient-to-br from-[#D6F5D6] to-[#A6EBA6]',
    textClass: 'text-[#3D8E33]',
    logoClass: 'scale-100 translate-y-1',
  },
]

const { settings } = storeToRefs(store)

const parties = computed(() => {
  if (settings.value.americanMode) {
    return [
      {
        code: 'CPC',
        name: 'Conservative',
        shortName: 'CPC',
        logo: cpcLogo,
        bgClass: 'bg-gradient-to-br from-[#D0E0F0] to-[#B0CDE0]',
        textClass: 'text-[#003F72]',
        logoClass: 'scale-95 translate-y-[6px]',
      },
      {
        code: 'ALL', // Special code for the "Everyone Else" button
        name: 'Lib + NDP + Green + Bloc',
        shortName: 'Left Wing',
        logo: '', // Not used when logos is present
        logos: [lpcLogo, ndpLogo, bqLogo, gpcLogo],
        bgClass: 'bg-gradient-to-br from-[#FAD4D4] to-[#F5A9A9]',
        textClass: 'text-[#D71920]',
        logoClass: 'scale-90 translate-y-1',
      },
    ]
  }
  return allParties
})

const submitGuess = (code: string) => {
  if (isCorrect.value !== null) return
  store.submitGuess(code)
}

// Helper to determine button state classes
const getButtonState = (partyCode: string) => {
  if (isCorrect.value === null) return '' // Default state

  const isGuessed = lastGuess.value === partyCode
  let isTarget = false

  if (settings.value.americanMode) {
    const isMemberConservative = currentMember.value?.partyCode === 'CPC'
    if (partyCode === 'CPC') {
      isTarget = isMemberConservative
    } else {
      // partyCode === 'ALL'
      isTarget = !isMemberConservative
    }
  } else {
    isTarget = currentMember.value?.partyCode === partyCode
  }

  if (isTarget) {
    return 'ring-4 ring-green-500 scale-105 opacity-100 z-10' // Correct Answer
  } else if (isGuessed && !isTarget) {
    return 'ring-4 ring-red-500 opacity-80 grayscale-[0.5] scale-95' // Wrong Guess
  } else {
    return 'opacity-40 grayscale-[0.8] scale-95' // Irrelevant
  }
}
</script>
