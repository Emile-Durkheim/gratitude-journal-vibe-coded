<script setup lang="ts">
import { computed, ref } from 'vue'
import BackLink from '../components/ui/BackLink.vue'
import InstallCard from '../components/settings/InstallCard.vue'
import PromptSection from '../components/settings/PromptSection.vue'
import ReminderCard from '../components/settings/ReminderCard.vue'
import TopBar from '../components/ui/TopBar.vue'
import { todayKey } from '../lib/dates'
import { LANGS, deviceLang, type Lang } from '../content/i18n'
import { useLang } from '../composables/useLang'
import { parseExport, toExport, type Entries, type ExportFile, type PersistState, type Settings } from '../lib/storage'

const props = defineProps<{
  entries: Entries
  weeks: Entries
  settings: Settings
  persist: PersistState | null
}>()
const emit = defineEmits<{
  settingsChange: [patch: Partial<Settings>]
  import: [file: ExportFile]
  beforeExport: []
  retryPersist: []
}>()
const langState = useLang()
const t = computed(() => langState.value.t)
const lang = computed(() => langState.value.lang)
const message = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const options: (Lang | null)[] = [null, ...LANGS]

const DAY_MS = 24 * 60 * 60 * 1000

const exportData = () => {
  emit('beforeExport')
  const now = Date.now()
  const file = toExport(props.entries, { ...props.settings, lastExportAt: now }, props.weeks)
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `gratitude-journal-${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
  emit('settingsChange', { lastExportAt: now })
}

const importData = async (file: File) => {
  try {
    let data: ExportFile
    try {
      data = parseExport(await file.text(), lang.value)
    } catch {
      throw new Error(t.value.notABackup)
    }
    emit('import', data)
    message.value = t.value.imported(Object.keys(data.entries).length, Object.keys(data.weeks).length)
  } catch (e) {
    message.value = e instanceof Error ? e.message : t.value.importFailed
  }
}

const onFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) importData(file)
  input.value = ''
}

const safety = computed(() => {
  const total = Object.keys(props.entries).length
  const totalWeeks = Object.keys(props.weeks).length
  const status = { persisted: t.value.persisted, 'not-persisted': t.value.notPersisted, unsupported: t.value.persistUnsupported }
  return [t.value.livesHere(total, totalWeeks), props.persist && status[props.persist], t.value.stillDeleted].filter(Boolean).join(' ')
})
const lastExport = computed(() =>
  props.settings.lastExportAt ? Math.floor((Date.now() - props.settings.lastExportAt) / DAY_MS) : null,
)
</script>

<template>
  <section>
    <TopBar :title="t.settings">
      <template #start><BackLink href="#/" :label="t.backToWreath" /></template>
    </TopBar>

    <InstallCard :persist="persist" />

    <div class="card mb-4 rounded-sm border border-base-300 bg-base-100">
      <div class="card-body gap-2 p-4">
        <h2 class="card-title text-xl font-normal italic">{{ t.language }}</h2>
        <p class="text-sm text-base-content/70">{{ t.languageIntro }}</p>
        <div class="language-choice join mt-1 self-start" role="radiogroup" :aria-label="t.language">
          <button
            v-for="option in options"
            :key="option ?? 'device'"
            type="button"
            role="radio"
            :aria-checked="langState.choice === option"
            :class="['btn join-item btn-sm', langState.choice === option ? 'btn-primary' : 'btn-outline btn-primary']"
            @click="langState.setChoice(option)"
          >
            {{ option ? t.langNames[option] : t.languageAuto(t.langNames[deviceLang()]) }}
          </button>
        </div>
      </div>
    </div>

    <ReminderCard />

    <PromptSection
      :title="t.dailyPromptsTitle"
      :intro="t.dailyPromptsIntro"
      :prompts="settings.prompts"
      :add-label="t.addPrompts"
      library-href="#/prompts/daily"
      @change="(prompts) => emit('settingsChange', { prompts })"
    />

    <PromptSection
      :title="t.weeklyPromptsTitle"
      :intro="t.weeklyPromptsIntro"
      :prompts="settings.weeklyPrompts"
      :add-label="t.addWeeklyPrompts"
      library-href="#/prompts/weekly"
      @change="(prompts) => emit('settingsChange', { weeklyPrompts: prompts })"
    />

    <div class="card mb-4 rounded-sm border border-base-300 bg-base-100">
      <div class="card-body gap-3 p-4">
        <h2 class="card-title text-xl font-normal italic">{{ t.safeTitle }}</h2>
        <p class="text-sm text-base-content/70">{{ safety }}</p>
        <button v-if="persist === 'not-persisted'" class="btn btn-ghost btn-sm self-start" @click="emit('retryPersist')">
          {{ t.askAgain }}
        </button>
        <p class="text-sm font-bold">{{ lastExport === null ? t.noBackup : t.lastBackup(lastExport) }}</p>
        <div class="grid grid-cols-2 gap-3">
          <button class="btn btn-primary" @click="exportData">{{ t.exportBackup }}</button>
          <button class="btn btn-outline btn-primary" @click="fileInput?.click()">{{ t.import }}</button>
          <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />
        </div>
        <p class="text-xs text-base-content/60">{{ t.importNote }}</p>
      </div>
    </div>

    <div v-if="message" role="status" class="alert alert-success mb-4 text-sm">{{ message }}</div>

    <p class="text-center text-sm italic"><a class="link text-rose" href="#/welcome">{{ t.showIntro }}</a></p>
  </section>
</template>
