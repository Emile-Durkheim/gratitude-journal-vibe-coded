import { Flower, petalsFor } from './flower'
import { formatLong, formatMonth, monthGrid, todayKey, weekdayLabels } from './dates'
import type { Entries } from './storage'
import TopBar, { GearIcon, IconLink, WreathIcon } from './TopBar'

type Props = {
  year: number
  month: number
  entries: Entries
  weeks: Entries
  promptCount: number
  onMonthChange: (year: number, month: number) => void
}

/** The whole month as a pressing sheet: a small flower for each written day. */
export default function CalendarView({ year, month, entries, weeks, promptCount, onMonthChange }: Props) {
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
        title="The Flower Press"
        start={
          <IconLink href="#/" label="Wreath view">
            <WreathIcon />
          </IconLink>
        }
        end={
          <IconLink href="#/settings" label="Settings">
            <GearIcon />
          </IconLink>
        }
      />

      <div className="flex items-center justify-between">
        <button className="btn btn-ghost btn-sm text-2xl" onClick={() => shift(-1)} aria-label="Previous month">
          ‹
        </button>
        <h2 className="text-2xl italic">{formatMonth(year, month)}</h2>
        <button className="btn btn-ghost btn-sm text-2xl" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <table className="calendar mt-2 w-full" role="grid">
        <thead>
          <tr>
            {weekdayLabels().map((label, i) => (
              <th key={i} scope="col" className="pb-1 text-[0.7rem] font-normal uppercase tracking-widest opacity-60">
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
                  {key && <DayCell dateKey={key} today={today} entries={entries} weekDone={!!weeks[key]} promptCount={promptCount} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex min-h-9 items-center justify-between border-t border-base-300 pt-2">
        <span className="text-sm italic opacity-70">
          {count === 0 ? 'Nothing pressed this month' : `${count} ${count === 1 ? 'flower' : 'flowers'} pressed`}
        </span>
        {!isCurrentMonth && (
          <button className="btn btn-ghost btn-sm text-rose" onClick={() => onMonthChange(now.getFullYear(), now.getMonth())}>
            Today
          </button>
        )}
      </div>
    </section>
  )
}

function DayCell({ dateKey, today, entries, weekDone, promptCount }: {
  dateKey: string
  today: string
  entries: Entries
  weekDone: boolean
  promptCount: number
}) {
  const entry = entries[dateKey]
  const day = Number(dateKey.slice(8))
  const future = dateKey > today
  const isToday = dateKey === today
  const classes = [
    'day relative flex aspect-[4/5] flex-col items-center justify-start rounded-sm pt-0.5 text-sm',
    entry ? 'filled bg-base-100' : '',
    isToday ? 'today outline-[1.5px] outline-dashed outline-rose' : '',
    future ? 'future opacity-35' : 'hover:bg-base-100',
  ].join(' ')
  const label = `${formatLong(dateKey)}${entry ? ', has entry' : ''}${weekDone ? ', weekly review written' : ''}`
  const inner = (
    <>
      <span className={`italic leading-none ${isToday ? 'font-semibold text-rose' : 'opacity-70'}`}>{day}</span>
      {entry && (
        <span className="sway small" style={{ animationDuration: `${4 + (day % 5) * 0.4}s`, animationDelay: `${-day * 0.7}s` }}>
          <Flower size={30} {...petalsFor(entry.items, promptCount)} day={dateKey} rotate={day * 23} />
        </span>
      )}
      {weekDone && <span className="week-mark absolute bottom-0.5 right-1 text-[0.65rem] text-rose" aria-hidden="true">✿</span>}
    </>
  )
  if (future) {
    return (
      <span className={classes} aria-label={label} aria-disabled="true">
        {inner}
      </span>
    )
  }
  return (
    <a className={classes} href={`#/day/${dateKey}`} aria-label={label} aria-current={isToday ? 'date' : undefined}>
      {inner}
    </a>
  )
}
