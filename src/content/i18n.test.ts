import { describe, expect, it } from 'vitest'
import { STRINGS, deviceLang } from './i18n'
import { defaultPrompts, promptLibrary, translatePrompts } from './prompts'
import { QUOTES, quoteFor } from './quotes'

describe('deviceLang', () => {
  it('takes the first device language the app speaks', () => {
    expect(deviceLang(['de-AT', 'en-US'])).toBe('de')
    expect(deviceLang(['fr-FR', 'en-GB', 'de'])).toBe('en')
    expect(deviceLang(['fr-FR'])).toBe('en')
    expect(deviceLang([])).toBe('en')
  })
})

describe('strings', () => {
  it('German has every English string', () => {
    expect(Object.keys(STRINGS.de).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
})

describe('translatePrompts', () => {
  it('switches library prompts and keeps your own', () => {
    const mixed = [...defaultPrompts('en'), 'My own prompt']
    expect(translatePrompts(mixed, 'de')).toEqual([...defaultPrompts('de'), 'My own prompt'])
    expect(translatePrompts(translatePrompts(mixed, 'de'), 'en')).toEqual(mixed)
  })

  it('both libraries have the same shape', () => {
    expect(promptLibrary('de').map((g) => g.prompts.length)).toEqual(promptLibrary('en').map((g) => g.prompts.length))
  })
})

describe('quotes', () => {
  it('uses separate collections per language', () => {
    const en = new Set(QUOTES.en.map((q) => q.text))
    expect(QUOTES.de.some((q) => en.has(q.text))).toBe(false)
    expect(QUOTES.de).toContain(quoteFor('2026-10-13', 'de'))
    expect(QUOTES.en).toContain(quoteFor('2026-10-13', 'en'))
  })
})
