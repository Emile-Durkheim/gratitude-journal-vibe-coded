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

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    let current = parseHash(window.location.hash)
    let latest = 0
    const onChange = () => {
      const next = parseHash(window.location.hash)
      const direction = slideDirection(current, next)
      current = next
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
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
