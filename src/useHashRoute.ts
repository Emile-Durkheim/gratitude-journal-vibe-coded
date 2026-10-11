import { useEffect, useState } from 'react'
import { isValidKey, weekEnd } from './dates'

export type Route =
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
  return { name: 'calendar' }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
