import { useEffect, useRef, useState } from 'react'
import { flowerColor } from './flower'
import PetalDrift from './PetalDrift'
import PromptFields from './PromptFields'
import StampButton from './StampButton'
import TopBar, { BackLink } from './TopBar'
import WeekStrip from './WeekStrip'
import { useKeyboardShift } from './useKeyboardShift'
import { formatLong, fromKey, isSunday, toKey, todayKey } from './dates'
import type { Entries, Entry, Item } from './storage'

type Props = {
  date: string
  entry: Entry | undefined
  entries: Entries
  hasWeekReview: boolean
  currentPrompts: string[]
  onChange: (date: string, items: Item[]) => void
  onStamp: (date: string, items: Item[]) => void
  onBack: () => void
}

export default function DayView({ date, entry, entries, hasWeekReview, currentPrompts, onChange, onStamp, onBack }: Props) {
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

  const filled = items.filter((i) => i.answer.trim()).length
  const complete = filled === items.length

  const sticky = useRef<HTMLDivElement>(null)
  useKeyboardShift(sticky)

  // Stamping is the moment to celebrate; it stays stamped while the day has answers.
  const stamped = !!entry?.stampedAt && filled > 0
  // After a fresh stamp the seal lands first; only then does the page bloom and petals start to fall.
  const [bloomed, setBloomed] = useState(stamped)
  const stampDay = () => {
    onStamp(date, items)
    navigator.vibrate?.(25)
    window.setTimeout(() => setBloomed(true), 750)
  }
  const blooming = stamped && bloomed
  useEffect(() => {
    if (!blooming) return
    const root = document.documentElement
    root.style.setProperty('--bloom', flowerColor(date))
    root.classList.add('bloomed')
    return () => root.classList.remove('bloomed')
  }, [blooming, date])

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
        title={date === today ? 'Today' : 'A pressed day'}
        start={<BackLink href="#/" label="Back to the wreath" onClick={onBack} />}
      />
      <div ref={sticky} className="day-sticky">
        <WeekStrip
          date={date}
          entries={entries}
          promptCount={currentPrompts.length}
          petals={items.length}
          filled={future ? 0 : filled}
          complete={!future && stamped}
        />
      </div>
      <div className="page-head mt-3 mb-5 flex items-center gap-4">
        <span className="text-6xl leading-none">{Number(date.slice(8))}</span>
        <span className="grow">
          <span className="block text-lg italic leading-tight opacity-80">{formatLong(date)}</span>
          {!future &&
            (stamped ? (
              <span key="done" className="petal-count pressed-line block text-sm italic text-rose">
                ✿ Stamped. This day is pressed.
              </span>
            ) : complete ? (
              <span key="full" className="petal-count block text-sm italic text-rose">
                Every petal is in. Stamp it below.
              </span>
            ) : (
              <span className="petal-count block text-sm italic opacity-60">
                {filled} of {items.length} petals
              </span>
            ))}
        </span>
      </div>
      {blooming && <PetalDrift color={flowerColor(date)} />}

      {future ? (
        <p className="empty my-12 text-center italic opacity-60">This day hasn't happened yet.</p>
      ) : (
        <form className="mt-3" onSubmit={(e) => e.preventDefault()}>
          <PromptFields items={items} rows={3} onAnswer={update} />
          <div className="mt-8">
            <StampButton filled={filled} total={items.length} stamped={stamped} onStamp={stampDay} />
          </div>
          <p className="mt-5 text-center text-sm italic opacity-60">
            Saved automatically on this device. <a className="link text-rose" href="#/settings">Change prompts</a>
          </p>
        </form>
      )}

      {!future && isSunday(date) && (
        <a
          className="week-card card mt-6 border border-rose/40 bg-base-100"
          href={`#/week/${date}`}
        >
          <span className="card-body flex-row items-center gap-3 p-4">
            <span className="text-3xl text-rose" aria-hidden="true">✿</span>
            <span className="grow">
              <strong className="font-semibold">Weekly review</strong>
              <span className="block text-sm italic opacity-70">
                {hasWeekReview ? 'Written. Tap to read or edit.' : 'Sunday is a good day to look back on the week.'}
              </span>
            </span>
            <span className="text-2xl" aria-hidden="true">›</span>
          </span>
        </a>
      )}

      <nav className="mt-4 flex justify-between">
        <a className="btn btn-ghost btn-sm" href={`#/day/${prev}`}>
          ‹ Previous day
        </a>
        {next <= today && (
          <a className="btn btn-ghost btn-sm" href={`#/day/${next}`}>
            Next day ›
          </a>
        )}
      </nav>
    </section>
  )
}
