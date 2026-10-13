<script setup lang="ts">
import { computed } from 'vue'
import Flower from '../flower/Flower.vue'
import LeafG from '../flower/LeafG.vue'
import { petalsFor } from '../../lib/flower'
import { useT } from '../../composables/useLang'
import { dateLocale, formatLong, fromKey, todayKey, weekDays, weekEnd } from '../../lib/dates'
import type { Entries } from '../../lib/storage'

/**
 * The open day's week along the top of the day page, so progress stays in view while writing.
 * The open day is the large flower; the others are small and lead to their own pages.
 */
const props = defineProps<{
  date: string
  entries: Entries
  promptCount: number
  /** The open day's flower, drawn from what is being typed so it grows live. */
  petals: number
  filled: number
  /** Every petal is in: the flower gets a soft golden halo. */
  complete: boolean
}>()
const t = useT()

/** Each small flower sways at its own pace, so the row never moves in lockstep. */
const swayStyle = (i: number) => ({ animationDuration: `${4.2 + ((i * 7) % 5) * 0.45}s`, animationDelay: `${-i * 0.9}s` })

const days = computed(() => {
  const today = todayKey()
  return weekDays(weekEnd(props.date)).map((d) => {
    const entry = props.entries[d]
    return {
      d,
      entry,
      selected: d === props.date,
      future: d > today,
      isToday: d === today,
      weekday: fromKey(d).toLocaleDateString(dateLocale(), { weekday: 'narrow' }),
      long: formatLong(d),
      ...(entry && petalsFor(entry.items, props.promptCount)),
    }
  })
})
</script>

<template>
  <nav class="week-strip flex items-end" :aria-label="t.thisWeekNav">
    <component
      :is="day.future ? 'span' : 'a'"
      v-for="(day, i) in days"
      :key="day.d"
      :href="day.future ? undefined : `#/day/${day.d}`"
      :class="['strip-day flex flex-col items-center gap-0.5 rounded py-1', { selected: day.selected, 'opacity-60': day.future }]"
      :aria-current="!day.future && day.selected ? 'page' : undefined"
      :aria-label="day.future ? `${day.long}, ${t.slotNotYet}` : `${day.long}${day.entry ? `, ${t.slotPressed}` : ''}`"
    >
      <span class="strip-weekday text-[0.65rem] uppercase tracking-[0.15em] opacity-60">{{ day.weekday }}</span>
      <span class="grid place-items-center">
        <!-- the sway and the "pressed" glow live on an HTML wrapper so they stay smooth while scrolling -->
        <span v-if="day.selected" :class="['live-flower sway', { complete }]">
          <Flower :size="58" :petals="petals" :filled="filled" :day="day.d" />
        </span>
        <span v-else-if="day.entry" class="sway small" :style="swayStyle(i)">
          <Flower :size="30" :petals="day.petals!" :filled="day.filled!" :day="day.d" />
        </span>
        <svg v-else-if="day.future" width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
          <circle r="3.5" fill="#e6dcc6" stroke="#cbbfae" />
        </svg>
        <span v-else-if="day.isToday" class="sway small" :style="swayStyle(i)">
          <Flower :size="30" :petals="promptCount" :filled="0" :day="day.d" />
        </span>
        <span v-else class="sway small" :style="swayStyle(i)">
          <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
            <g transform="rotate(-20) scale(.9)">
              <LeafG />
            </g>
          </svg>
        </span>
      </span>
      <span :class="['text-sm italic leading-none', day.isToday ? 'font-semibold text-rose' : 'opacity-60']">{{ Number(day.d.slice(8)) }}</span>
    </component>
  </nav>
</template>
