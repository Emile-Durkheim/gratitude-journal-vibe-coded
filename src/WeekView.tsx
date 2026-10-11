import { useState } from 'react'
import { formatLong, formatWeekRange, fromKey, toKey, todayKey, weekDays } from './dates'
import type { Entries, Entry, Item } from './storage'

type Props = {
  sunday: string
  entry: Entry | undefined
  days: Entries
  currentPrompts: string[]
  onChange: (sunday: string, items: Item[]) => void
}

export default function WeekView({ sunday, entry, days, currentPrompts, onChange }: Props) {
  const today = todayKey()
  const [monday] = weekDays(sunday)
  const future = monday > today
  // A week that already has a review keeps the prompts it was written with.
  const [items, setItems] = useState<Item[]>(
    () => entry?.items ?? currentPrompts.map((prompt) => ({ prompt, answer: '' })),
  )

  const update = (i: number, answer: string) => {
    const next = items.map((item, j) => (j === i ? { ...item, answer } : item))
    setItems(next)
    onChange(sunday, next)
  }

  const written = weekDays(sunday).filter((d) => days[d])
  const shiftWeek = (delta: number) => {
    const d = fromKey(sunday)
    d.setDate(d.getDate() + 7 * delta)
    return toKey(d)
  }
  const prevSunday = shiftWeek(-1)
  const nextSunday = shiftWeek(1)
  const nextStarted = weekDays(nextSunday)[0] <= today

  return (
    <section>
      <header className="topbar">
        <a className="icon-btn" href={`#/day/${sunday <= today ? sunday : today}`} aria-label="Back">
          ‹
        </a>
        <h1 className="day-title">Weekly review</h1>
        <span className="icon-btn-spacer" />
      </header>
      <p className="muted center">{formatWeekRange(sunday)}</p>

      {future ? (
        <p className="muted center empty">This week hasn't started yet.</p>
      ) : (
        <>
          <details className="recap">
            <summary>
              Look back: {written.length} of 7 days written
            </summary>
            {written.length === 0 ? (
              <p className="muted small">No daily entries this week.</p>
            ) : (
              written.map((d) => (
                <div key={d} className="recap-day">
                  <a href={`#/day/${d}`}>{formatLong(d)}</a>
                  {days[d].items
                    .filter((i) => i.answer.trim())
                    .map((i, k) => (
                      <p key={k} className="small">
                        {i.answer}
                      </p>
                    ))}
                </div>
              ))
            )}
          </details>

          <form className="prompts" onSubmit={(e) => e.preventDefault()}>
            {items.map((item, i) => (
              <label key={i} className="prompt">
                <span className="prompt-label">
                  <span className="prompt-num">{i + 1}</span>
                  {item.prompt}
                </span>
                <textarea value={item.answer} onChange={(e) => update(i, e.target.value)} rows={4} placeholder="…" />
              </label>
            ))}
            <p className="muted center small">
              Saved automatically on this device. <a href="#/settings">Change weekly prompts</a>
            </p>
          </form>
        </>
      )}

      <nav className="day-nav">
        <a className="link-btn" href={`#/week/${prevSunday}`}>
          ‹ Previous week
        </a>
        {nextStarted && (
          <a className="link-btn" href={`#/week/${nextSunday}`}>
            Next week ›
          </a>
        )}
      </nav>
    </section>
  )
}
