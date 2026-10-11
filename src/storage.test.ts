import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PROMPTS } from './prompts'
import {
  loadAll,
  makeEntry,
  mergeEntries,
  parseExport,
  sanitizeSettings,
  saveEntry,
  saveSettings,
  toExport,
  type Entries,
  type Item,
} from './storage'

const items = (...answers: string[]): Item[] => answers.map((answer, i) => ({ prompt: `p${i}`, answer }))

describe('makeEntry', () => {
  it('keeps prompts with answers, for any number of prompts', () => {
    const e = makeEntry('2026-10-11', items('a', '', 'c', 'd', 'e'), 1)
    expect(e?.items).toHaveLength(5)
    expect(e?.items[0]).toEqual({ prompt: 'p0', answer: 'a' })
  })

  it('returns nothing for a blank day', () => {
    expect(makeEntry('2026-10-11', items(' ', ''), 1)).toBeUndefined()
  })
})

describe('IndexedDB storage', () => {
  it('saves, loads and deletes days and settings', async () => {
    await saveEntry('2026-10-11', makeEntry('2026-10-11', items('x'), 1))
    await saveEntry('2026-10-12', makeEntry('2026-10-12', items('y'), 2))
    await saveSettings({ prompts: ['one', 'two'], customPrompts: ['two'], lastExportAt: 5 })
    let all = await loadAll()
    expect(Object.keys(all.entries).sort()).toEqual(['2026-10-11', '2026-10-12'])
    expect(all.settings).toEqual({ prompts: ['one', 'two'], customPrompts: ['two'], lastExportAt: 5 })
    await saveEntry('2026-10-12', undefined)
    all = await loadAll()
    expect(Object.keys(all.entries)).toEqual(['2026-10-11'])
  })
})

describe('mergeEntries', () => {
  it('keeps the newer entry per day', () => {
    const a: Entries = { '2026-10-01': makeEntry('2026-10-01', items('old'), 1)! }
    const b: Entries = {
      '2026-10-01': makeEntry('2026-10-01', items('new'), 2)!,
      '2026-10-02': makeEntry('2026-10-02', items('other'), 1)!,
    }
    expect(mergeEntries(a, b)['2026-10-01'].items[0].answer).toBe('new')
    expect(mergeEntries(b, a)['2026-10-01'].items[0].answer).toBe('new')
    expect(mergeEntries(a, b)['2026-10-02'].items[0].answer).toBe('other')
  })
})

describe('export / import', () => {
  it('round-trips', () => {
    const entries = { '2026-10-11': makeEntry('2026-10-11', items('x', 'y'), 5)! }
    const settings = { prompts: ['a'], customPrompts: ['a'], lastExportAt: null }
    const file = parseExport(JSON.stringify(toExport(entries, settings)))
    expect(file.entries).toEqual(entries)
    expect(file.settings).toEqual(settings)
  })

  it('rejects other files', () => {
    expect(() => parseExport('{"foo":1}')).toThrow()
    expect(() => parseExport('not json')).toThrow()
  })

  it('drops malformed entries', () => {
    const file = parseExport(JSON.stringify({ version: 2, entries: { '2026-10-11': { date: '2026-10-11' } } }))
    expect(file.entries).toEqual({})
    expect(file.settings.prompts).toEqual(DEFAULT_PROMPTS)
  })
})

describe('sanitizeSettings', () => {
  it('falls back to defaults and never allows zero prompts', () => {
    expect(sanitizeSettings(null).prompts).toEqual(DEFAULT_PROMPTS)
    expect(sanitizeSettings({ prompts: [] }).prompts).toEqual(DEFAULT_PROMPTS)
    expect(sanitizeSettings({ prompts: ['a', 'b', 'c', 'd'] }).prompts).toHaveLength(4)
  })
})
