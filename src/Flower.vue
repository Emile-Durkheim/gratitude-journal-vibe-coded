<script setup lang="ts">
import FlowerG from './FlowerG.vue'

withDefaults(
  defineProps<{ size: number; petals: number; filled: number; day: string; stem?: boolean; delay?: number; rotate?: number }>(),
  { stem: false, delay: 0, rotate: 0 },
)
</script>

<template>
  <svg :width="size" :height="stem ? size * 1.25 : size" :viewBox="`-21 -21 42 ${stem ? 52 : 42}`" aria-hidden="true" overflow="visible">
    <g :transform="`rotate(${rotate})`">
      <FlowerG :petals="petals" :filled="filled" :day="day" :stem="stem" :delay="delay" />
    </g>
  </svg>
</template>
