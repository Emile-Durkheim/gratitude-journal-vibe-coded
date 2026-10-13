<script setup lang="ts">
import { computed } from 'vue'
import CalendarDay from './CalendarDay.vue'
import IconLink from './IconLink.vue'
import TopBar from './TopBar.vue'
import TopIcon from './TopIcon.vue'
import { useT } from './useLang'
import { formatMonth, monthGrid, todayKey, weekdayLabels } from './dates'
import type { Entries } from './storage'

/** The whole month as a pressing sheet: a small flower for each written day. */
const props = defineProps<{
  year: number
  month: number
  entries: Entries
  weeks: Entries
  promptCount: number
}>()
const emit = defineEmits<{ monthChange: [year: number, month: number] }>()
const t = useT()

const today = todayKey()
const now = new Date()
const isCurrentMonth = computed(() => props.year === now.getFullYear() && props.month === now.getMonth())
const shift = (delta: number) => {
  const d = new Date(props.year, props.month + delta, 1)
  emit('monthChange', d.getFullYear(), d.getMonth())
}
const count = computed(
  () => Object.keys(props.entries).filter((k) => k.startsWith(`${props.year}-${String(props.month + 1).padStart(2, '0')}`)).length,
)
</script>

<template>
  <section>
    <TopBar :title="t.appTitle">
      <template #start>
        <IconLink href="#/" :label="t.wreathView"><TopIcon name="wreath" /></IconLink>
      </template>
      <template #end>
        <IconLink href="#/settings" :label="t.settings"><TopIcon name="gear" /></IconLink>
      </template>
    </TopBar>

    <div class="flex items-center justify-between">
      <button class="btn btn-ghost btn-sm text-2xl" :aria-label="t.previousMonth" @click="shift(-1)">‹</button>
      <h2 class="text-2xl italic">{{ formatMonth(year, month) }}</h2>
      <button class="btn btn-ghost btn-sm text-2xl" :aria-label="t.nextMonth" @click="shift(1)">›</button>
    </div>

    <table class="calendar mt-2 w-full" role="grid">
      <thead>
        <tr>
          <th
            v-for="(label, i) in weekdayLabels()"
            :key="i"
            scope="col"
            class="pb-1 text-[0.7rem] font-normal uppercase tracking-widest opacity-60"
          >{{ label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, i) in monthGrid(year, month)" :key="i">
          <td v-for="(key, j) in week" :key="j">
            <CalendarDay v-if="key" :date-key="key" :today="today" :entries="entries" :week-done="!!weeks[key]" :prompt-count="promptCount" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-2 flex min-h-9 items-center justify-between border-t border-base-300 pt-2">
      <span class="text-sm italic opacity-70">{{ count === 0 ? t.nothingPressed : t.flowersPressed(count) }}</span>
      <button v-if="!isCurrentMonth" class="btn btn-ghost btn-sm text-rose" @click="emit('monthChange', now.getFullYear(), now.getMonth())">
        {{ t.today }}
      </button>
    </div>
  </section>
</template>
