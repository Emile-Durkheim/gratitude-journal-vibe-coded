<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import SealFlower from '../flower/SealFlower.vue'
import { useT } from '../../composables/useLang'

/**
 * The stamp at the foot of a day. Its ring fills in slowly as prompts are answered; pressing it
 * stamps the day as pressed. Answers are saved as you type either way: this is the moment of
 * saying "done".
 */
const props = defineProps<{ filled: number; total: number; stamped: boolean }>()
const emit = defineEmits<{
  /** Called with the stamp's centre on screen, where the page's bloom starts. */
  stamp: [origin: { x: number; y: number }]
  /** Pressing a pressed day again takes the stamp off. */
  unstamp: []
}>()
const t = useT()

const R = 44
const CIRC = 2 * Math.PI * R

const progress = computed(() => (props.stamped ? 1 : props.total ? props.filled / props.total : 0))
const ready = computed(() => props.filled > 0 && !props.stamped)
const full = computed(() => props.filled === props.total && !props.stamped)
const label = computed(() =>
  props.stamped ? t.value.stampPressed : props.filled === 0 ? t.value.stampWrite : full.value ? t.value.stampFull : t.value.stampPartial,
)

const pressable = computed(() => ready.value || props.stamped)

const onClick = (e: MouseEvent) => {
  if (props.stamped) return emit('unstamp')
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  emit('stamp', { x: r.left + r.width / 2, y: r.top + r.height / 2 })
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <motion.button
      type="button"
      :class="['stamp', { invite: full, stamped }]"
      :disabled="!pressable"
      :while-press="pressable ? { scale: 0.86 } : undefined"
      :aria-label="stamped ? t.stampDoneLabel : t.stampLabel(filled, total)"
      :aria-pressed="stamped"
      @click="onClick"
    >
      <svg viewBox="-50 -50 100 100" width="104" height="104" overflow="visible" aria-hidden="true">
        <circle :r="R" class="stamp-track" />
        <circle :r="R" class="stamp-ring" transform="rotate(-90)" :stroke-dasharray="CIRC" :stroke-dashoffset="CIRC * (1 - progress)" />
        <!-- the inked seal lands like a rubber stamp -->
        <motion.g
          v-if="stamped"
          :initial="{ scale: 1.7, rotate: -18, opacity: 0 }"
          :animate="{ scale: 1, rotate: -8, opacity: 1 }"
          :transition="{ type: 'spring', stiffness: 520, damping: 18, mass: 0.7 }"
        >
          <circle :r="36" class="seal" />
          <circle :r="31" class="seal-inner" />
          <SealFlower />
        </motion.g>
        <g v-else class="stamp-idle">
          <SealFlower />
        </g>
      </svg>
    </motion.button>
    <span :class="['text-sm uppercase tracking-[0.2em]', stamped ? 'text-rose' : ready ? '' : 'opacity-50']">{{ label }}</span>
  </div>
</template>
