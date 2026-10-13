import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import {
  loadAll,
  makeEntry,
  mergeEntries,
  requestPersistence,
  saveEntries,
  saveLanguage,
  saveEntry,
  saveWeek,
  saveSettings,
  type Entries,
  type Entry,
  type ExportFile,
  type Item,
  type PersistState,
  type Settings,
} from './storage'
import { deviceLang, type Lang } from './i18n'
import { translatePrompts } from './prompts'

const SAVE_DELAY_MS = 400

export function useJournal() {
  const loaded = ref(false)
  // Replaced whole on every change rather than mutated, so the views can treat them as plain values.
  const entries = shallowRef<Entries>({})
  const weeks = shallowRef<Entries>({})
  const settings = shallowRef<Settings | null>(null)
  const saveError = ref(false)
  const persist = ref<PersistState | null>(null)
  // null follows the device's language
  const language = ref<Lang | null>(null)
  const lang = computed<Lang>(() => language.value ?? deviceLang())
  // Days and weeks edited but not yet written, flushed after a short pause or when the page is hidden.
  const pending = new Map<string, { kind: 'day' | 'week'; date: string; entry: Entry | undefined }>()
  let timer: number | undefined

  loadAll()
    .then((all) => {
      language.value = all.language
      entries.value = all.entries
      weeks.value = all.weeks
      settings.value = all.settings
    })
    .catch(() => (saveError.value = true))
    .finally(() => (loaded.value = true))
  requestPersistence().then((p) => (persist.value = p))

  const report = (p: Promise<unknown>) => {
    p.then(() => (saveError.value = false)).catch(() => (saveError.value = true))
  }

  const flush = () => {
    window.clearTimeout(timer)
    const batch = [...pending]
    pending.clear()
    for (const [, { kind, date, entry }] of batch) report(kind === 'day' ? saveEntry(date, entry) : saveWeek(date, entry))
  }

  const onVisibility = () => document.visibilityState === 'hidden' && flush()
  onMounted(() => {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
  })
  onUnmounted(() => {
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', onVisibility)
    flush()
  })

  const edit = (kind: 'day' | 'week', date: string, items: Item[], stampedAt?: number) => {
    const entry = makeEntry(date, items, Date.now(), stampedAt)
    const target = kind === 'day' ? entries : weeks
    const next = { ...target.value }
    if (entry) next[date] = entry
    else delete next[date]
    target.value = next
    pending.set(`${kind}:${date}`, { kind, date, entry })
    window.clearTimeout(timer)
    timer = window.setTimeout(flush, SAVE_DELAY_MS)
  }
  const setItems = (date: string, items: Item[]) => edit('day', date, items, entries.value[date]?.stampedAt)
  /** Stamp a day as pressed, then write it straight away. */
  const stamp = (date: string, items: Item[]) => {
    edit('day', date, items, Date.now())
    flush()
  }
  /** Take the stamp off again, so the day can be edited; written straight away too. */
  const unstamp = (date: string, items: Item[]) => {
    edit('day', date, items)
    flush()
  }
  const setWeekItems = (sunday: string, items: Item[]) => edit('week', sunday, items)

  const updateSettings = (patch: Partial<Settings>) => {
    if (!settings.value) return
    const next = { ...settings.value, ...patch }
    settings.value = next
    report(saveSettings(next))
  }

  /** Switch language; active library prompts switch with it, the user's own stay as written. */
  const setLanguage = (choice: Lang | null) => {
    const next = choice ?? deviceLang()
    language.value = choice
    report(saveLanguage(choice))
    const prev = settings.value
    if (!prev) return
    const translated = {
      ...prev,
      prompts: translatePrompts(prev.prompts, next),
      weeklyPrompts: translatePrompts(prev.weeklyPrompts, next),
    }
    settings.value = translated
    report(saveSettings(translated))
  }

  const importFile = (file: ExportFile) => {
    flush()
    const mergedDays = mergeEntries(entries.value, file.entries)
    const mergedWeeks = mergeEntries(weeks.value, file.weeks)
    entries.value = mergedDays
    weeks.value = mergedWeeks
    report(saveEntries(mergedDays, mergedWeeks))
    settings.value = file.settings
    report(saveSettings(file.settings))
  }

  const retryPersist = () => {
    requestPersistence().then((p) => (persist.value = p))
  }

  return { loaded, lang, language, setLanguage, entries, weeks, settings, saveError, persist, setItems, stamp, unstamp, setWeekItems, updateSettings, importFile, flush, retryPersist }
}
