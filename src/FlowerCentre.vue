<script setup lang="ts">
import type { FlowerKind } from './flower'

defineProps<{ kind: FlowerKind['centre']; filled: boolean }>()

const stamens = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2
  return { x: Math.cos(a) * 5.2, y: Math.sin(a) * 5.2 }
})
const dots = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2
  return { x: Math.cos(a) * 1.7, y: Math.sin(a) * 1.7 }
})
</script>

<template>
  <g v-if="kind === 'stamens' && filled" class="flower-heart-group">
    <g v-for="(s, i) in stamens" :key="i">
      <path :d="`M0 0 L${s.x} ${s.y}`" stroke="#b08a3a" :stroke-width="0.6" />
      <circle :cx="s.x" :cy="s.y" :r="0.9" fill="#c99a3e" />
    </g>
    <circle class="flower-heart" :r="2.6" fill="#e3bd62" stroke="#b08a3a" :stroke-width="0.7" />
  </g>
  <g v-else>
    <circle class="flower-heart" :r="3.4" fill="#e3bd62" stroke="#b08a3a" :stroke-width="0.8" />
    <template v-if="kind === 'dotted' && filled">
      <circle v-for="(p, i) in dots" :key="i" :cx="p.x" :cy="p.y" :r="0.55" fill="#9a7428" />
    </template>
  </g>
</template>
