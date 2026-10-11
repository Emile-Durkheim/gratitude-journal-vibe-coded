import { useState } from 'react'
import { formatLong, fromKey, isSunday, toKey, todayKey } from './dates'
import type { Entry, Item } from './storage'

type Props = {
  date: string
  entry: Entry | undefined
  hasWeekReview: boolean
  currentPrompts: string[]
  onChange: (date: string, items: Item[]) => void
  onBack: () => void
}

export default function DayView({ date, entry, hasWeekReview, currentPrompts, onChange, onBack }: Props) {
  const today = todayKey()
  const future = date > today
  // A day that already has an entry keeps the prompts it was written with.
  const [items, setItems] = useState<Item[]>(
    () => entry?.items ?? currentPrompts.map((prompt) => ({ prompt, answer: '' })),
  )

  const update = (i: number, answer: string) => {
    const next = items.map((item, j) => (j === i ? { ...item, answer } : item))
    setItems(next)
    onChange(date, next)
  }

  const neighbour = (delta: number) => {
    const d = fromKey(date)
    d.setDate(d.getDate() + delta)
    return toKey(d)
  }
  const prev = neighbour(-1)
  const next = neighbour(1)

  return (
    <section>
      <header className="topbar">
        <a className="icon-btn" href="#/" onClick={onBack} aria-label="Back to calendar">
          ‹
        </a>
        <h1 className="day-title">{date === today ? 'Today' : formatLong(date)}</h1>
        <span className="icon-btn-spacer" />
      </header>
      {date === today && <p className="muted center">{formatLong(date)}</p>}

      {future ? (
        <p className="muted center empty">This day hasn't happened yet.</p>
      ) : (
        <form className="prompts" onSubmit={(e) => e.preventDefault()}>
          {items.map((item, i) => (
            <label key={i} className="prompt">
              <span className="prompt-label">
                <span className="prompt-num">{i + 1}</span>
                {item.prompt}
              </span>
              <textarea value={item.answer} onChange={(e) => update(i, e.target.value)} rows={3} placeholder="…" />
            </label>
          ))}
          <p className="muted center small">
            Saved automatically on this device. <a href="#/settings">Change prompts</a>
          </p>
        </form>
      )}

      {!future && isSunday(date) && (
        <a className="card week-card" href={`#/week/${date}`}>
          <span className="grow">
            <strong>Weekly review</strong>
            <span className="muted small week-card-sub">
              {hasWeekReview ? 'Written. Tap to read or edit.' : 'Sunday is a good day to look back on the week.'}
            </span>
          </span>
          <span aria-hidden="true">›</span>
        </a>
      )}

      <nav className="day-nav">
        <a className="link-btn" href={`#/day/${prev}`}>
          ‹ Previous day
        </a>
        {next <= today && (
          <a className="link-btn" href={`#/day/${next}`}>
            Next day ›
          </a>
        )}
      </nav>
    </section>
  )
}
