import { Flower, LeafG, petalsFor } from './flower'
import { formatLong, fromKey, todayKey, weekDays, weekEnd } from './dates'
import type { Entries } from './storage'

type Props = {
  date: string
  entries: Entries
  promptCount: number
  /** The open day's flower, drawn from what is being typed so it grows live. */
  petals: number
  filled: number
  /** Every petal is in: the flower gets a soft golden halo. */
  complete: boolean
}

/**
 * The open day's week along the top of the day page, so progress stays in view while writing.
 * The open day is the large flower; the others are small and lead to their own pages.
 */
export default function WeekStrip({ date, entries, promptCount, petals, filled, complete }: Props) {
  const today = todayKey()
  return (
    <nav className="week-strip flex items-end" aria-label="This week">
      {weekDays(weekEnd(date)).map((d) => {
        const selected = d === date
        const future = d > today
        const entry = entries[d]
        const weekday = fromKey(d).toLocaleDateString(undefined, { weekday: 'narrow' })
        const flower = selected ? (
          // the sway and the "pressed" glow live on an HTML wrapper so they stay smooth while scrolling
          <span className={`live-flower sway ${complete ? 'complete' : ''}`}>
            <Flower size={58} petals={petals} filled={filled} day={d} />
          </span>
        ) : entry ? (
          <Flower size={30} {...petalsFor(entry.items, promptCount)} day={d} />
        ) : future ? (
          <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
            <circle r="3.5" fill="#e6dcc6" stroke="#cbbfae" />
          </svg>
        ) : d === today ? (
          <Flower size={30} petals={promptCount} filled={0} day={d} />
        ) : (
          <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
            <g transform="rotate(-20) scale(.9)">
              <LeafG />
            </g>
          </svg>
        )
        const body = (
          <>
            <span className="strip-weekday text-[0.65rem] uppercase tracking-[0.15em] opacity-60">{weekday}</span>
            <span className="grid place-items-center">{flower}</span>
            <span className={`text-sm italic leading-none ${d === today ? 'font-semibold text-rose' : 'opacity-60'}`}>
              {Number(d.slice(8))}
            </span>
          </>
        )
        const cls = `strip-day flex flex-col items-center gap-0.5 rounded py-1 ${selected ? 'selected' : ''}`
        return future ? (
          <span key={d} className={`${cls} opacity-60`} aria-label={`${formatLong(d)}, not yet`}>
            {body}
          </span>
        ) : (
          <a
            key={d}
            href={`#/day/${d}`}
            className={cls}
            aria-current={selected ? 'page' : undefined}
            aria-label={`${formatLong(d)}${entry ? ', pressed' : ''}`}
          >
            {body}
          </a>
        )
      })}
    </nav>
  )
}
