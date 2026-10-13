<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { MotionConfig } from 'motion-v'
import CalendarView from './CalendarView.vue'
import DayView from './DayView.vue'
import PromptLibraryView from './PromptLibraryView.vue'
import OnboardingView from './OnboardingView.vue'
import SettingsView from './SettingsView.vue'
import WeekView from './WeekView.vue'
import WreathView from './WreathView.vue'
import { fromKey, setDateLocale, todayKey, weekEnd } from './dates'
import { STRINGS, localeFor } from './i18n'
import { LangKey } from './useLang'
import { useHashRoute } from './useHashRoute'
import { useJournal } from './useJournal'

const route = useHashRoute()
const journal = useJournal()
const { entries, weeks, settings, lang, language, loaded, saveError, persist, onboarded } = journal
const now = new Date()
const month = ref({ year: now.getFullYear(), month: now.getMonth() })
const wreathWeek = ref(weekEnd(todayKey()))

// Dates are formatted while rendering, so the locale has to be in place before the views render.
watch(
  lang,
  (l) => {
    setDateLocale(localeFor(l))
    document.documentElement.lang = l
    document.title = STRINGS[l].docTitle
  },
  { immediate: true, flush: 'sync' },
)
provide(
  LangKey,
  computed(() => ({ lang: lang.value, choice: language.value, t: STRINGS[lang.value], setChoice: journal.setLanguage })),
)

const backFromDay = (date: string) => {
  const d = fromKey(date)
  month.value = { year: d.getFullYear(), month: d.getMonth() }
  wreathWeek.value = weekEnd(date)
}
// Leaving the introduction lands on the wreath, or on today's page with the wreath to go back to.
const finishOnboarding = (write: boolean) => {
  journal.finishOnboarding()
  if (route.value.name === 'welcome') location.replace('#/')
  if (write) location.hash = `#/day/${todayKey()}`
}
const backFromWeek = (sunday: string) => {
  const thisWeek = weekEnd(todayKey())
  wreathWeek.value = sunday > thisWeek ? thisWeek : sunday
}
</script>

<template>
  <MotionConfig reduced-motion="user">
    <main class="app mx-auto max-w-md px-5">
      <div v-if="saveError" role="alert" class="alert alert-error mb-3 text-sm">{{ STRINGS[lang].saveError }}</div>
      <template v-if="loaded && settings">
        <OnboardingView
          v-if="!onboarded || route.name === 'welcome'"
          :settings="settings"
          @settings-change="journal.updateSettings"
          @done="finishOnboarding"
        />
        <DayView
          v-else-if="route.name === 'day'"
          :key="route.date"
          :date="route.date"
          :entry="entries[route.date]"
          :entries="entries"
          :has-week-review="!!weeks[route.date]"
          :current-prompts="settings.prompts"
          @change="journal.setItems"
          @stamp="journal.stamp"
          @unstamp="journal.unstamp"
          @back="backFromDay(route.date)"
        />
        <WeekView
          v-else-if="route.name === 'week'"
          :key="route.sunday"
          :sunday="route.sunday"
          :entry="weeks[route.sunday]"
          :days="entries"
          :current-prompts="settings.weeklyPrompts"
          @change="journal.setWeekItems"
          @back="backFromWeek(route.sunday)"
        />
        <SettingsView
          v-else-if="route.name === 'settings'"
          :entries="entries"
          :weeks="weeks"
          :settings="settings"
          :persist="persist"
          @settings-change="journal.updateSettings"
          @import="journal.importFile"
          @before-export="journal.flush"
          @retry-persist="journal.retryPersist"
        />
        <PromptLibraryView
          v-else-if="route.name === 'prompts'"
          :key="route.kind"
          :kind="route.kind"
          :settings="settings"
          @settings-change="journal.updateSettings"
        />
        <CalendarView
          v-else-if="route.name === 'calendar'"
          :year="month.year"
          :month="month.month"
          :entries="entries"
          :weeks="weeks"
          :prompt-count="settings.prompts.length"
          @month-change="(year, m) => (month = { year, month: m })"
        />
        <WreathView
          v-else
          :sunday="wreathWeek"
          :entries="entries"
          :weeks="weeks"
          :prompt-count="settings.prompts.length"
          @week-change="(s) => (wreathWeek = s)"
        />
      </template>
    </main>
  </MotionConfig>
</template>
