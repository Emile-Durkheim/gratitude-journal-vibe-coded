import { computed, shallowRef, type ComputedRef } from 'vue'

/** Chrome's install event; not in the DOM typings. */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const deferred = shallowRef<InstallPromptEvent | null>(null)

// Registered at import time: the event can fire before the app mounts.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred.value = e as InstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferred.value = null
  })
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export type InstallState =
  | { kind: 'installed' }
  | { kind: 'prompt'; install: () => Promise<void> }
  | { kind: 'ios' }
  | { kind: 'manual' }

/** How this browser can install the app: a one-tap prompt (Android/Chrome), Share sheet steps (iOS), or the browser menu. */
export function useInstall(): ComputedRef<InstallState> {
  return computed(() => {
    const ev = deferred.value
    if (isStandalone()) return { kind: 'installed' }
    if (ev) {
      return {
        kind: 'prompt',
        install: async () => {
          await ev.prompt()
          await ev.userChoice
          deferred.value = null
        },
      }
    }
    return isIos() ? { kind: 'ios' } : { kind: 'manual' }
  })
}
