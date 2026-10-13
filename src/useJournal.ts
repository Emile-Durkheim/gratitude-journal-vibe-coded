import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [loaded, setLoaded] = useState(false)
  const [entries, setEntries] = useState<Entries>({})
  const [weeks, setWeeks] = useState<Entries>({})
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [persist, setPersist] = useState<PersistState | null>(null)
  // null follows the device's language
  const [language, setLanguageState] = useState<Lang | null>(null)
  const lang: Lang = language ?? deviceLang()
  // Days and weeks edited but not yet written, flushed after a short pause or when the page is hidden.
  const entriesRef = useRef(entries)
  const weeksRef = useRef(weeks)
  useEffect(() => {
    entriesRef.current = entries
    weeksRef.current = weeks
  }, [entries, weeks])
  const pending = useRef(new Map<string, { kind: 'day' | 'week'; date: string; entry: Entry | undefined }>())
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    loadAll()
      .then(({ entries, weeks, settings, language }) => {
        setLanguageState(language)
        setEntries(entries)
        setWeeks(weeks)
        setSettingsState(settings)
      })
      .catch(() => setSaveError(true))
      .finally(() => setLoaded(true))
    requestPersistence().then(setPersist)
  }, [])

  const report = useCallback((p: Promise<unknown>) => {
    p.then(() => setSaveError(false)).catch(() => setSaveError(true))
  }, [])

  const flush = useCallback(() => {
    window.clearTimeout(timer.current)
    const batch = [...pending.current]
    pending.current.clear()
    for (const [, { kind, date, entry }] of batch) report(kind === 'day' ? saveEntry(date, entry) : saveWeek(date, entry))
  }, [report])

  useEffect(() => {
    const onVisibility = () => document.visibilityState === 'hidden' && flush()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [flush])

  const edit = useCallback(
    (kind: 'day' | 'week', date: string, items: Item[], stampedAt?: number) => {
      const entry = makeEntry(date, items, Date.now(), stampedAt)
      const apply = (prev: Entries) => {
        const next = { ...prev }
        if (entry) next[date] = entry
        else delete next[date]
        return next
      }
      // Keep the ref current right away, so an edit straight after a stamp keeps the stamp.
      if (kind === 'day') {
        entriesRef.current = apply(entriesRef.current)
        setEntries(apply)
      } else setWeeks(apply)
      pending.current.set(`${kind}:${date}`, { kind, date, entry })
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
    },
    [flush],
  )
  const setItems = useCallback(
    (date: string, items: Item[]) => edit('day', date, items, entriesRef.current[date]?.stampedAt),
    [edit],
  )
  /** Stamp a day as pressed, then write it straight away. */
  const stamp = useCallback(
    (date: string, items: Item[]) => {
      edit('day', date, items, Date.now())
      flush()
    },
    [edit, flush],
  )
  const setWeekItems = useCallback((sunday: string, items: Item[]) => edit('week', sunday, items), [edit])

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettingsState((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...patch }
        report(saveSettings(next))
        return next
      })
    },
    [report],
  )

  /** Switch language; active library prompts switch with it, the user's own stay as written. */
  const setLanguage = useCallback(
    (choice: Lang | null) => {
      const next = choice ?? deviceLang()
      setLanguageState(choice)
      report(saveLanguage(choice))
      setSettingsState((prev) => {
        if (!prev) return prev
        const translated = {
          ...prev,
          prompts: translatePrompts(prev.prompts, next),
          weeklyPrompts: translatePrompts(prev.weeklyPrompts, next),
        }
        report(saveSettings(translated))
        return translated
      })
    },
    [report],
  )

  const importFile = useCallback(
    (file: ExportFile) => {
      flush()
      // Merge outside the state updaters so the writes happen once, not twice under StrictMode.
      const mergedDays = mergeEntries(entriesRef.current, file.entries)
      const mergedWeeks = mergeEntries(weeksRef.current, file.weeks)
      setEntries(mergedDays)
      setWeeks(mergedWeeks)
      report(saveEntries(mergedDays, mergedWeeks))
      setSettingsState(file.settings)
      report(saveSettings(file.settings))
    },
    [flush, report],
  )

  const retryPersist = useCallback(() => {
    requestPersistence().then(setPersist)
  }, [])

  return { loaded, lang, language, setLanguage, entries, weeks, settings, saveError, persist, setItems, stamp, setWeekItems, updateSettings, importFile, flush, retryPersist }
}
