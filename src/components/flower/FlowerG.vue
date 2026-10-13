<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import FlowerCentre from './FlowerCentre.vue'
import { flowerColor, flowerKind, petalPath, shade } from '../../lib/flower'

/** The flower as an SVG group centred on 0,0 (radius about 19), for use inside another SVG. */
const props = withDefaults(
  defineProps<{
    petals: number
    filled: number
    /** The day this flower belongs to; it decides colour and kind. */
    day: string
    stem?: boolean
    /** Seconds before the first coloured petal opens, to stagger flowers on the wreath. */
    delay?: number
  }>(),
  { stem: false, delay: 0 },
)

const springOpen = { type: 'spring', stiffness: 220, damping: 13, mass: 0.8 } as const

const n = computed(() => Math.max(1, props.petals))
const kind = computed(() => flowerKind(props.day))
const color = computed(() => flowerColor(props.day))
const d = computed(() => petalPath(n.value, kind.value.shape, kind.value.length))
const inner = computed(() => (kind.value.double ? petalPath(n.value, kind.value.shape, kind.value.length * 0.62) : null))
</script>

<template>
  <g>
    <template v-if="stem">
      <path d="M0 3 Q3 14 -1 26" stroke="#7d9a72" stroke-width="1.3" fill="none" />
      <path d="M1 15 q8 -6 12 -2 q-5 6 -12 2z" fill="#a9c39b" fill-opacity=".7" stroke="#6f8c64" stroke-width=".8" />
      <path d="M0 20 q-8 -5 -11 -1 q5 5 11 1z" fill="#a9c39b" fill-opacity=".6" stroke="#6f8c64" stroke-width=".8" />
    </template>
    <g :transform="`rotate(${kind.twist})`">
      <g v-for="i in n" :key="i" :transform="`rotate(${(360 * (i - 1)) / n})`">
        <!-- a petal springs open from the centre when it is coloured in -->
        <motion.g
          v-if="i - 1 < filled"
          class="petal"
          :initial="{ scale: 0, rotate: -35 }"
          :animate="{ scale: 1, rotate: 0 }"
          :transition="{ ...springOpen, delay: delay + (i - 1) * 0.07 }"
          :style="{ originX: 0.5, originY: 1 }"
        >
          <path :d="d" :fill="color" :fill-opacity="0.55" :stroke="shade(color, 0.68)" :stroke-width="1.1" />
          <path v-if="kind.shape === 'slim'" d="M0 -4 L0 -15" :stroke="shade(color, 0.6)" :stroke-width="0.5" :opacity="0.6" />
          <path
            v-else
            d="M0 -4 L0 -13 M0 -6 L-2.6 -11.5 M0 -6 L2.6 -11.5"
            :stroke="shade(color, 0.6)"
            :stroke-width="0.5"
            :opacity="0.55"
            fill="none"
          />
          <path
            v-if="inner"
            :d="inner"
            :transform="`rotate(${180 / n})`"
            :fill="shade(color, 1.12)"
            :fill-opacity="0.7"
            :stroke="shade(color, 0.75)"
            :stroke-width="0.7"
          />
        </motion.g>
        <path v-else :d="d" fill="none" stroke="#c9bca7" :stroke-width="1.1" stroke-dasharray="2 1.6" />
      </g>
      <FlowerCentre :kind="kind.centre" :filled="filled > 0" />
    </g>
  </g>
</template>
