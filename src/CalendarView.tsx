import { formatLong, formatMonth, isSunday, monthGrid, todayKey, weekEnd, weekdayLabels } from './dates'
import type { Entries } from './storage'

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
      <header className="topbar">
        <h1>Gratitude Journal</h1>
        <a className="icon-btn" href="#/settings" aria-label="Settings">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
              transform="translate(-1 0)"
            />
          </svg>
        </a>
      </header>

      <div className="month-nav">
        <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
          ‹
        </button>
        <h2>{formatMonth(year, month)}</h2>
        <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <table className="calendar" role="grid">
        <thead>
          <tr>
            {weekdayLabels().map((label, i) => (
              <th key={i} scope="col">
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

      <div className="calendar-footer">
        <span className="muted">
          {count === 0 ? 'No entries this month' : `${count} ${count === 1 ? 'day' : 'days'} written`}
        </span>
        {!isCurrentMonth && (
          <button className="link-btn" onClick={() => onMonthChange(now.getFullYear(), now.getMonth())}>
            Today
          </button>
        )}
      </div>

      <a className="primary-btn" href={`#/day/${today}`}>
        Write today's entry
      </a>
      <a className={isSunday(today) ? 'primary-btn week-btn highlight' : 'secondary-btn week-btn'} href={`#/week/${weekEnd(today)}`}>
        {isSunday(today) ? "It's Sunday: review your week" : 'Review this week'}
      </a>
    </section>
  )
}

function DayCell({ dateKey, today, filled, weekDone }: { dateKey: string; today: string; filled: boolean; weekDone: boolean }) {
  const day = Number(dateKey.slice(8))
  const future = dateKey > today
  const classes = ['day', dateKey === today && 'today', filled && 'filled', future && 'future']
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
    <a className={classes} href={`#/day/${dateKey}`} aria-label={label} aria-current={dateKey === today ? 'date' : undefined}>
      {day}
      <span className="dot" aria-hidden="true" />
      {weekDone && <span className="week-mark" aria-hidden="true" />}
    </a>
  )
}
