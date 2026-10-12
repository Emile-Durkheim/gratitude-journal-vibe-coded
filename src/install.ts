import { useEffect, useState } from 'react'

/** Chrome's install event; not in the DOM typings. */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

// Registered at import time: the event can fire before React mounts.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
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
export function useInstall(): InstallState {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  if (isStandalone()) return { kind: 'installed' }
  if (deferred) {
    const ev = deferred
    return {
      kind: 'prompt',
      install: async () => {
        await ev.prompt()
        await ev.userChoice
        deferred = null
        notify()
      },
    }
  }
  return isIos() ? { kind: 'ios' } : { kind: 'manual' }
}
