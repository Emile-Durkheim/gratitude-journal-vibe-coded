import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadAll,
  makeEntry,
  mergeEntries,
  requestPersistence,
  saveEntries,
  saveEntry,
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
  const [settings, setSettingsState] = useState<Settings | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [persist, setPersist] = useState<PersistState | null>(null)
  // Days edited but not yet written, flushed after a short pause or when the page is hidden.
  const pending = useRef(new Map<string, Entry | undefined>())
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    loadAll()
      .then(({ entries, settings }) => {
        setEntries(entries)
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
    for (const [date, entry] of batch) report(saveEntry(date, entry))
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

  const setItems = useCallback(
    (date: string, items: Item[]) => {
      const entry = makeEntry(date, items)
      setEntries((prev) => {
        const next = { ...prev }
        if (entry) next[date] = entry
        else delete next[date]
        return next
      })
      pending.current.set(date, entry)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
    },
    [flush],
  )

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
      setEntries((prev) => {
        const next = mergeEntries(prev, file.entries)
        report(saveEntries(next))
        return next
      })
      setSettingsState(file.settings)
      report(saveSettings(file.settings))
    },
    [flush, report],
  )

  const retryPersist = useCallback(() => {
    requestPersistence().then(setPersist)
  }, [])

  return { loaded, entries, settings, saveError, persist, setItems, updateSettings, importFile, flush, retryPersist }
}
