import type React from 'react'
import { useInstall } from './install'
import { FlowerG, LeafG, petalsFor } from './flower'
import TopBar, { CalendarIcon, GearIcon, IconLink } from './TopBar'
import { formatLong, formatWeekRange, fromKey, isSunday, toKey, todayKey, weekDays, weekEnd } from './dates'
import type { Entries } from './storage'

type Props = {
  sunday: string
  entries: Entries
  weeks: Entries
  promptCount: number
  onWeekChange: (sunday: string) => void
}

const SIZE = 340
const C = SIZE / 2
const R = 112
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Home screen: this week as a wreath with one flower per day, Monday at the top going clockwise. */
export default function WreathView({ sunday, entries, weeks, promptCount, onWeekChange }: Props) {
  const today = todayKey()
  const thisWeek = weekEnd(today)
  const days = weekDays(sunday)
  const pressed = days.filter((d) => entries[d]).length
  const reviewed = !!weeks[sunday]
  const shift = (delta: number) => {
    const d = fromKey(sunday)
    d.setDate(d.getDate() + 7 * delta)
    return toKey(d)
  }
  const later = shift(1)
  const isThisWeek = sunday === thisWeek
  const install = useInstall()

  return (
    <section>
      <TopBar
        title="The Flower Press"
        start={
          <IconLink href="#/calendar" label="Calendar view">
            <CalendarIcon />
          </IconLink>
        }
        end={
          <IconLink href="#/settings" label="Settings">
            <GearIcon />
          </IconLink>
        }
      />

      <div className="relative mx-auto w-full max-w-[340px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="wreath block w-full" role="list" aria-label={`Week of ${formatWeekRange(sunday)}`}>
          {/* the vine runs between the day slots, leaving room for each flower */}
          {days.map((_, i) => {
            const gap = 17
            const a0 = ((i / 7) * 360 - 90 + gap) * (Math.PI / 180)
            const a1 = (((i + 1) / 7) * 360 - 90 - gap) * (Math.PI / 180)
            return (
              <path
                key={`a${i}`}
                d={`M${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)}`}
                fill="none"
                stroke="#a9bf9d"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}
          {/* little leaves along the vine, between the day slots */}
          {days.map((_, i) => {
            const a = ((i + 0.5) / 7) * 360 - 90
            const rad = (a * Math.PI) / 180
            return (
              <g key={`v${i}`} transform={`translate(${C + R * Math.cos(rad)} ${C + R * Math.sin(rad)}) rotate(${a + 90}) scale(.7)`}>
                <LeafG />
              </g>
            )
          })}
          {days.map((d, i) => {
            const a = (i / 7) * 360 - 90
            const rad = (a * Math.PI) / 180
            const x = C + R * Math.cos(rad)
            const y = C + R * Math.sin(rad)
            const lx = C + (R + 44) * Math.cos(rad)
            const ly = C + (R + 44) * Math.sin(rad)
            return (
              <g key={d} role="listitem">
                <Slot index={i} dateKey={d} x={x} y={y} angle={a} today={today} entries={entries} promptCount={promptCount} />
                <text x={lx} y={ly - 3} textAnchor="middle" className="fill-current text-[11px] uppercase tracking-[0.15em] opacity-70">
                  {SHORT[i]}
                </text>
                <text x={lx} y={ly + 12} textAnchor="middle" className={`text-[14px] italic ${d === today ? 'fill-rose font-semibold' : 'fill-current opacity-60'}`}>
                  {Number(d.slice(8))}
                </text>
              </g>
            )
          })}
          {reviewed && (
            <path d={`M${C + 52} ${C - 70} v30 l7 -6 l7 6 v-30z`} fill="#b5576c" fillOpacity=".75" aria-label="Weekly review written" />
          )}
        </svg>
        {days.includes(today) && <TodayRing index={days.indexOf(today)} />}
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-[0.7rem] uppercase tracking-[0.25em] opacity-60">{isThisWeek ? 'This week' : 'Week of'}</span>
          <span className="week-range text-xl italic leading-tight">{formatWeekRange(sunday)}</span>
          <span className="pressed-count mt-1 text-sm opacity-70">
            {pressed} of 7 pressed{reviewed ? ' · reviewed' : ''}
          </span>
        </div>
      </div>

      <nav className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost btn-sm" onClick={() => onWeekChange(shift(-1))}>
          ‹ Earlier
        </button>
        {!isThisWeek && (
          <button className="btn btn-ghost btn-sm text-rose" onClick={() => onWeekChange(thisWeek)}>
            This week
          </button>
        )}
        {later <= thisWeek ? (
          <button className="btn btn-ghost btn-sm" onClick={() => onWeekChange(later)}>
            Later ›
          </button>
        ) : (
          <span className="w-20" />
        )}
      </nav>

      <div className="grid gap-3">
        <a className="btn btn-primary btn-lg w-full" href={`#/day/${today}`}>
          {entries[today] ? "Open today's page" : "Press today's flower"}
        </a>
        <a
          className={`week-btn btn btn-lg w-full ${isSunday(today) && isThisWeek ? 'btn-secondary highlight' : 'btn-outline'}`}
          href={`#/week/${sunday <= thisWeek ? sunday : thisWeek}`}
        >
          {isSunday(today) && isThisWeek && !reviewed ? "It's Sunday: review your week" : reviewed ? 'Read the weekly review' : 'Review this week'}
        </a>
      </div>

      {install.kind !== 'installed' && (
        <p className="mt-5 text-center text-sm italic opacity-70">
          {install.kind === 'prompt' ? (
            <button className="link text-rose" onClick={install.install}>
              Install as an app
            </button>
          ) : (
            <a className="link text-rose" href="#/settings">
              Add the journal to your home screen
            </a>
          )}
        </p>
      )}
    </section>
  )
}

/**
 * The dashed ring round today, turning slowly. It sits over the wreath as its own element rather
 * than inside the SVG, so the browser can keep it turning on the compositor while the page scrolls.
 */
function TodayRing({ index }: { index: number }) {
  const rad = ((index / 7) * 360 - 90) * (Math.PI / 180)
  const pct = (v: number) => `${(v / SIZE) * 100}%`
  return (
    <div
      className="today-ring pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: pct(C + R * Math.cos(rad)), top: pct(C + R * Math.sin(rad)), width: pct(68) }}
      aria-hidden="true"
    >
      <svg viewBox="-34 -34 68 68" className="block w-full">
        <circle r="33" fill="none" stroke="#b5576c" strokeWidth="1.4" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

function Slot({ index, dateKey, x, y, angle, today, entries, promptCount }: {
  index: number
  dateKey: string
  x: number
  y: number
  angle: number
  today: string
  entries: Entries
  promptCount: number
}) {
  const entry = entries[dateKey]
  const future = dateKey > today
  const isToday = dateKey === today
  const label = `${formatLong(dateKey)}${entry ? ', pressed' : future ? ', not yet' : ', quiet day'}`
  // Flowers open one after another around the wreath, Monday first.
  const delay = { '--d': `${index * 110}ms` } as React.CSSProperties
  const body = entry ? (
    <g transform="scale(1.6)">
      <FlowerG {...petalsFor(entry.items, promptCount)} day={dateKey} delay={index * 0.11} />
    </g>
  ) : future ? (
    <circle r="4" fill="#e6dcc6" stroke="#cbbfae" />
  ) : isToday ? (
    <g transform="scale(1.6)">
      <FlowerG petals={promptCount} filled={0} day={dateKey} />
    </g>
  ) : (
    <g transform={`rotate(${angle + 90}) scale(1.1)`}>
      <g className="leaf" style={delay}>
        <LeafG />
      </g>
    </g>
  )
  return (
    <g transform={`translate(${x} ${y})`}>
            {future ? (
        <g aria-label={label}>{body}</g>
      ) : (
        <a href={`#/day/${dateKey}`} aria-label={label} className={`slot ${entry ? 'pressed' : 'empty'}`}>
          <circle r="31" fill="transparent" />
          {body}
        </a>
      )}
    </g>
  )
}
