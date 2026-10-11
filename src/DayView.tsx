import { useState } from 'react'
import PromptFields from './PromptFields'
import TopBar, { BackLink } from './TopBar'
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
      <TopBar
        title={date === today ? 'Today' : formatLong(date)}
        start={<BackLink href="#/" label="Back to calendar" onClick={onBack} />}
      />
      {date === today && <p className="mb-3 text-center text-base-content/60">{formatLong(date)}</p>}

      {future ? (
        <p className="empty my-12 text-center text-base-content/60">This day hasn't happened yet.</p>
      ) : (
        <form className="mt-3" onSubmit={(e) => e.preventDefault()}>
          <PromptFields items={items} rows={3} onAnswer={update} />
          <p className="mt-4 text-center text-sm text-base-content/60">
            Saved automatically on this device. <a className="link link-secondary" href="#/settings">Change prompts</a>
          </p>
        </form>
      )}

      {!future && isSunday(date) && (
        <a
          className="week-card card mt-5 border-2 border-secondary/40 bg-linear-to-r from-secondary/20 to-primary/25 shadow-md"
          href={`#/week/${date}`}
        >
          <span className="card-body flex-row items-center gap-3 p-4">
            <span className="text-3xl" aria-hidden="true">🌟</span>
            <span className="grow">
              <strong>Weekly review</strong>
              <span className="block text-sm text-base-content/70">
                {hasWeekReview ? 'Written. Tap to read or edit.' : 'Sunday is a good day to look back on the week.'}
              </span>
            </span>
            <span className="text-2xl" aria-hidden="true">›</span>
          </span>
        </a>
      )}

      <nav className="mt-4 flex justify-between">
        <a className="btn btn-ghost btn-sm text-secondary-content" href={`#/day/${prev}`}>
          ‹ Previous day
        </a>
        {next <= today && (
          <a className="btn btn-ghost btn-sm text-secondary-content" href={`#/day/${next}`}>
            Next day ›
          </a>
        )}
      </nav>
    </section>
  )
}
