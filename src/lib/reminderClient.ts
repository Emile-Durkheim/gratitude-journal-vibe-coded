import { ref, type Ref } from 'vue'
import { isIos, isStandalone } from './install'
import { toKey } from './dates'
import { dueToday, loadReminder, msUntilNext, PERIODIC_SYNC_TAG, remindIfDue, saveReminder, type Reminder } from './reminder'

/** Chrome's Periodic Background Sync; not in the DOM typings. */
type PeriodicSync = {
  register: (tag: string, opts: { minInterval: number }) => Promise<void>
  unregister: (tag: string) => Promise<void>
}
const periodicSync = (reg: ServiceWorkerRegistration) => (reg as ServiceWorkerRegistration & { periodicSync?: PeriodicSync }).periodicSync

export type ReminderSupport = 'ok' | 'ios-install-first' | 'unsupported'

export function reminderSupport(): ReminderSupport {
  if ('Notification' in window && 'serviceWorker' in navigator) return 'ok'
  // iOS only exposes notifications to apps added to the home screen.
  return isIos() && !isStandalone() ? 'ios-install-first' : 'unsupported'
}

/** Asks the browser to wake the worker about hourly; it decides the real cadence. Returns whether it agreed. */
async function registerBackgroundCheck(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const sync = periodicSync(reg)
    if (!sync) return false
    await sync.register(PERIODIC_SYNC_TAG, { minInterval: 60 * 60 * 1000 })
    return true
  } catch {
    return false
  }
}

async function unregisterBackgroundCheck(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready
    await periodicSync(reg)?.unregister(PERIODIC_SYNC_TAG)
  } catch {
    // Nothing registered.
  }
}

let timer: number | undefined

/** While the app is alive (open or in the background), fire the reminder at its time. */
export async function scheduleReminder(): Promise<void> {
  window.clearTimeout(timer)
  const r = await loadReminder().catch(() => null)
  if (!r?.enabled || reminderSupport() !== 'ok') return
  timer = window.setTimeout(async () => {
    // Someone looking at the journal doesn't need a nudge to open it.
    if (document.visibilityState !== 'visible' && Notification.permission === 'granted') {
      await remindIfDue(await navigator.serviceWorker.ready).catch(() => undefined)
    }
    scheduleReminder()
  }, msUntilNext(r.time, new Date()) + 1000)
}

if (typeof document !== 'undefined') {
  // Timers stall while a phone sleeps; re-aim whenever the app comes back.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && scheduleReminder())
}

export type ReminderState = {
  reminder: Ref<Reminder | null>
  support: ReminderSupport
  permission: Ref<NotificationPermission | null>
  /** Whether the browser agreed to wake the app in the background. */
  background: Ref<boolean | null>
  setEnabled: (on: boolean) => Promise<void>
  setTime: (time: string) => void
}

export function useReminder(): ReminderState {
  const support = reminderSupport()
  const reminder = ref<Reminder | null>(null)
  const permission = ref<NotificationPermission | null>(support === 'ok' ? Notification.permission : null)
  const background = ref<boolean | null>(null)

  loadReminder()
    .then(async (r) => {
      reminder.value = r
      if (r.enabled && support === 'ok' && Notification.permission === 'granted') background.value = await registerBackgroundCheck()
    })
    .catch(() => undefined)

  const update = async (patch: Partial<Reminder>) => {
    const next = { ...(await loadReminder()), ...patch }
    // A time that has already passed today starts tomorrow, rather than nudging right away.
    const now = new Date()
    if (dueToday(next.time, now) <= now) next.lastShown = toKey(now)
    reminder.value = next
    await saveReminder(next)
    await scheduleReminder()
  }

  const setEnabled = async (on: boolean) => {
    if (!on) {
      await update({ enabled: false })
      await unregisterBackgroundCheck()
      return
    }
    if (support !== 'ok') return
    // The permission prompt only ever appears here, when someone turns reminders on.
    const result = await Notification.requestPermission()
    permission.value = result
    if (result !== 'granted') return
    await update({ enabled: true })
    background.value = await registerBackgroundCheck()
  }

  const setTime = (time: string) => void update({ time })

  return { reminder, support, permission, background, setEnabled, setTime }
}
