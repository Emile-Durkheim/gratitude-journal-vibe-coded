<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BackLink from './BackLink.vue'
import PromptFields from './PromptFields.vue'
import TopBar from './TopBar.vue'
import { useT } from './useLang'
import { formatLong, formatWeekRange, fromKey, toKey, todayKey, weekDays } from './dates'
import type { Entries, Entry, Item } from './storage'

const props = defineProps<{
  sunday: string
  entry: Entry | undefined
  days: Entries
  currentPrompts: string[]
}>()
const emit = defineEmits<{ change: [sunday: string, items: Item[]]; back: [] }>()
const t = useT()

// The view is keyed by its Sunday, so the week is fixed for its lifetime.
const sunday = props.sunday
const today = todayKey()
const [monday] = weekDays(sunday)
const future = monday > today
// A week that already has a review keeps the prompts it was written with.
// Shallow, so the plain arrays go to IndexedDB rather than reactive proxies it cannot clone.
const items = shallowRef<Item[]>(props.entry?.items ?? props.currentPrompts.map((prompt) => ({ prompt, answer: '' })))

const update = (i: number, answer: string) => {
  const next = items.value.map((item, j) => (j === i ? { ...item, answer } : item))
  items.value = next
  emit('change', sunday, next)
}

const written = computed(() => weekDays(sunday).filter((d) => props.days[d]))
const shiftWeek = (delta: number) => {
  const d = fromKey(sunday)
  d.setDate(d.getDate() + 7 * delta)
  return toKey(d)
}
const prevSunday = shiftWeek(-1)
const nextSunday = shiftWeek(1)
const nextStarted = weekDays(nextSunday)[0] <= today
</script>

<template>
  <section>
    <TopBar :title="t.weeklyReview">
      <template #start><BackLink href="#/" :label="t.backToWreath" @click="emit('back')" /></template>
    </TopBar>
    <p class="mb-5 text-center text-2xl italic">{{ formatWeekRange(sunday) }}</p>

    <p v-if="future" class="empty my-12 text-center italic opacity-60">{{ t.notStarted }}</p>
    <template v-else>
      <details class="recap collapse collapse-arrow mb-6 rounded-sm border border-base-300 bg-base-100">
        <summary class="collapse-title italic">{{ t.lookBack(written.length) }}</summary>
        <div class="collapse-content text-sm">
          <p v-if="written.length === 0" class="italic opacity-60">{{ t.noDailyEntries }}</p>
          <template v-else>
            <div v-for="d in written" :key="d" class="recap-day mt-3 first:mt-0">
              <a class="link font-semibold text-rose" :href="`#/day/${d}`">{{ formatLong(d) }}</a>
              <p
                v-for="(item, k) in days[d].items.filter((i) => i.answer.trim())"
                :key="k"
                class="mt-1 whitespace-pre-wrap font-hand text-xl leading-snug text-pen"
              >{{ item.answer }}</p>
            </div>
          </template>
        </div>
      </details>

      <form @submit.prevent>
        <PromptFields :items="items" :rows="4" @answer="update" />
        <p class="mt-6 text-center text-sm italic opacity-60">
          <a class="link text-rose" href="#/settings">{{ t.changeWeeklyPrompts }}</a>
        </p>
      </form>
    </template>

    <nav class="mt-4 flex justify-between">
      <a class="btn btn-ghost btn-sm" :href="`#/week/${prevSunday}`">{{ t.previousWeek }}</a>
      <a v-if="nextStarted" class="btn btn-ghost btn-sm" :href="`#/week/${nextSunday}`">{{ t.nextWeek }}</a>
    </nav>
  </section>
</template>
