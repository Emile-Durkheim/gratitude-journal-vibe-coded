<script setup lang="ts">
import { computed } from 'vue'
import { C, R, SIZE } from './wreath'

/**
 * The dashed ring round today, turning slowly. It sits over the wreath as its own element rather
 * than inside the SVG, so the browser can keep it turning on the compositor while the page scrolls.
 */
const props = defineProps<{ index: number }>()
const pct = (v: number) => `${(v / SIZE) * 100}%`
const style = computed(() => {
  const rad = ((props.index / 7) * 360 - 90) * (Math.PI / 180)
  return { left: pct(C + R * Math.cos(rad)), top: pct(C + R * Math.sin(rad)), width: pct(68) }
})
</script>

<template>
  <div class="today-ring pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" :style="style" aria-hidden="true">
    <svg viewBox="-34 -34 68 68" class="block w-full">
      <circle r="33" fill="none" stroke="#b5576c" stroke-width="1.4" stroke-dasharray="4 3" />
    </svg>
  </div>
</template>
