import { createStore, del, entries as idbEntries, set, setMany } from 'idb-keyval'
import { isValidKey } from './dates'
import { DEFAULT_PROMPTS } from './prompts'

export type Item = { prompt: string; answer: string }

export type Entry = {
  date: string
  /** Prompts are stored with the answers, so editing the prompt list never relabels old days. */
  items: Item[]
  updatedAt: number
}

export type Entries = Record<string, Entry>

export type Settings = {
  /** Active prompts, in order. At least one. */
  prompts: string[]
  /** Prompts the user wrote themselves (shown in the library). */
  customPrompts: string[]
  lastExportAt: number | null
}

export type ExportFile = {
  version: 2
  settings: Settings
  entries: Entries
}

export const DEFAULT_SETTINGS: Settings = { prompts: DEFAULT_PROMPTS, customPrompts: [], lastExportAt: null }

const store = createStore('gratitude-journal', 'kv')
const SETTINGS_KEY = 'settings'
const ENTRY_PREFIX = 'entry:'

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((s) => typeof s === 'string')
}

function isEntry(x: unknown): x is Entry {
  if (!x || typeof x !== 'object') return false
  const e = x as Entry
  return (
    typeof e.date === 'string' &&
    isValidKey(e.date) &&
    Array.isArray(e.items) &&
    e.items.every((i) => i && typeof i.prompt === 'string' && typeof i.answer === 'string') &&
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
  const s = (x ?? {}) as Partial<Settings>
  const prompts = isStringArray(s.prompts) ? s.prompts.filter((p) => p.trim()) : []
  return {
    prompts: prompts.length ? prompts : DEFAULT_PROMPTS,
    customPrompts: isStringArray(s.customPrompts) ? s.customPrompts.filter((p) => p.trim()) : [],
    lastExportAt: typeof s.lastExportAt === 'number' ? s.lastExportAt : null,
  }
}

export async function loadAll(): Promise<{ entries: Entries; settings: Settings }> {
  const rows = await idbEntries<string, unknown>(store)
  const raw: Record<string, unknown> = {}
  let settings: unknown = null
  for (const [key, value] of rows) {
    if (key === SETTINGS_KEY) settings = value
    else if (key.startsWith(ENTRY_PREFIX)) raw[key.slice(ENTRY_PREFIX.length)] = value
  }
  return { entries: sanitizeEntries(raw), settings: sanitizeSettings(settings) }
}

/** Writes one day; an entry with no content deletes the day. */
export async function saveEntry(date: string, entry: Entry | undefined): Promise<void> {
  if (entry) await set(ENTRY_PREFIX + date, entry, store)
  else await del(ENTRY_PREFIX + date, store)
}

export async function saveEntries(entries: Entries): Promise<void> {
  await setMany(
    Object.values(entries).map((e) => [ENTRY_PREFIX + e.date, e]),
    store,
  )
}

export async function saveSettings(settings: Settings): Promise<void> {
  await set(SETTINGS_KEY, settings, store)
}

export function hasContent(items: Item[]): boolean {
  return items.some((i) => i.answer.trim() !== '')
}

/** The entry to store for this day, or undefined if it's empty. */
export function makeEntry(date: string, items: Item[], now = Date.now()): Entry | undefined {
  return hasContent(items) ? { date, items, updatedAt: now } : undefined
}

export function toExport(entries: Entries, settings: Settings): ExportFile {
  return { version: 2, settings, entries }
}

/** Parse an export file. Throws on anything that isn't one. */
export function parseExport(text: string): ExportFile {
  const data = JSON.parse(text)
  if (!data || data.version !== 2 || typeof data.entries !== 'object') {
    throw new Error('Not a Gratitude Journal backup file.')
  }
  return { version: 2, settings: sanitizeSettings(data.settings), entries: sanitizeEntries(data.entries) }
}

/** Merge by date; the newer updatedAt wins. */
export function mergeEntries(current: Entries, incoming: Entries): Entries {
  const out = { ...current }
  for (const [key, entry] of Object.entries(incoming)) {
    if (!out[key] || entry.updatedAt > out[key].updatedAt) out[key] = entry
  }
  return out
}

export type PersistState = 'persisted' | 'not-persisted' | 'unsupported'

/** Ask the browser not to evict our data. Returns whether storage is now persistent. */
export async function requestPersistence(): Promise<PersistState> {
  if (!navigator.storage?.persist) return 'unsupported'
  try {
    if (await navigator.storage.persisted()) return 'persisted'
    return (await navigator.storage.persist()) ? 'persisted' : 'not-persisted'
  } catch {
    return 'not-persisted'
  }
}
