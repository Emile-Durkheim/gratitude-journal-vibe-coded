import { createStore, get, set } from 'idb-keyval'
import { toKey } from './dates'
import { STRINGS, deviceLang, isLang } from '../content/i18n'

/**
 * The daily reminder. Kept apart from Settings so it stays with this device:
 * backups don't carry it, and the service worker can read it without the app open.
 */
export type Reminder = {
  enabled: boolean
  /** Local time, "HH:MM". */
  time: string
  /** Day key of the last reminder shown, so a day never gets two. */
  lastShown: string | null
}

export const DEFAULT_REMINDER: Reminder = { enabled: false, time: '21:00', lastShown: null }
export const PERIODIC_SYNC_TAG = 'daily-reminder'
const NOTIFICATION_TAG = 'daily-reminder'

// Same database as storage.ts; idb-keyval stores are safe to open from several places.
const store = createStore('gratitude-journal', 'kv')
const REMINDER_KEY = 'reminder'

function isTime(x: unknown): x is string {
  return typeof x === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(x)
}

export function sanitizeReminder(x: unknown): Reminder {
  const r = (x ?? {}) as Partial<Reminder>
  return {
    enabled: r.enabled === true,
    time: isTime(r.time) ? r.time : DEFAULT_REMINDER.time,
    lastShown: typeof r.lastShown === 'string' ? r.lastShown : null,
  }
}

export async function loadReminder(): Promise<Reminder> {
  return sanitizeReminder(await get(REMINDER_KEY, store))
}

export async function saveReminder(r: Reminder): Promise<void> {
  await set(REMINDER_KEY, r, store)
}

/** Today's reminder moment for `now`, in local time. */
export function dueToday(time: string, now: Date): Date {
  const [h, m] = time.split(':').map(Number)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)
}

/** Milliseconds until the next reminder moment (today's if still ahead, else tomorrow's). */
export function msUntilNext(time: string, now: Date): number {
  const due = dueToday(time, now)
  if (due <= now) due.setDate(due.getDate() + 1)
  return due.getTime() - now.getTime()
}

/** Remind once a day, after the set time, and only if today is still unwritten. */
export function shouldRemind(r: Reminder, now: Date, wroteToday: boolean): boolean {
  return r.enabled && !wroteToday && r.lastShown !== toKey(now) && now >= dueToday(r.time, now)
}

/**
 * Shows today's reminder if it's due. Runs in the page (on a timer) and in the
 * service worker (on a periodic background sync), so the day's flag is shared.
 */
export async function remindIfDue(registration: ServiceWorkerRegistration, now = new Date()): Promise<boolean> {
  const r = await loadReminder()
  const today = toKey(now)
  const wroteToday = (await get(`entry:${today}`, store)) !== undefined
  if (!shouldRemind(r, now, wroteToday)) return false
  await saveReminder({ ...r, lastShown: today })
  const chosen = await get('language', store)
  const t = STRINGS[isLang(chosen) ? chosen : deviceLang()]
  await registration.showNotification(t.notificationTitle, {
    body: t.notificationBody,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: NOTIFICATION_TAG,
    silent: true,
    data: { date: today },
  })
  return true
}
