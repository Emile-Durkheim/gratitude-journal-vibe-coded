import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadAll,
  makeEntry,
  mergeEntries,
  requestPersistence,
  saveEntries,
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

const SAVE_DELAY_MS = 400

export function useJournal() {
  const [loaded, setLoaded] = useState(false)
  const [entries, setEntries] = useState<Entries>({})
  const [weeks, setWeeks] = useState<Entries>({})
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [persist, setPersist] = useState<PersistState | null>(null)
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
      .then(({ entries, weeks, settings }) => {
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
    (kind: 'day' | 'week', date: string, items: Item[]) => {
      const entry = makeEntry(date, items)
      const apply = (prev: Entries) => {
        const next = { ...prev }
        if (entry) next[date] = entry
        else delete next[date]
        return next
      }
      if (kind === 'day') setEntries(apply)
      else setWeeks(apply)
      pending.current.set(`${kind}:${date}`, { kind, date, entry })
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
    },
    [flush],
  )
  const setItems = useCallback((date: string, items: Item[]) => edit('day', date, items), [edit])
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

  return { loaded, entries, weeks, settings, saveError, persist, setItems, setWeekItems, updateSettings, importFile, flush, retryPersist }
}
