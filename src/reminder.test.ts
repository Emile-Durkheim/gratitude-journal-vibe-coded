import 'fake-indexeddb/auto'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_REMINDER, loadReminder, msUntilNext, remindIfDue, sanitizeReminder, saveReminder, shouldRemind } from './reminder'
import { makeEntry, saveEntry } from './storage'

const at = (h: number, m = 0) => new Date(2026, 9, 12, h, m)
const on = { enabled: true, time: '21:00', lastShown: null }

describe('shouldRemind', () => {
  it('waits for the set time', () => {
    expect(shouldRemind(on, at(20, 59), false)).toBe(false)
    expect(shouldRemind(on, at(21, 0), false)).toBe(true)
    expect(shouldRemind(on, at(23, 30), false)).toBe(true)
  })

  it('stays quiet when off, already written, or already shown today', () => {
    expect(shouldRemind({ ...on, enabled: false }, at(22), false)).toBe(false)
    expect(shouldRemind(on, at(22), true)).toBe(false)
    expect(shouldRemind({ ...on, lastShown: '2026-10-12' }, at(22), false)).toBe(false)
    expect(shouldRemind({ ...on, lastShown: '2026-10-11' }, at(22), false)).toBe(true)
  })
})

describe('msUntilNext', () => {
  it("aims at today's time, or tomorrow's once it has passed", () => {
    expect(msUntilNext('21:00', at(20, 30))).toBe(30 * 60 * 1000)
    expect(msUntilNext('21:00', at(21, 0))).toBe(24 * 60 * 60 * 1000)
    expect(msUntilNext('07:15', at(22))).toBe((9 * 60 + 15) * 60 * 1000)
  })
})

describe('sanitizeReminder', () => {
  it('defaults to off and rejects bad times', () => {
    expect(sanitizeReminder(undefined)).toEqual(DEFAULT_REMINDER)
    expect(sanitizeReminder({ enabled: true, time: '25:00' })).toEqual({ ...DEFAULT_REMINDER, enabled: true })
  })
})

describe('remindIfDue', () => {
  const registration = () => ({ showNotification: vi.fn().mockResolvedValue(undefined) }) as unknown as ServiceWorkerRegistration & {
    showNotification: ReturnType<typeof vi.fn>
  }

  it('shows one silent reminder a day and remembers it', async () => {
    await saveReminder(on)
    const reg = registration()
    expect(await remindIfDue(reg, at(21, 5))).toBe(true)
    expect(reg.showNotification).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ silent: true }))
    expect((await loadReminder()).lastShown).toBe('2026-10-12')
    expect(await remindIfDue(reg, at(22))).toBe(false)
    expect(reg.showNotification).toHaveBeenCalledTimes(1)
  })

  it('skips a day that already has an entry', async () => {
    await saveReminder(on)
    await saveEntry('2026-10-13', makeEntry('2026-10-13', [{ prompt: 'p', answer: 'sun' }]))
    const reg = registration()
    expect(await remindIfDue(reg, new Date(2026, 9, 13, 21, 30))).toBe(false)
    expect(reg.showNotification).not.toHaveBeenCalled()
  })
})
