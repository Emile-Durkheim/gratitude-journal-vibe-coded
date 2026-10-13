import { useEffect, useMemo, useState } from 'react'
import CalendarView from './CalendarView'
import WreathView from './WreathView'
import DayView from './DayView'
import SettingsView from './SettingsView'
import WeekView from './WeekView'
import { fromKey, setDateLocale, todayKey, weekEnd } from './dates'
import { STRINGS, localeFor } from './i18n'
import { LangContext } from './useLang'
import { useHashRoute } from './useHashRoute'
import { useJournal } from './useJournal'

export default function App() {
  const route = useHashRoute()
  const journal = useJournal()
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [wreathWeek, setWreathWeek] = useState(() => weekEnd(todayKey()))
  const { settings, lang, language, setLanguage } = journal
  // Dates are formatted during render, so the locale has to be in place before the views render.
  setDateLocale(localeFor(lang))
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = STRINGS[lang].docTitle
  }, [lang])
  const langState = useMemo(() => ({ lang, choice: language, t: STRINGS[lang], setChoice: setLanguage }), [lang, language, setLanguage])

  return (
    <LangContext.Provider value={langState}>
      <main className="app mx-auto max-w-md px-5">
        {journal.saveError && (
          <div role="alert" className="alert alert-error mb-3 text-sm">
            {langState.t.saveError}
          </div>
        )}
        {!journal.loaded || !settings ? null : (
          <>
            {route.name === 'day' && (
              <DayView
                key={route.date}
                date={route.date}
                entry={journal.entries[route.date]}
                entries={journal.entries}
                hasWeekReview={!!journal.weeks[route.date]}
                currentPrompts={settings.prompts}
                onChange={journal.setItems}
                onStamp={journal.stamp}
                onBack={() => {
                  const d = fromKey(route.date)
                  setMonth({ year: d.getFullYear(), month: d.getMonth() })
                  setWreathWeek(weekEnd(route.date))
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
                onBack={() => setWreathWeek(route.sunday > weekEnd(todayKey()) ? weekEnd(todayKey()) : route.sunday)}
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
                promptCount={settings.prompts.length}
                onMonthChange={(year, m) => setMonth({ year, month: m })}
              />
            )}
            {route.name === 'wreath' && (
              <WreathView
                sunday={wreathWeek}
                entries={journal.entries}
                weeks={journal.weeks}
                promptCount={settings.prompts.length}
                onWeekChange={setWreathWeek}
              />
            )}
          </>
        )}
      </main>
    </LangContext.Provider>
  )
}
