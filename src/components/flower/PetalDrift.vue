<script setup lang="ts">
import type { CSSProperties } from 'vue'

/**
 * A few faint petals in the day's colour drifting down the page for as long as a stamped day is
 * open. Plain CSS transforms on HTML elements, so it costs next to nothing and keeps moving while
 * scrolling. Hidden with reduced motion.
 */
defineProps<{ color: string }>()

const COUNT = 9

/** A fixed scatter (0..1) per petal and property, so every render draws the same petals. */
const scatter = (i: number, k: number) => {
  const x = Math.sin(i * 91.7 + k * 47.3) * 43758.5453
  return x - Math.floor(x)
}

const petals = Array.from({ length: COUNT }, (_, i) => {
  const duration = 13 + scatter(i, 1) * 9
  return {
    style: {
      left: `${4 + scatter(i, 2) * 92}%`,
      width: `${7 + scatter(i, 3) * 6}px`,
      animationDuration: `${duration}s, ${3 + scatter(i, 4) * 3}s`,
      // negative delays spread the petals over the page from the start
      animationDelay: `${-scatter(i, 5) * duration}s, ${-scatter(i, 6) * 3}s`,
      '--drift': `${(scatter(i, 7) - 0.5) * 80}px`,
    } as CSSProperties,
    rotate: `${scatter(i, 8) * 360}deg`,
  }
})
</script>

<template>
  <div class="petal-drift" aria-hidden="true">
    <span v-for="(p, i) in petals" :key="i" :style="p.style">
      <svg viewBox="-8 -20 16 21" :style="{ rotate: p.rotate }">
        <path d="M0 -1 C-7 -3 -6.6 -17 0 -18.5 C6.6 -17 7 -3 0 -1Z" :fill="color" />
      </svg>
    </span>
  </div>
</template>
