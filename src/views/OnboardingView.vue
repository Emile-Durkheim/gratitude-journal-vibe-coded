<script setup lang="ts">
import { computed, ref } from 'vue'
import Flower from '../components/flower/Flower.vue'
import InstallCard from '../components/settings/InstallCard.vue'
import OnboardingIntro from '../components/onboarding/OnboardingIntro.vue'
import OnboardingPrompts from '../components/onboarding/OnboardingPrompts.vue'
import ReminderCard from '../components/settings/ReminderCard.vue'
import { todayKey } from '../lib/dates'
import { LANGS, STRINGS, deviceLang, type Lang } from '../content/i18n'
import { useInstall } from '../lib/install'
import { defaultPrompts, promptLibrary, weeklyPromptLibrary } from '../content/prompts'
import { useLang } from '../composables/useLang'
import type { PersistState, Settings } from '../lib/storage'

/**
 * The first-run introduction: a page on the practice, then the settings one at a time. Every
 * choice is saved as it is made, so leaving halfway keeps what was picked.
 */
defineProps<{ settings: Settings; persist: PersistState | null }>()
const emit = defineEmits<{
  settingsChange: [patch: Partial<Settings>]
  /** Finished or skipped; `write` opens today's page rather than the wreath. */
  done: [write: boolean]
}>()
const langState = useLang()
const t = computed(() => langState.value.t)
const install = useInstall()
const today = todayKey()

const STEPS = ['intro', 'language', 'daily', 'weekly', 'reminder', 'home', 'done'] as const
const step = ref(0)
const direction = ref<'forward' | 'back'>('forward')
const name = computed(() => STEPS[step.value])
// the intro and the closing page aren't counted as steps
const total = STEPS.length - 2

const go = (to: number) => {
  direction.value = to < step.value ? 'back' : 'forward'
  step.value = to
  window.scrollTo(0, 0)
}
const options: (Lang | null)[] = [null, ...LANGS]
const sample = (l: Lang) => STRINGS[l].quoted(defaultPrompts(l)[0])
</script>

<template>
  <section class="onboarding">
    <Transition :name="`ob-${direction}`" mode="out-in">
      <OnboardingIntro v-if="name === 'intro'" key="intro" @begin="go(1)" @skip="emit('done', false)" />

      <div v-else-if="name === 'done'" key="done" class="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <span class="sway small" aria-hidden="true">
          <Flower :size="120" :petals="settings.prompts.length" :filled="settings.prompts.length" :day="today" stem />
        </span>
        <h1 class="mt-5 text-[2.2rem] italic leading-tight">{{ t.obDoneTitle }}</h1>
        <div class="welcome-rule mx-auto mt-3" aria-hidden="true"><span>✿</span></div>
        <p class="mt-4 max-w-xs leading-relaxed">{{ t.obDoneBody }}</p>
        <div class="mt-8 grid w-full gap-3">
          <button type="button" class="btn btn-primary btn-lg w-full" @click="emit('done', false)">{{ t.obToWreath }}</button>
        </div>
      </div>

      <div v-else :key="name" class="flex min-h-[calc(100vh-3rem)] flex-col">
        <header class="mb-3 flex min-h-12 items-center gap-2 border-b-[1.5px] border-ink pb-1">
          <button type="button" class="btn btn-ghost btn-sm btn-square text-2xl" :aria-label="t.back" @click="go(step - 1)">‹</button>
          <span class="flex flex-1 items-center justify-center gap-2">
            <Flower :size="26" :petals="total" :filled="step" :day="today" />
            <span class="text-[0.75rem] font-semibold uppercase tracking-[0.22em]">{{ t.stepOf(step, total) }}</span>
          </span>
          <button type="button" class="btn btn-ghost btn-sm italic opacity-70" @click="go(STEPS.length - 1)">{{ t.skip }}</button>
        </header>

        <div class="grow">
          <template v-if="name === 'language'">
            <h1 class="ob-title">{{ t.obLanguageTitle }}</h1>
            <p class="ob-body">{{ t.obLanguageBody }}</p>
            <div class="mt-5 grid gap-3" role="radiogroup" :aria-label="t.language">
              <button
                v-for="option in options"
                :key="option ?? 'device'"
                type="button"
                role="radio"
                :aria-checked="langState.choice === option"
                :class="['ob-choice', { on: langState.choice === option }]"
                @click="langState.setChoice(option)"
              >
                <span class="text-lg">{{ option ? t.langNames[option] : t.languageAuto(t.langNames[deviceLang()]) }}</span>
                <span class="mt-0.5 block text-sm italic opacity-60" :lang="option ?? deviceLang()">{{ sample(option ?? deviceLang()) }}</span>
              </button>
            </div>
          </template>

          <template v-else-if="name === 'daily'">
            <h1 class="ob-title">{{ t.obDailyTitle }}</h1>
            <p class="ob-body">{{ t.obDailyBody }}</p>
            <OnboardingPrompts :prompts="settings.prompts" :library="promptLibrary(langState.lang)" @change="(prompts) => emit('settingsChange', { prompts })" />
          </template>

          <template v-else-if="name === 'weekly'">
            <h1 class="ob-title">{{ t.obWeeklyTitle }}</h1>
            <p class="ob-body">{{ t.obWeeklyBody }}</p>
            <OnboardingPrompts
              :prompts="settings.weeklyPrompts"
              :library="weeklyPromptLibrary(langState.lang)"
              @change="(weeklyPrompts) => emit('settingsChange', { weeklyPrompts })"
            />
          </template>

          <template v-else-if="name === 'reminder'">
            <h1 class="ob-title">{{ t.obReminderTitle }}</h1>
            <p class="ob-body mb-5">{{ t.obReminderBody }}</p>
            <ReminderCard />
          </template>

          <template v-else-if="name === 'home'">
            <h1 class="ob-title">{{ t.obHomeTitle }}</h1>
            <InstallCard :persist="persist" class="mt-4" />
            <p class="ob-body mb-5">{{ t.obHomeBody }}</p>
            <p v-if="install.kind === 'installed'" class="italic opacity-70">{{ t.obInstalled }}</p>
          </template>
        </div>

        <div class="ob-footer">
          <button type="button" class="btn btn-primary btn-lg w-full" @click="go(step + 1)">{{ t.next }}</button>
        </div>
      </div>
    </Transition>
  </section>
</template>
