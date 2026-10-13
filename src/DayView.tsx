import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { flowerColor } from './flower'
import PetalDrift from './PetalDrift'
import PromptFields from './PromptFields'
import { useLang } from './useLang'
import StampButton from './StampButton'
import TopBar, { BackLink } from './TopBar'
import WeekStrip from './WeekStrip'
import { useKeyboardShift } from './useKeyboardShift'
import { quoteFor } from './quotes'
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
  const { t, lang } = useLang()
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

  const sticky = useRef<HTMLDivElement>(null)
  useKeyboardShift(sticky)

  // Stamping is the moment to celebrate; it stays stamped while the day has answers.
  const stamped = !!entry?.stampedAt && filled > 0
  // After a fresh stamp the seal lands first; then the bloom spreads out from the stamp across the
  // page and petals start to fall. A day that was already stamped opens bloomed.
  const [bloom, setBloom] = useState<'none' | 'spreading' | 'done'>(stamped ? 'done' : 'none')
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const stampDay = (from: { x: number; y: number }) => {
    onStamp(date, items)
    navigator.vibrate?.(25)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setOrigin(from)
    window.setTimeout(() => setBloom(reduced ? 'done' : 'spreading'), 320)
  }
  const blooming = stamped && bloom !== 'none'
  useEffect(() => {
    if (!stamped || bloom !== 'done') return
    const root = document.documentElement
    root.style.setProperty('--bloom', flowerColor(date))
    root.classList.add('bloomed')
    return () => root.classList.remove('bloomed')
  }, [stamped, bloom, date])

  const quote = quoteFor(date, lang)

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
        title={date === today ? t.today : t.aPressedDay}
        start={<BackLink href="#/" label={t.backToWreath} onClick={onBack} />}
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
          {/* a quote for the day, in ink until the day is stamped, then in rose with the flower */}
          <span className={`day-quote mt-1 block text-sm italic leading-snug ${stamped ? 'pressed' : ''}`}>
            {stamped && (
              <span className="mr-1 not-italic" aria-hidden="true">
                ✿
              </span>
            )}
            {t.quoted(quote.text)} <span className="whitespace-nowrap not-italic opacity-75">— {quote.by}</span>
          </span>
        </span>
      </div>
      {stamped && bloom === 'spreading' && (
        <div
          className="bloom-wave"
          aria-hidden="true"
          style={
            {
              '--bloom': flowerColor(date),
              '--x': `${origin.x}px`,
              '--y': `${origin.y}px`,
              // far enough to reach the furthest corner of the screen
              '--max-r': `${Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y)) + 80}px`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => setBloom('done')}
        />
      )}
      {blooming && <PetalDrift color={flowerColor(date)} />}

      {future ? (
        <p className="empty my-12 text-center italic opacity-60">{t.notYetHappened}</p>
      ) : (
        <form className="mt-3" onSubmit={(e) => e.preventDefault()}>
          <PromptFields items={items} rows={3} onAnswer={update} />
          <div className="mt-8">
            <StampButton filled={filled} total={items.length} stamped={stamped} onStamp={stampDay} />
          </div>
          <p className="mt-5 text-center text-sm italic opacity-60">
            <a className="link text-rose" href="#/settings">{t.changePrompts}</a>
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
              <strong className="font-semibold">{t.weeklyReview}</strong>
              <span className="block text-sm italic opacity-70">
                {hasWeekReview ? t.reviewCardWritten : t.reviewCardInvite}
              </span>
            </span>
            <span className="text-2xl" aria-hidden="true">›</span>
          </span>
        </a>
      )}

      <nav className="mt-4 flex justify-between">
        <a className="btn btn-ghost btn-sm" href={`#/day/${prev}`}>
          {t.previousDay}
        </a>
        {next <= today && (
          <a className="btn btn-ghost btn-sm" href={`#/day/${next}`}>
            {t.nextDay}
          </a>
        )}
      </nav>
    </section>
  )
}
