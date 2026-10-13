import { describe, expect, it } from 'vitest'
import { parseHash, slideDirection } from './useHashRoute'

describe('parseHash', () => {
  it('reads the prompt library pages', () => {
    expect(parseHash('#/prompts/daily')).toEqual({ name: 'prompts', kind: 'daily' })
    expect(parseHash('#/prompts/weekly')).toEqual({ name: 'prompts', kind: 'weekly' })
    expect(parseHash('#/prompts/other')).toEqual({ name: 'wreath' })
  })

  it('slides the prompt library in over settings and back out', () => {
    expect(slideDirection({ name: 'settings' }, { name: 'prompts', kind: 'daily' })).toBe('forward')
    expect(slideDirection({ name: 'prompts', kind: 'daily' }, { name: 'settings' })).toBe('back')
    expect(slideDirection({ name: 'settings' }, { name: 'wreath' })).toBeNull()
  })
})
