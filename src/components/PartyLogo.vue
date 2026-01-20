<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  partyCode: string
  className?: string
}>()

const partyCodeNormalized = computed(() => props.partyCode.toUpperCase())
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    class="w-full h-full fill-current"
    :class="className"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Liberal (Red Leaf) -->
    <g v-if="partyCodeNormalized === 'LPC'">
      <path d="M50 5 L60 35 L90 30 L70 55 L85 85 L50 70 L15 85 L30 55 L10 30 L40 35 Z" />
      <text
        x="50"
        y="95"
        text-anchor="middle"
        font-size="20"
        font-weight="bold"
        font-family="Cinzel"
      >
        LIB
      </text>
    </g>

    <!-- Conservative (Blue C + Leaf) -->
    <g v-if="partyCodeNormalized === 'CPC'">
      <path d="M75 25 A 35 35 0 1 0 75 75 L 85 65 A 20 20 0 1 1 85 35 Z" opacity="0.9" />
      <path
        d="M60 40 L65 55 L80 50 L70 65 L75 80 L60 70 L45 80 L50 65 L40 50 L55 55 Z"
        transform="translate(10, 0) scale(0.6)"
      />
    </g>

    <!-- NDP (Text) -->
    <g v-if="partyCodeNormalized === 'NDP'">
      <text
        x="50"
        y="60"
        text-anchor="middle"
        font-size="40"
        font-weight="900"
        font-family="sans-serif"
        letter-spacing="-2"
      >
        NDP
      </text>
      <path d="M20 75 Q 50 90 80 75" stroke="currentColor" stroke-width="5" fill="none" />
    </g>

    <!-- Bloc (Fleur de Lis approx) -->
    <g v-if="partyCodeNormalized === 'BQ'">
      <path
        d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 65 L30 75 L35 55 L20 40 L40 40 Z"
        transform="scale(0.8) translate(12, 12)"
      />
      <text
        x="50"
        y="90"
        text-anchor="middle"
        font-size="22"
        font-weight="bold"
        font-family="Cinzel"
      >
        BLOC
      </text>
    </g>

    <!-- Green (Leaf) -->
    <g v-if="partyCodeNormalized === 'GPC'">
      <path
        d="M50 90 Q 10 50 50 10 Q 90 50 50 90 Z M 50 90 L 50 40"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      />
      <path d="M50 10 Q 90 50 50 90" fill="currentColor" opacity="0.6" />
    </g>

    <!-- Independent (Gray circle) -->
    <g v-if="partyCodeNormalized === 'IND'">
      <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="5" fill="none" />
      <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="5" />
    </g>
  </svg>
</template>
