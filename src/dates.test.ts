import { describe, expect, it } from 'vitest'
import { fromKey, isValidKey, monthGrid, toKey } from './dates'

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
})
