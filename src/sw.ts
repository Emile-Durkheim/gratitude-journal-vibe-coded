/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { PERIODIC_SYNC_TAG, remindIfDue } from './reminder'

declare const self: ServiceWorkerGlobalScope

// Same behaviour the generated worker had: offline precache, instant updates, SPA fallback.
self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// Chrome on Android wakes an installed app now and then; if the reminder is due, show it.
self.addEventListener('periodicsync', (event) => {
  const e = event as ExtendableEvent & { tag: string }
  if (e.tag === PERIODIC_SYNC_TAG) e.waitUntil(remindIfDue(self.registration))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const date = (event.notification.data as { date?: string } | null)?.date
  const url = new URL(date ? `#/day/${date}` : '#/', self.registration.scope).href
  event.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = open[0] as WindowClient | undefined
      if (client) {
        await client.navigate(url).catch(() => undefined)
        await client.focus()
      } else {
        await self.clients.openWindow(url)
      }
    })(),
  )
})
