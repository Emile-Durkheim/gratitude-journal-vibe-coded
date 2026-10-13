<script setup lang="ts">
import { computed } from 'vue'
import IconLink from '../components/ui/IconLink.vue'
import InstallCard from '../components/settings/InstallCard.vue'
import LeafG from '../components/flower/LeafG.vue'
import TodayRing from '../components/wreath/TodayRing.vue'
import TopBar from '../components/ui/TopBar.vue'
import TopIcon from '../components/ui/TopIcon.vue'
import WreathSlot from '../components/wreath/WreathSlot.vue'
import { useInstall } from '../lib/install'
import { useT } from '../composables/useLang'
import { C, R, SIZE } from '../lib/wreath'
import { dateLocale, formatWeekRange, fromKey, isSunday, toKey, todayKey, weekDays, weekEnd } from '../lib/dates'
import type { Entries, PersistState } from '../lib/storage'

/** Home screen: this week as a wreath with one flower per day, Monday at the top going clockwise. */
const props = defineProps<{
  sunday: string
  entries: Entries
  weeks: Entries
  promptCount: number
  persist: PersistState | null
}>()
const emit = defineEmits<{ weekChange: [sunday: string] }>()
const t = useT()
const install = useInstall()
// Entries can still be lost: the warning sits right below the wreath instead of the quiet link at the foot.
const atRisk = computed(() => install.value.kind !== 'installed' && props.persist !== 'persisted')

const today = todayKey()
const thisWeek = weekEnd(today)
const days = computed(() => weekDays(props.sunday))
const pressed = computed(() => days.value.filter((d) => props.entries[d]).length)
const reviewed = computed(() => !!props.weeks[props.sunday])
const shift = (delta: number) => {
  const d = fromKey(props.sunday)
  d.setDate(d.getDate() + 7 * delta)
  return toKey(d)
}
const later = computed(() => shift(1))
const isThisWeek = computed(() => props.sunday === thisWeek)
const sundayToday = isSunday(today)

const rad = (deg: number) => (deg * Math.PI) / 180
// the vine runs between the day slots, leaving room for each flower
const GAP = 17
const vine = Array.from({ length: 7 }, (_, i) => {
  const a0 = rad((i / 7) * 360 - 90 + GAP)
  const a1 = rad(((i + 1) / 7) * 360 - 90 - GAP)
  return `M${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)}`
})
// little leaves along the vine, between the day slots
const leaves = Array.from({ length: 7 }, (_, i) => {
  const a = ((i + 0.5) / 7) * 360 - 90
  return `translate(${C + R * Math.cos(rad(a))} ${C + R * Math.sin(rad(a))}) rotate(${a + 90}) scale(.7)`
})
const slots = computed(() =>
  days.value.map((d, i) => {
    const a = (i / 7) * 360 - 90
    return {
      d,
      a,
      x: C + R * Math.cos(rad(a)),
      y: C + R * Math.sin(rad(a)),
      lx: C + (R + 44) * Math.cos(rad(a)),
      ly: C + (R + 44) * Math.sin(rad(a)),
      weekday: fromKey(d).toLocaleDateString(dateLocale(), { weekday: 'short' }).replace('.', ''),
    }
  }),
)
</script>

<template>
  <section>
    <TopBar :title="t.appTitle">
      <template #start>
        <IconLink href="#/calendar" :label="t.calendarView"><TopIcon name="calendar" /></IconLink>
      </template>
      <template #end>
        <IconLink href="#/settings" :label="t.settings"><TopIcon name="gear" /></IconLink>
      </template>
    </TopBar>

    <div class="relative mx-auto w-full max-w-[340px]">
      <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="wreath block w-full" role="list" :aria-label="t.weekLabel(formatWeekRange(sunday))">
        <path v-for="(d, i) in vine" :key="`a${i}`" :d="d" fill="none" stroke="#a9bf9d" stroke-width="2" stroke-linecap="round" />
        <g v-for="(transform, i) in leaves" :key="`v${i}`" :transform="transform"><LeafG /></g>
        <g v-for="(s, i) in slots" :key="s.d" role="listitem">
          <WreathSlot :index="i" :date-key="s.d" :x="s.x" :y="s.y" :angle="s.a" :today="today" :entries="entries" :prompt-count="promptCount" />
          <text :x="s.lx" :y="s.ly - 3" text-anchor="middle" class="fill-current text-[11px] uppercase tracking-[0.15em] opacity-70">{{ s.weekday }}</text>
          <text
            :x="s.lx"
            :y="s.ly + 12"
            text-anchor="middle"
            :class="['text-[14px] italic', s.d === today ? 'fill-rose font-semibold' : 'fill-current opacity-60']"
          >{{ Number(s.d.slice(8)) }}</text>
        </g>
        <path
          v-if="reviewed"
          :d="`M${C + 52} ${C - 70} v30 l7 -6 l7 6 v-30z`"
          fill="#b5576c"
          fill-opacity=".75"
          :aria-label="t.reviewWritten"
        />
      </svg>
      <TodayRing v-if="days.includes(today)" :index="days.indexOf(today)" />
      <div class="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span class="text-[0.7rem] uppercase tracking-[0.25em] opacity-60">{{ isThisWeek ? t.thisWeek : t.weekOf }}</span>
        <span class="week-range text-xl italic leading-tight">{{ formatWeekRange(sunday) }}</span>
        <span class="pressed-count mt-1 text-sm opacity-70">{{ t.pressedOfSeven(pressed) }}{{ reviewed ? ` · ${t.reviewed}` : '' }}</span>
      </div>
    </div>

    <nav class="mb-4 flex items-center justify-between">
      <button class="btn btn-ghost btn-sm" @click="emit('weekChange', shift(-1))">{{ t.earlier }}</button>
      <button v-if="!isThisWeek" class="btn btn-ghost btn-sm text-rose" @click="emit('weekChange', thisWeek)">{{ t.thisWeek }}</button>
      <button v-if="later <= thisWeek" class="btn btn-ghost btn-sm" @click="emit('weekChange', later)">{{ t.later }}</button>
      <span v-else class="w-20" />
    </nav>

    <InstallCard v-if="atRisk" :persist="persist" />

    <div class="grid gap-3">
      <a class="btn btn-primary btn-lg w-full" :href="`#/day/${today}`">{{ entries[today] ? t.openToday : t.pressToday }}</a>
      <a
        :class="['week-btn btn btn-lg w-full', sundayToday && isThisWeek ? 'btn-secondary highlight' : 'btn-outline']"
        :href="`#/week/${sunday <= thisWeek ? sunday : thisWeek}`"
      >
        {{ sundayToday && isThisWeek && !reviewed ? t.sundayReview : reviewed ? t.readReview : t.reviewThisWeek }}
      </a>
    </div>

    <p v-if="install.kind !== 'installed' && !atRisk" class="mt-5 text-center text-sm italic opacity-70">
      <button v-if="install.kind === 'prompt'" class="link text-rose" @click="install.install">{{ t.installApp }}</button>
      <a v-else class="link text-rose" href="#/settings">{{ t.addToHome }}</a>
    </p>
  </section>
</template>
