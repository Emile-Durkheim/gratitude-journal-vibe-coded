import { describe, expect, it } from 'vitest'
import { flowerColor, flowerKind, petalsFor } from './flower'
import { toKey } from './dates'

describe('flowerKind', () => {
  it('is stable for a date', () => {
    expect(flowerKind('2026-10-15')).toEqual(flowerKind('2026-10-15'))
    expect(flowerColor('2026-10-15')).toBe(flowerColor('2026-10-15'))
  })

  it('varies across a month', () => {
    const days = Array.from({ length: 30 }, (_, i) => toKey(new Date(2026, 9, 1 + i)))
    const kinds = days.map(flowerKind)
    expect(new Set(kinds.map((k) => k.shape)).size).toBe(4)
    expect(new Set(kinds.map((k) => k.centre)).size).toBe(3)
    expect(new Set(days.map(flowerColor)).size).toBeGreaterThan(4)
    expect(kinds.some((k) => k.double) && kinds.some((k) => !k.double)).toBe(true)
  })
})

describe('petalsFor', () => {
  const items = [{ answer: 'a' }, { answer: '' }, { answer: 'c' }]
  it('keeps an empty petal for each unanswered prompt while writing', () => {
    expect(petalsFor(items, 3)).toEqual({ petals: 3, filled: 2 })
  })
  it('grows only the answered petals once stamped', () => {
    expect(petalsFor(items, 3, true)).toEqual({ petals: 2, filled: 2 })
  })
})
