import { useState } from 'react'
import { formatLong, fromKey, toKey, todayKey } from './dates'
import type { Prompts } from './prompts'
import type { Entry } from './storage'

type Props = {
  date: string
  entry: Entry | undefined
  currentPrompts: Prompts
  onChange: (date: string, prompts: Prompts, answers: Prompts) => void
  onBack: () => void
}

export default function DayView({ date, entry, currentPrompts, onChange, onBack }: Props) {
  const today = todayKey()
  const future = date > today
  // Prompts are frozen once a day has an entry, so later edits to the prompts never relabel it.
  const [prompts] = useState<Prompts>(entry?.prompts ?? currentPrompts)
  const [answers, setAnswers] = useState<Prompts>(entry?.answers ?? ['', '', ''])

  const update = (i: number, value: string) => {
    const next = [...answers] as Prompts
    next[i] = value
    setAnswers(next)
    onChange(date, prompts, next)
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
          {prompts.map((prompt, i) => (
            <label key={i} className="prompt">
              <span className="prompt-label">
                <span className="prompt-num">{i + 1}</span>
                {prompt}
              </span>
              <textarea
                value={answers[i]}
                onChange={(e) => update(i, e.target.value)}
                rows={3}
                placeholder="…"
              />
            </label>
          ))}
          <p className="muted center small">Saved automatically on this device.</p>
        </form>
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
