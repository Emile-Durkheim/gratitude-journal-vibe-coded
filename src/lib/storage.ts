import { createStore, del, entries as idbEntries, get, set, setMany } from 'idb-keyval'
import { isValidKey } from './dates'
import { deviceLang, isLang, type Lang } from '../content/i18n'
import { defaultPrompts, defaultWeeklyPrompts } from '../content/prompts'

export type Item = { prompt: string; answer: string }

export type Entry = {
  date: string
  /** Prompts are stored with the answers, so editing the prompt list never relabels old days. */
  items: Item[]
  updatedAt: number
  /** When the day was stamped as pressed with the stamp button. Saving itself is automatic. */
  stampedAt?: number
}

export type Entries = Record<string, Entry>

export type Settings = {
  /** Active prompts, in order. At least one. */
  prompts: string[]
  /** Prompts the user wrote themselves (shown in the library). */
  customPrompts: string[]
  /** Active prompts for the weekly review. At least one. */
  weeklyPrompts: string[]
  customWeeklyPrompts: string[]
  lastExportAt: number | null
}

export type ExportFile = {
  version: 2
  settings: Settings
  entries: Entries
  /** Weekly reviews, keyed by the week's Sunday. Absent in older backups. */
  weeks: Entries
}

const store = createStore('gratitude-journal', 'kv')
const SETTINGS_KEY = 'settings'
const ENTRY_PREFIX = 'entry:'
const WEEK_PREFIX = 'week:'
/** The chosen language stays with the device, like the reminder: backups don't carry it. */
const LANGUAGE_KEY = 'language'
/** Set once the first-run introduction has been finished or skipped. Also per device. */
const ONBOARDED_KEY = 'onboarded'

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
    typeof e.updatedAt === 'number' &&
    (e.stampedAt === undefined || typeof e.stampedAt === 'number')
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

/** Settings from storage or a backup; missing prompt lists start from the defaults in `lang`. */
export function sanitizeSettings(x: unknown, lang: Lang = 'en'): Settings {
  const s = (x ?? {}) as Partial<Settings>
  const list = (x: unknown, fallback: string[]) => {
    const kept = isStringArray(x) ? x.filter((p) => p.trim()) : []
    return kept.length ? kept : fallback
  }
  return {
    prompts: list(s.prompts, defaultPrompts(lang)),
    customPrompts: list(s.customPrompts, []),
    weeklyPrompts: list(s.weeklyPrompts, defaultWeeklyPrompts(lang)),
    customWeeklyPrompts: list(s.customWeeklyPrompts, []),
    lastExportAt: typeof s.lastExportAt === 'number' ? s.lastExportAt : null,
  }
}

export async function loadAll(): Promise<{ entries: Entries; weeks: Entries; settings: Settings; language: Lang | null; onboarded: boolean }> {
  const rows = await idbEntries<string, unknown>(store)
  const days: Record<string, unknown> = {}
  const weeks: Record<string, unknown> = {}
  let settings: unknown = null
  let language: Lang | null = null
  let onboarded = false
  for (const [key, value] of rows) {
    if (key === SETTINGS_KEY) settings = value
    else if (key === ONBOARDED_KEY) onboarded = value === true
    else if (key === LANGUAGE_KEY && isLang(value)) language = value
    else if (key.startsWith(ENTRY_PREFIX)) days[key.slice(ENTRY_PREFIX.length)] = value
    else if (key.startsWith(WEEK_PREFIX)) weeks[key.slice(WEEK_PREFIX.length)] = value
  }
  return {
    entries: sanitizeEntries(days),
    weeks: sanitizeEntries(weeks),
    settings: sanitizeSettings(settings, language ?? deviceLang()),
    language,
    // Anyone who used the journal before the introduction existed has already found their way.
    onboarded: onboarded || rows.some(([key]) => key.startsWith(ENTRY_PREFIX) || key.startsWith(WEEK_PREFIX)),
  }
}

/** Writes one day; an entry with no content deletes the day. */
export async function saveEntry(date: string, entry: Entry | undefined): Promise<void> {
  if (entry) await set(ENTRY_PREFIX + date, entry, store)
  else await del(ENTRY_PREFIX + date, store)
}

/** Writes one weekly review, keyed by the week's Sunday; an empty one deletes it. */
export async function saveWeek(sunday: string, entry: Entry | undefined): Promise<void> {
  if (entry) await set(WEEK_PREFIX + sunday, entry, store)
  else await del(WEEK_PREFIX + sunday, store)
}

export async function saveEntries(entries: Entries, weeks: Entries): Promise<void> {
  await setMany(
    [
      ...Object.values(entries).map((e): [string, Entry] => [ENTRY_PREFIX + e.date, e]),
      ...Object.values(weeks).map((e): [string, Entry] => [WEEK_PREFIX + e.date, e]),
    ],
    store,
  )
}

/** Stores the language choice; null goes back to following the device. */
export async function saveLanguage(language: Lang | null): Promise<void> {
  if (language) await set(LANGUAGE_KEY, language, store)
  else await del(LANGUAGE_KEY, store)
}

export async function loadLanguage(): Promise<Lang | null> {
  const value = await get(LANGUAGE_KEY, store)
  return isLang(value) ? value : null
}

export async function saveOnboarded(): Promise<void> {
  await set(ONBOARDED_KEY, true, store)
}

export async function saveSettings(settings: Settings): Promise<void> {
  await set(SETTINGS_KEY, settings, store)
}

export function hasContent(items: Item[]): boolean {
  return items.some((i) => i.answer.trim() !== '')
}

/** The entry to store for this day, or undefined if it's empty. A stamp stays with the day while it has content. */
export function makeEntry(date: string, items: Item[], now = Date.now(), stampedAt?: number): Entry | undefined {
  if (!hasContent(items)) return undefined
  return stampedAt === undefined ? { date, items, updatedAt: now } : { date, items, updatedAt: now, stampedAt }
}

export function toExport(entries: Entries, settings: Settings, weeks: Entries = {}): ExportFile {
  return { version: 2, settings, entries, weeks }
}

/** Parse an export file. Throws on anything that isn't one. */
export function parseExport(text: string, lang: Lang = 'en'): ExportFile {
  const data = JSON.parse(text)
  if (!data || data.version !== 2 || typeof data.entries !== 'object') {
    throw new Error('Not a Flower Press backup file.')
  }
  return {
    version: 2,
    settings: sanitizeSettings(data.settings, lang),
    entries: sanitizeEntries(data.entries),
    weeks: sanitizeEntries(data.weeks),
  }
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
