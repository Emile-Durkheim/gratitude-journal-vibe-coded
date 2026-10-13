// The locale for formatted dates follows the app's language (see i18n.ts); undefined means the device's.
let locale: string | undefined

export function setDateLocale(l: string | undefined) {
  locale = l
}

export function dateLocale(): string | undefined {
  return locale
}

/** Local-time date key, e.g. "2026-10-11". */
export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isValidKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && toKey(fromKey(key)) === key
}

export function todayKey(): string {
  return toKey(new Date())
}

/**
 * Weeks of the month as rows of 7 cells, Monday first.
 * Cells outside the month are null.
 */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // Monday = 0
  const cells: (string | null)[] = Array(lead).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toKey(new Date(year, month, d)))
  while (cells.length % 7) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonth(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export function weekdayLabels(): string[] {
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' }),
  )
}

/** Weeks run Monday to Sunday and are keyed by their Sunday. Returns the Sunday on or after `key`. */
export function weekEnd(key: string): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7))
  return toKey(d)
}

export function isSunday(key: string): boolean {
  return fromKey(key).getDay() === 0
}

/** The seven day keys of the week ending on `sunday`, Monday first. */
export function weekDays(sunday: string): string[] {
  const end = fromKey(sunday)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(end)
    d.setDate(end.getDate() - 6 + i)
    return toKey(d)
  })
}

export function formatWeekRange(sunday: string): string {
  const [first] = weekDays(sunday)
  const short = { day: 'numeric', month: 'short' } as const
  return `${fromKey(first).toLocaleDateString(locale, short)} – ${fromKey(sunday).toLocaleDateString(locale, { ...short, year: 'numeric' })}`
}
