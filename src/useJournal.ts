import { useCallback, useEffect, useRef, useState } from 'react'
import type { Prompts } from './prompts'
import {
  loadEntries,
  loadSettings,
  mergeEntries,
  saveEntries,
  saveSettings,
  withAnswers,
  type Entries,
  type ExportFile,
  type Settings,
} from './storage'

const SAVE_DELAY_MS = 400

export function useJournal() {
  const [entries, setEntries] = useState<Entries>(loadEntries)
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [saveError, setSaveError] = useState(false)
  const pending = useRef<Entries | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const flush = useCallback(() => {
    window.clearTimeout(timer.current)
    if (!pending.current) return
    try {
      saveEntries(pending.current)
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
    pending.current = null
  }, [])

  useEffect(() => {
    const onHide = () => flush()
    const onVisibility = () => document.visibilityState === 'hidden' && flush()
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [flush])

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {})
  }, [])

  const schedule = useCallback(
    (next: Entries) => {
      pending.current = next
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, SAVE_DELAY_MS)
    },
    [flush],
  )

  const setAnswers = useCallback(
    (date: string, prompts: Prompts, answers: Prompts) => {
      setEntries((prev) => {
        const next = withAnswers(prev, date, prompts, answers)
        schedule(next)
        return next
      })
    },
    [schedule],
  )

  const setPrompts = useCallback((prompts: Prompts) => {
    const next = { prompts }
    setSettingsState(next)
    saveSettings(next)
  }, [])

  const importFile = useCallback(
    (file: ExportFile) => {
      flush()
      setEntries((prev) => {
        const next = mergeEntries(prev, file.entries)
        saveEntries(next)
        return next
      })
      setSettingsState(file.settings)
      saveSettings(file.settings)
    },
    [flush],
  )

  return { entries, settings, saveError, setAnswers, setPrompts, importFile, flush }
}
