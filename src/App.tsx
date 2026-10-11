import { useState } from 'react'
import CalendarView from './CalendarView'
import DayView from './DayView'
import SettingsView from './SettingsView'
import WeekView from './WeekView'
import { fromKey } from './dates'
import { useHashRoute } from './useHashRoute'
import { useJournal } from './useJournal'

export default function App() {
  const route = useHashRoute()
  const journal = useJournal()
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const { settings } = journal

  return (
    <main className="app mx-auto max-w-md px-4">
      {journal.saveError && (
        <div role="alert" className="alert alert-error mb-3 text-sm">
          Couldn't read or write this device's storage. Export a backup from settings if you can.
        </div>
      )}
      {!journal.loaded || !settings ? null : (
        <>
          {route.name === 'day' && (
            <DayView
              key={route.date}
              date={route.date}
              entry={journal.entries[route.date]}
              hasWeekReview={!!journal.weeks[route.date]}
              currentPrompts={settings.prompts}
              onChange={journal.setItems}
              onBack={() => {
                const d = fromKey(route.date)
                setMonth({ year: d.getFullYear(), month: d.getMonth() })
              }}
            />
          )}
          {route.name === 'week' && (
            <WeekView
              key={route.sunday}
              sunday={route.sunday}
              entry={journal.weeks[route.sunday]}
              days={journal.entries}
              currentPrompts={settings.weeklyPrompts}
              onChange={journal.setWeekItems}
            />
          )}
          {route.name === 'settings' && (
            <SettingsView
              entries={journal.entries}
              weeks={journal.weeks}
              settings={settings}
              persist={journal.persist}
              onSettingsChange={journal.updateSettings}
              onImport={journal.importFile}
              onBeforeExport={journal.flush}
              onRetryPersist={journal.retryPersist}
            />
          )}
          {route.name === 'calendar' && (
            <CalendarView
              year={month.year}
              month={month.month}
              entries={journal.entries}
              weeks={journal.weeks}
              onMonthChange={(year, m) => setMonth({ year, month: m })}
            />
          )}
        </>
      )}
    </main>
  )
}
