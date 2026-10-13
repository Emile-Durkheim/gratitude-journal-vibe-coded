import { describe, expect, it } from 'vitest'
import { formatWeekRange, fromKey, isSunday, isValidKey, monthGrid, toKey, weekDays, weekEnd } from './dates'

describe('dates', () => {
  it('round-trips local date keys', () => {
    expect(toKey(new Date(2026, 9, 11))).toBe('2026-10-11')
    expect(toKey(fromKey('2026-01-05'))).toBe('2026-01-05')
  })

  it('validates keys', () => {
    expect(isValidKey('2026-02-28')).toBe(true)
    expect(isValidKey('2026-02-30')).toBe(false)
    expect(isValidKey('nope')).toBe(false)
  })

  it('builds a Monday-first month grid', () => {
    // October 2026 starts on a Thursday and has 31 days.
    const weeks = monthGrid(2026, 9)
    expect(weeks[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks.flat().filter(Boolean)).toHaveLength(31)
  })

  it('keys weeks by their Sunday (Monday to Sunday)', () => {
    expect(weekEnd('2026-10-05')).toBe('2026-10-11') // Monday
    expect(weekEnd('2026-10-11')).toBe('2026-10-11') // Sunday
    expect(weekEnd('2026-10-12')).toBe('2026-10-18') // next Monday
    expect(weekEnd('2026-12-29')).toBe('2027-01-03') // across a year end
    expect(isSunday('2026-10-11')).toBe(true)
    expect(isSunday('2026-10-10')).toBe(false)
    const days = weekDays('2026-10-11')
    expect(days[0]).toBe('2026-10-05')
    expect(days[6]).toBe('2026-10-11')
    expect(days).toHaveLength(7)
    expect(formatWeekRange('2026-10-11')).toContain('2026')
  })
})
