<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watchEffect, type CSSProperties } from 'vue'
import BackLink from './BackLink.vue'
import PetalDrift from './PetalDrift.vue'
import PromptFields from './PromptFields.vue'
import StampButton from './StampButton.vue'
import TopBar from './TopBar.vue'
import WeekStrip from './WeekStrip.vue'
import { flowerColor } from './flower'
import { useKeyboardShift } from './useKeyboardShift'
import { useLang } from './useLang'
import { quoteFor } from './quotes'
import { formatLong, fromKey, isSunday, toKey, todayKey } from './dates'
import type { Entries, Entry, Item } from './storage'

const props = defineProps<{
  date: string
  entry: Entry | undefined
  entries: Entries
  hasWeekReview: boolean
  currentPrompts: string[]
}>()
const emit = defineEmits<{
  change: [date: string, items: Item[]]
  stamp: [date: string, items: Item[]]
  unstamp: [date: string, items: Item[]]
  back: []
}>()
const lang = useLang()
const t = computed(() => lang.value.t)

// The view is keyed by date, so the date and its first entry are fixed for its lifetime.
const date = props.date
const today = todayKey()
const future = date > today
// A day that already has an entry keeps the prompts it was written with.
// Shallow, so the plain arrays go to IndexedDB rather than reactive proxies it cannot clone.
const items = shallowRef<Item[]>(props.entry?.items ?? props.currentPrompts.map((prompt) => ({ prompt, answer: '' })))

const update = (i: number, answer: string) => {
  const next = items.value.map((item, j) => (j === i ? { ...item, answer } : item))
  items.value = next
  emit('change', date, next)
}

const filled = computed(() => items.value.filter((i) => i.answer.trim()).length)

const sticky = ref<HTMLDivElement | null>(null)
useKeyboardShift(sticky)

// Stamping is the moment to celebrate; it stays stamped while the day has answers.
const stamped = computed(() => !!props.entry?.stampedAt && filled.value > 0)
// After a fresh stamp the seal lands first; then the bloom spreads out from the stamp across the
// page and petals start to fall. A day that was already stamped opens bloomed.
const bloom = ref<'none' | 'spreading' | 'done'>(stamped.value ? 'done' : 'none')
const origin = ref({ x: 0, y: 0 })
let bloomTimer: number | undefined
const stampDay = (from: { x: number; y: number }) => {
  emit('stamp', date, items.value)
  navigator.vibrate?.(25)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  origin.value = from
  bloomTimer = window.setTimeout(() => (bloom.value = reduced ? 'done' : 'spreading'), 320)
}
// Pressing again takes the stamp off and opens the answers for editing.
const unstampDay = () => {
  emit('unstamp', date, items.value)
  window.clearTimeout(bloomTimer)
  bloom.value = 'none'
}
const blooming = computed(() => stamped.value && bloom.value !== 'none')
const color = flowerColor(date)
const root = document.documentElement
watchEffect(() => {
  const on = stamped.value && bloom.value === 'done'
  if (on) root.style.setProperty('--bloom', color)
  root.classList.toggle('bloomed', on)
})
onUnmounted(() => root.classList.remove('bloomed'))

const waveStyle = computed(() => {
  const { x, y } = origin.value
  return {
    '--bloom': color,
    '--x': `${x}px`,
    '--y': `${y}px`,
    // far enough to reach the furthest corner of the screen
    '--max-r': `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 80}px`,
  } as CSSProperties
})

const quote = computed(() => quoteFor(date, lang.value.lang))

const neighbour = (delta: number) => {
  const d = fromKey(date)
  d.setDate(d.getDate() + delta)
  return toKey(d)
}
const prev = neighbour(-1)
const next = neighbour(1)
</script>

<template>
  <section>
    <TopBar :title="date === today ? t.today : t.aPressedDay">
      <template #start><BackLink href="#/" :label="t.backToWreath" @click="emit('back')" /></template>
    </TopBar>
    <div ref="sticky" class="day-sticky">
      <WeekStrip
        :date="date"
        :entries="entries"
        :prompt-count="currentPrompts.length"
        :petals="items.length"
        :filled="future ? 0 : filled"
        :complete="!future && stamped"
      />
    </div>
    <div class="page-head mt-3 mb-5 flex items-center gap-4">
      <span class="text-6xl leading-none">{{ Number(date.slice(8)) }}</span>
      <span class="grow">
        <span class="block text-lg italic leading-tight opacity-80">{{ formatLong(date) }}</span>
        <!-- a quote for the day, in ink until the day is stamped, then in rose with the flower -->
        <span :class="['day-quote mt-1 block text-sm italic leading-snug', { pressed: stamped }]">
          <span v-if="stamped" class="mr-1 not-italic" aria-hidden="true">✿</span
          >{{ t.quoted(quote.text) }} <span class="whitespace-nowrap not-italic opacity-75">— {{ quote.by }}</span>
        </span>
      </span>
    </div>
    <div v-if="stamped && bloom === 'spreading'" class="bloom-wave" aria-hidden="true" :style="waveStyle" @animationend="bloom = 'done'" />
    <PetalDrift v-if="blooming" :color="color" />

    <p v-if="future" class="empty my-12 text-center italic opacity-60">{{ t.notYetHappened }}</p>
    <form v-else class="mt-3" @submit.prevent>
      <!-- a pressed day is kept as it was; unpress it to write again -->
      <PromptFields :items="items" :rows="3" :locked="stamped" @answer="update" />
      <div class="mt-8">
        <StampButton :filled="filled" :total="items.length" :stamped="stamped" @stamp="stampDay" @unstamp="unstampDay" />
      </div>
      <p class="mt-5 text-center text-sm italic opacity-60">
        <a class="link text-rose" href="#/settings">{{ t.changePrompts }}</a>
      </p>
    </form>

    <a v-if="!future && isSunday(date)" class="week-card card mt-6 border border-rose/40 bg-base-100" :href="`#/week/${date}`">
      <span class="card-body flex-row items-center gap-3 p-4">
        <span class="text-3xl text-rose" aria-hidden="true">✿</span>
        <span class="grow">
          <strong class="font-semibold">{{ t.weeklyReview }}</strong>
          <span class="block text-sm italic opacity-70">{{ hasWeekReview ? t.reviewCardWritten : t.reviewCardInvite }}</span>
        </span>
        <span class="text-2xl" aria-hidden="true">›</span>
      </span>
    </a>

    <nav class="mt-4 flex justify-between">
      <a class="btn btn-ghost btn-sm" :href="`#/day/${prev}`">{{ t.previousDay }}</a>
      <a v-if="next <= today" class="btn btn-ghost btn-sm" :href="`#/day/${next}`">{{ t.nextDay }}</a>
    </nav>
  </section>
</template>
