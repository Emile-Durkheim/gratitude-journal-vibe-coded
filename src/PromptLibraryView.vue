<script setup lang="ts">
import { computed, ref } from 'vue'
import BackLink from './BackLink.vue'
import LibraryRow from './LibraryRow.vue'
import TopBar from './TopBar.vue'
import { defaultPrompts, defaultWeeklyPrompts, promptLibrary, weeklyPromptLibrary } from './prompts'
import { useLang } from './useLang'
import type { Settings } from './storage'

/** The prompt library on its own page, opened from the blank row under the active prompts in settings. */
const props = defineProps<{ kind: 'daily' | 'weekly'; settings: Settings }>()
const emit = defineEmits<{ settingsChange: [patch: Partial<Settings>] }>()
const lang = useLang()
const t = computed(() => lang.value.t)
const draft = ref('')

const daily = computed(() => props.kind === 'daily')
const title = computed(() => (daily.value ? t.value.dailyLibraryTitle : t.value.weeklyLibraryTitle))
const prompts = computed(() => (daily.value ? props.settings.prompts : props.settings.weeklyPrompts))
const custom = computed(() => (daily.value ? props.settings.customPrompts : props.settings.customWeeklyPrompts))
const library = computed(() => (daily.value ? promptLibrary : weeklyPromptLibrary)(lang.value.lang))
const defaults = computed(() => (daily.value ? defaultPrompts : defaultWeeklyPrompts)(lang.value.lang))

const change = (patch: { prompts?: string[]; custom?: string[] }) =>
  emit(
    'settingsChange',
    daily.value
      ? { ...(patch.prompts && { prompts: patch.prompts }), ...(patch.custom && { customPrompts: patch.custom }) }
      : { ...(patch.prompts && { weeklyPrompts: patch.prompts }), ...(patch.custom && { customWeeklyPrompts: patch.custom }) },
  )

const toggle = (text: string) => {
  if (prompts.value.includes(text)) {
    if (prompts.value.length > 1) change({ prompts: prompts.value.filter((p) => p !== text) })
  } else {
    change({ prompts: [...prompts.value, text] })
  }
}
const add = () => {
  const text = draft.value.trim()
  if (!text) return
  change({
    custom: custom.value.includes(text) ? custom.value : [...custom.value, text],
    prompts: prompts.value.includes(text) ? prompts.value : [...prompts.value, text],
  })
  draft.value = ''
}
const remove = (text: string) => {
  const nextPrompts = prompts.value.filter((p) => p !== text)
  change({ custom: custom.value.filter((p) => p !== text), prompts: nextPrompts.length ? nextPrompts : defaults.value })
}
</script>

<template>
  <section>
    <TopBar :title="title">
      <template #start><BackLink href="#/settings" :label="t.settings" /></template>
    </TopBar>
    <p class="mb-3 text-sm text-base-content/70">{{ t.libraryIntro }}</p>

    <form class="add-row mb-2 flex gap-2" @submit.prevent="add">
      <input
        v-model="draft"
        type="text"
        class="input input-primary grow"
        maxlength="140"
        :placeholder="t.writeYourOwn"
        :aria-label="`${t.writeYourOwn}: ${title}`"
      />
      <button type="submit" class="btn btn-secondary" :disabled="!draft.trim()">{{ t.add }}</button>
    </form>

    <div class="library" role="list">
      <div v-if="custom.length > 0" role="presentation">
        <h3 class="pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">{{ t.yourOwn }}</h3>
        <LibraryRow
          v-for="text in custom"
          :key="text"
          :text="text"
          :on="prompts.includes(text)"
          deletable
          @toggle="toggle(text)"
          @delete="remove(text)"
        />
      </div>
      <div v-for="group in library" :key="group.title" role="presentation">
        <h3 class="pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">{{ group.title }}</h3>
        <LibraryRow
          v-for="lp in group.prompts"
          :key="lp.text"
          :text="lp.text"
          :why="lp.why"
          :on="prompts.includes(lp.text)"
          @toggle="toggle(lp.text)"
        />
      </div>
    </div>
  </section>
</template>
