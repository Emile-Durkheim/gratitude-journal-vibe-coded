import { useState } from 'react'
import CalendarView from './CalendarView'
import DayView from './DayView'
import SettingsView from './SettingsView'
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

  return (
    <main className="app">
      {journal.saveError && (
        <p className="banner" role="alert">
          Couldn't save to this device's storage. Export a backup from settings.
        </p>
      )}
      {route.name === 'day' && (
        <DayView
          key={route.date}
          date={route.date}
          entry={journal.entries[route.date]}
          currentPrompts={journal.settings.prompts}
          onChange={journal.setAnswers}
          onBack={() => {
            const d = fromKey(route.date)
            setMonth({ year: d.getFullYear(), month: d.getMonth() })
          }}
        />
      )}
      {route.name === 'settings' && (
        <SettingsView
          entries={journal.entries}
          settings={journal.settings}
          onPromptsChange={journal.setPrompts}
          onImport={journal.importFile}
          onBeforeExport={journal.flush}
        />
      )}
      {route.name === 'calendar' && (
        <CalendarView
          year={month.year}
          month={month.month}
          entries={journal.entries}
          onMonthChange={(year, m) => setMonth({ year, month: m })}
        />
      )}
    </main>
  )
}
