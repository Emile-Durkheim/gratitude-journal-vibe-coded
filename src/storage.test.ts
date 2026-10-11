import { describe, expect, it } from 'vitest'
import { DEFAULT_PROMPTS, type Prompts } from './prompts'
import { mergeEntries, parseExport, sanitizeSettings, toExport, withAnswers, type Entries } from './storage'

const P: Prompts = ['a', 'b', 'c']

describe('withAnswers', () => {
  it('stores a day with its prompts', () => {
    const e = withAnswers({}, '2026-10-11', P, ['x', '', ''], 1)
    expect(e['2026-10-11']).toEqual({ date: '2026-10-11', prompts: P, answers: ['x', '', ''], updatedAt: 1 })
  })

  it('removes a day when all answers are blank', () => {
    const e = withAnswers({}, '2026-10-11', P, ['x', '', ''], 1)
    expect(withAnswers(e, '2026-10-11', P, [' ', '', ''], 2)).toEqual({})
  })
})

describe('mergeEntries', () => {
  it('keeps the newer entry per day', () => {
    const a: Entries = withAnswers({}, '2026-10-01', P, ['old', '', ''], 1)
    const b: Entries = {
      ...withAnswers({}, '2026-10-01', P, ['new', '', ''], 2),
      ...withAnswers({}, '2026-10-02', P, ['other', '', ''], 1),
    }
    const m = mergeEntries(a, b)
    expect(m['2026-10-01'].answers[0]).toBe('new')
    expect(m['2026-10-02'].answers[0]).toBe('other')
    expect(mergeEntries(b, a)['2026-10-01'].answers[0]).toBe('new')
  })
})

describe('export / import', () => {
  it('round-trips', () => {
    const entries = withAnswers({}, '2026-10-11', P, ['x', 'y', 'z'], 5)
    const file = parseExport(JSON.stringify(toExport(entries, { prompts: P })))
    expect(file.entries).toEqual(entries)
    expect(file.settings.prompts).toEqual(P)
  })

  it('rejects other files', () => {
    expect(() => parseExport('{"foo":1}')).toThrow()
    expect(() => parseExport('not json')).toThrow()
  })

  it('drops malformed entries', () => {
    const file = parseExport(JSON.stringify({ version: 1, entries: { '2026-10-11': { date: '2026-10-11' } } }))
    expect(file.entries).toEqual({})
    expect(file.settings.prompts).toEqual(DEFAULT_PROMPTS)
  })
})

describe('sanitizeSettings', () => {
  it('falls back to defaults', () => {
    expect(sanitizeSettings(null).prompts).toEqual(DEFAULT_PROMPTS)
    expect(sanitizeSettings({ prompts: ['only one'] }).prompts).toEqual(DEFAULT_PROMPTS)
  })
})
