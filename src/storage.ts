import { isValidKey } from './dates'
import { DEFAULT_PROMPTS, type Prompts } from './prompts'

export type Entry = {
  date: string
  prompts: Prompts
  answers: Prompts
  updatedAt: number
}

export type Entries = Record<string, Entry>

export type Settings = {
  prompts: Prompts
}

export type ExportFile = {
  version: 1
  settings: Settings
  entries: Entries
}

const ENTRIES_KEY = 'gj:v1:entries'
const SETTINGS_KEY = 'gj:v1:settings'

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function isTriple(x: unknown): x is Prompts {
  return Array.isArray(x) && x.length === 3 && x.every((s) => typeof s === 'string')
}

function isEntry(x: unknown): x is Entry {
  if (!x || typeof x !== 'object') return false
  const e = x as Entry
  return (
    typeof e.date === 'string' &&
    isValidKey(e.date) &&
    isTriple(e.prompts) &&
    isTriple(e.answers) &&
    typeof e.updatedAt === 'number'
  )
}

export function sanitizeEntries(x: unknown): Entries {
  const out: Entries = {}
  if (!x || typeof x !== 'object') return out
  for (const [key, value] of Object.entries(x)) {
    if (isEntry(value) && value.date === key) out[key] = value
  }
  return out
}

export function sanitizeSettings(x: unknown): Settings {
  const prompts = (x as Settings | null)?.prompts
  return { prompts: isTriple(prompts) ? prompts : DEFAULT_PROMPTS }
}

export function loadEntries(): Entries {
  return sanitizeEntries(readJson(ENTRIES_KEY))
}

export function saveEntries(entries: Entries): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function loadSettings(): Settings {
  return sanitizeSettings(readJson(SETTINGS_KEY))
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function hasContent(answers: Prompts): boolean {
  return answers.some((a) => a.trim() !== '')
}

/** Returns new entries with this day's answers applied; empty days are removed. */
export function withAnswers(
  entries: Entries,
  date: string,
  prompts: Prompts,
  answers: Prompts,
  now = Date.now(),
): Entries {
  const next = { ...entries }
  if (hasContent(answers)) {
    next[date] = { date, prompts, answers, updatedAt: now }
  } else {
    delete next[date]
  }
  return next
}

export function toExport(entries: Entries, settings: Settings): ExportFile {
  return { version: 1, settings, entries }
}

/** Parse an export file. Throws on anything that isn't one. */
export function parseExport(text: string): ExportFile {
  const data = JSON.parse(text)
  if (!data || data.version !== 1 || typeof data.entries !== 'object') {
    throw new Error('Not a Gratitude Journal export file.')
  }
  return { version: 1, settings: sanitizeSettings(data.settings), entries: sanitizeEntries(data.entries) }
}

/** Merge by date; the newer updatedAt wins. */
export function mergeEntries(current: Entries, incoming: Entries): Entries {
  const out = { ...current }
  for (const [key, entry] of Object.entries(incoming)) {
    if (!out[key] || entry.updatedAt > out[key].updatedAt) out[key] = entry
  }
  return out
}
