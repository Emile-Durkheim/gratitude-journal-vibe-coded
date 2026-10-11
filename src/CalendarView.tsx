import { formatLong, formatMonth, isSunday, monthGrid, todayKey, weekEnd, weekdayLabels } from './dates'
import type { Entries } from './storage'
import TopBar from './TopBar'

type Props = {
  year: number
  month: number
  entries: Entries
  weeks: Entries
  onMonthChange: (year: number, month: number) => void
}

export default function CalendarView({ year, month, entries, weeks, onMonthChange }: Props) {
  const today = todayKey()
  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    onMonthChange(d.getFullYear(), d.getMonth())
  }
  const count = Object.keys(entries).filter((k) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length

  return (
    <section>
      <TopBar
        title="☀️ Gratitude Journal"
        end={
          <a className="btn btn-circle btn-ghost" href="#/settings" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
                transform="translate(-1 0)"
              />
            </svg>
          </a>
        }
      />

      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-2 p-3">
          <div className="flex items-center justify-between">
            <button className="btn btn-circle btn-ghost text-2xl" onClick={() => shift(-1)} aria-label="Previous month">
              ‹
            </button>
            <h2 className="text-lg font-extrabold">{formatMonth(year, month)}</h2>
            <button className="btn btn-circle btn-ghost text-2xl" onClick={() => shift(1)} aria-label="Next month">
              ›
            </button>
          </div>

          <table className="calendar w-full" role="grid">
            <thead>
              <tr>
                {weekdayLabels().map((label, i) => (
                  <th key={i} scope="col" className="pb-1 text-xs font-bold text-base-content/60">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthGrid(year, month).map((week, i) => (
                <tr key={i}>
                  {week.map((key, j) => (
                    <td key={j}>
                      {key && <DayCell dateKey={key} today={today} filled={!!entries[key]} weekDone={!!weeks[key]} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex min-h-9 items-center justify-between px-1">
            <span className="text-sm text-base-content/60">
              {count === 0 ? 'No entries this month' : `${count} ${count === 1 ? 'day' : 'days'} written ✨`}
            </span>
            {!isCurrentMonth && (
              <button className="btn btn-ghost btn-sm text-secondary-content" onClick={() => onMonthChange(now.getFullYear(), now.getMonth())}>
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <a className="btn btn-primary btn-lg w-full" href={`#/day/${today}`}>
          Write today's entry
        </a>
        <a
          className={`week-btn btn btn-lg w-full ${isSunday(today) ? 'btn-secondary highlight' : 'btn-outline btn-secondary'}`}
          href={`#/week/${weekEnd(today)}`}
        >
          {isSunday(today) ? "🌟 It's Sunday: review your week" : 'Review this week'}
        </a>
      </div>
    </section>
  )
}

function DayCell({ dateKey, today, filled, weekDone }: { dateKey: string; today: string; filled: boolean; weekDone: boolean }) {
  const day = Number(dateKey.slice(8))
  const future = dateKey > today
  const isToday = dateKey === today
  const classes = [
    'day relative grid aspect-square place-items-center rounded-2xl text-base font-bold',
    filled ? 'filled bg-primary text-primary-content shadow-sm' : 'bg-base-200 text-base-content',
    isToday && 'today ring-2 ring-secondary ring-offset-2 ring-offset-base-100',
    future && 'future bg-transparent text-base-content/30',
    !future && 'transition-transform active:scale-95 hover:brightness-95',
  ]
    .filter(Boolean)
    .join(' ')
  const label = `${formatLong(dateKey)}${filled ? ', has entry' : ''}${weekDone ? ', weekly review written' : ''}`
  if (future) {
    return (
      <span className={classes} aria-label={label} aria-disabled="true">
        {day}
      </span>
    )
  }
  return (
    <a className={classes} href={`#/day/${dateKey}`} aria-label={label} aria-current={isToday ? 'date' : undefined}>
      {day}
      {weekDone && <span className="week-mark absolute right-1 top-1 size-2.5 rounded-full bg-secondary" aria-hidden="true" />}
    </a>
  )
}
