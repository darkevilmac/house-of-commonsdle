<script setup lang="ts">
import { computed } from 'vue'
import lpcLogo from '@/assets/lpc.png'
import cpcLogo from '@/assets/cpc.svg'
import ndpLogo from '@/assets/ndp.svg'
import bqLogo from '@/assets/bq.png'
import gpcLogo from '@/assets/gpc.png'

const props = defineProps<{
  partyCode: string
  className?: string
}>()

const partyCodeNormalized = computed(() => props.partyCode.toUpperCase())

const partyTransforms: Record<string, string> = {
  LPC: 'scale-90 translate-x-0.5',
  CPC: 'scale-95 -translate-y-0.4 -translate-x-0.5',
  NDP: 'scale-[1.25] translate-y-0.4',
  BQ: 'scale-100 translate-y-0.5',
  GPC: 'scale-100 translate-y-0.4',
}

const logoSrc = computed(() => {
  switch (partyCodeNormalized.value) {
    case 'LPC':
      return lpcLogo
    case 'CPC':
      return cpcLogo
    case 'NDP':
      return ndpLogo
    case 'BQ':
      return bqLogo
    case 'GPC':
      return gpcLogo
    default:
      return null
  }
})

const transformClass = computed(() => {
  return partyTransforms[partyCodeNormalized.value] || ''
})
</script>

<template>
  <img
    v-if="logoSrc"
    :src="logoSrc"
    :alt="partyCode"
    class="w-full h-full object-contain drop-shadow-sm transition-transform duration-300"
    :class="[className, transformClass]"
  />
  <div
    v-else
    class="w-full h-full flex items-center justify-center font-bold text-xs"
    :class="className"
  >
    {{ partyCode }}
  </div>
</template>
