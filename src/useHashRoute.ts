import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { isValidKey, weekEnd } from './dates'

export type Route =
  | { name: 'wreath' }
  | { name: 'calendar' }
  | { name: 'day'; date: string }
  | { name: 'week'; sunday: string }
  | { name: 'settings' }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '')
  const day = path.match(/^\/day\/(\d{4}-\d{2}-\d{2})$/)
  if (day && isValidKey(day[1])) return { name: 'day', date: day[1] }
  const week = path.match(/^\/week\/(\d{4}-\d{2}-\d{2})$/)
  if (week && isValidKey(week[1])) return { name: 'week', sunday: weekEnd(week[1]) }
  if (path === '/settings') return { name: 'settings' }
  if (path === '/calendar') return { name: 'calendar' }
  return { name: 'wreath' }
}

/**
 * Which way the page slides: day pages come in from the right and leave to the right,
 * and moving between days slides with the calendar. Anything else crossfades.
 */
export function slideDirection(from: Route, to: Route): 'forward' | 'back' | null {
  if (from.name === 'day' && to.name === 'day') return to.date > from.date ? 'forward' : to.date < from.date ? 'back' : null
  if (to.name === 'day') return 'forward'
  if (from.name === 'day') return 'back'
  return null
}

/**
 * Hash routing with app-like history. Moving between day pages replaces the history entry, and a
 * link back to the page you came from steps back instead of stacking, so the system back button
 * returns to the overview rather than through every day you visited.
 */
export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const norm = (hash: string) => hash || '#/'
    let currentHash = norm(window.location.hash)
    let current = parseHash(currentHash)
    let latest = 0

    const show = (next: Route) => {
      const direction = slideDirection(current, next)
      current = next
      currentHash = norm(window.location.hash)
      const apply = () => {
        setRoute(next)
        window.scrollTo(0, 0)
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!document.startViewTransition || reduced) return apply()
      const root = document.documentElement
      if (direction) root.dataset.slide = direction
      else delete root.dataset.slide
      const id = ++latest
      const t = document.startViewTransition(() => flushSync(apply))
      // A quick second tap starts a new transition; only the newest one clears the direction.
      t.finished.finally(() => {
        if (id === latest) delete root.dataset.slide
      })
    }

    // Back/forward, links outside the app's own, and typed URLs.
    const onHistory = () => {
      if (norm(window.location.hash) === currentHash) return
      show(parseHash(window.location.hash))
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest?.('a[href^="#/"]')
      if (!a) return
      const href = a.getAttribute('href')!
      e.preventDefault()
      if (href === currentHash) return
      const next = parseHash(href)
      const state = history.state as { prev?: string } | null
      if (state?.prev === href) {
        history.back()
      } else if (current.name === 'day' && next.name === 'day') {
        history.replaceState(state, '', href)
        show(next)
      } else {
        history.pushState({ prev: currentHash }, '', href)
        show(next)
      }
    }

    window.addEventListener('hashchange', onHistory)
    window.addEventListener('popstate', onHistory)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('hashchange', onHistory)
      window.removeEventListener('popstate', onHistory)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return route
}
