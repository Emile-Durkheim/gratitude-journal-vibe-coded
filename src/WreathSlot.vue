<script setup lang="ts">
import { computed } from 'vue'
import FlowerG from './FlowerG.vue'
import LeafG from './LeafG.vue'
import { petalsFor } from './flower'
import { useT } from './useLang'
import { formatLong } from './dates'
import type { Entries } from './storage'

const props = defineProps<{
  index: number
  dateKey: string
  x: number
  y: number
  angle: number
  today: string
  entries: Entries
  promptCount: number
}>()
const t = useT()

const entry = computed(() => props.entries[props.dateKey])
const future = computed(() => props.dateKey > props.today)
const isToday = computed(() => props.dateKey === props.today)
const label = computed(
  () => `${formatLong(props.dateKey)}, ${entry.value ? t.value.slotPressed : future.value ? t.value.slotNotYet : t.value.slotQuiet}`,
)
const petals = computed(() => entry.value && petalsFor(entry.value.items, props.promptCount))
// Flowers open one after another around the wreath, Monday first.
const delay = computed(() => ({ '--d': `${props.index * 110}ms` }))
// each flower sways on an imagined stem, at its own pace
const sway = computed(() => ({ animationDuration: `${4.4 + ((props.index * 3) % 4) * 0.5}s`, animationDelay: `${-props.index * 1.1}s` }))
</script>

<template>
  <g :transform="`translate(${x} ${y})`">
    <g v-if="future" :aria-label="label">
      <circle r="4" fill="#e6dcc6" stroke="#cbbfae" />
    </g>
    <a v-else :href="`#/day/${dateKey}`" :aria-label="label" :class="['slot', entry ? 'pressed' : 'empty']">
      <circle class="hit" r="31" fill="transparent" />
      <g class="sway-svg" :style="sway">
        <g v-if="petals" transform="scale(1.6)">
          <FlowerG :petals="petals.petals" :filled="petals.filled" :day="dateKey" :delay="index * 0.11" />
        </g>
        <g v-else-if="isToday" transform="scale(1.6)">
          <FlowerG :petals="promptCount" :filled="0" :day="dateKey" />
        </g>
        <g v-else :transform="`rotate(${angle + 90}) scale(1.1)`">
          <g class="leaf" :style="delay"><LeafG /></g>
        </g>
      </g>
    </a>
  </g>
</template>
