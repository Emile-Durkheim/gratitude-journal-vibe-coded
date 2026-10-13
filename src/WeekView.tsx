import { useState } from 'react'
import PromptFields from './PromptFields'
import TopBar, { BackLink } from './TopBar'
import { formatLong, formatWeekRange, fromKey, toKey, todayKey, weekDays } from './dates'
import type { Entries, Entry, Item } from './storage'

type Props = {
  sunday: string
  entry: Entry | undefined
  days: Entries
  currentPrompts: string[]
  onChange: (sunday: string, items: Item[]) => void
  onBack: () => void
}

export default function WeekView({ sunday, entry, days, currentPrompts, onChange, onBack }: Props) {
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
      <TopBar
        title="Weekly review"
        start={<BackLink href="#/" label="Back to the wreath" onClick={onBack} />}
      />
      <p className="mb-5 text-center text-2xl italic">{formatWeekRange(sunday)}</p>

      {future ? (
        <p className="empty my-12 text-center italic opacity-60">This week hasn't started yet.</p>
      ) : (
        <>
          <details className="recap collapse collapse-arrow mb-6 rounded-sm border border-base-300 bg-base-100">
            <summary className="collapse-title italic">Look back: {written.length} of 7 days written</summary>
            <div className="collapse-content text-sm">
              {written.length === 0 ? (
                <p className="italic opacity-60">No daily entries this week.</p>
              ) : (
                written.map((d) => (
                  <div key={d} className="recap-day mt-3 first:mt-0">
                    <a className="link font-semibold text-rose" href={`#/day/${d}`}>
                      {formatLong(d)}
                    </a>
                    {days[d].items
                      .filter((i) => i.answer.trim())
                      .map((i, k) => (
                        <p key={k} className="mt-1 whitespace-pre-wrap font-hand text-xl leading-snug text-pen">
                          {i.answer}
                        </p>
                      ))}
                  </div>
                ))
              )}
            </div>
          </details>

          <form onSubmit={(e) => e.preventDefault()}>
            <PromptFields items={items} rows={4} onAnswer={update} />
            <p className="mt-6 text-center text-sm italic opacity-60">
              <a className="link text-rose" href="#/settings">Change weekly prompts</a>
            </p>
          </form>
        </>
      )}

      <nav className="mt-4 flex justify-between">
        <a className="btn btn-ghost btn-sm" href={`#/week/${prevSunday}`}>
          ‹ Previous week
        </a>
        {nextStarted && (
          <a className="btn btn-ghost btn-sm" href={`#/week/${nextSunday}`}>
            Next week ›
          </a>
        )}
      </nav>
    </section>
  )
}
