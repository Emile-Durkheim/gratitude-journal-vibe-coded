<script setup lang="ts">
import { computed } from 'vue'
import Flower from '../flower/Flower.vue'
import { petalsFor } from '../../lib/flower'
import { useT } from '../../composables/useLang'
import { formatLong } from '../../lib/dates'
import type { Entries } from '../../lib/storage'

const props = defineProps<{
  dateKey: string
  today: string
  entries: Entries
  weekDone: boolean
  promptCount: number
}>()
const t = useT()

const entry = computed(() => props.entries[props.dateKey])
const day = computed(() => Number(props.dateKey.slice(8)))
const future = computed(() => props.dateKey > props.today)
const isToday = computed(() => props.dateKey === props.today)
const classes = computed(() => [
  'day relative flex aspect-[4/5] flex-col items-center justify-start rounded-sm pt-0.5 text-sm',
  entry.value ? 'filled bg-base-100' : '',
  isToday.value ? 'today outline-[1.5px] outline-dashed outline-rose' : '',
  future.value ? 'future opacity-35' : 'hover:bg-base-100',
])
const label = computed(
  () => `${formatLong(props.dateKey)}${entry.value ? `, ${t.value.hasEntry}` : ''}${props.weekDone ? `, ${t.value.reviewWrittenShort}` : ''}`,
)
const petals = computed(() => entry.value && petalsFor(entry.value.items, props.promptCount, !!entry.value.stampedAt))
</script>

<template>
  <component
    :is="future ? 'span' : 'a'"
    :class="classes"
    :href="future ? undefined : `#/day/${dateKey}`"
    :aria-label="label"
    :aria-disabled="future ? 'true' : undefined"
    :aria-current="!future && isToday ? 'date' : undefined"
  >
    <span :class="['italic leading-none', isToday ? 'font-semibold text-rose' : 'opacity-70']">{{ day }}</span>
    <span v-if="petals" class="sway small">
      <Flower :size="30" :petals="petals.petals" :filled="petals.filled" :day="dateKey" :rotate="day * 23" />
    </span>
    <span v-if="weekDone" class="week-mark absolute bottom-0.5 right-1 text-[0.65rem] text-rose" aria-hidden="true">✿</span>
  </component>
</template>
