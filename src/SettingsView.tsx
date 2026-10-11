import { useRef, useState } from 'react'
import { todayKey } from './dates'
import PromptSection from './PromptSection'
import { DEFAULT_PROMPTS, DEFAULT_WEEKLY_PROMPTS, PROMPT_LIBRARY, WEEKLY_PROMPT_LIBRARY } from './prompts'
import { parseExport, toExport, type Entries, type ExportFile, type PersistState, type Settings } from './storage'

type Props = {
  entries: Entries
  weeks: Entries
  settings: Settings
  persist: PersistState | null
  onSettingsChange: (patch: Partial<Settings>) => void
  onImport: (file: ExportFile) => void
  onBeforeExport: () => void
  onRetryPersist: () => void
}

const DAY_MS = 24 * 60 * 60 * 1000

export default function SettingsView(props: Props) {
  const { entries, weeks, settings, persist, onSettingsChange, onImport, onBeforeExport, onRetryPersist } = props
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const exportData = () => {
    onBeforeExport()
    const now = Date.now()
    const file = toExport(entries, { ...settings, lastExportAt: now }, weeks)
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `gratitude-journal-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    onSettingsChange({ lastExportAt: now })
  }

  const importData = async (file: File) => {
    try {
      const data = parseExport(await file.text())
      onImport(data)
      const n = Object.keys(data.entries).length
      const w = Object.keys(data.weeks).length
      setMessage(`Imported ${n} ${n === 1 ? 'day' : 'days'} and ${w} weekly ${w === 1 ? 'review' : 'reviews'}.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  const total = Object.keys(entries).length
  const totalWeeks = Object.keys(weeks).length
  const lastExport = settings.lastExportAt
    ? Math.floor((Date.now() - settings.lastExportAt) / DAY_MS)
    : null

  return (
    <section>
      <header className="topbar">
        <a className="icon-btn" href="#/" aria-label="Back to calendar">
          ‹
        </a>
        <h1>Settings</h1>
        <span className="icon-btn-spacer" />
      </header>

      <PromptSection
        title="Your daily prompts"
        intro="New days use these, in this order. Days you've already written keep their prompts."
        prompts={settings.prompts}
        custom={settings.customPrompts}
        library={PROMPT_LIBRARY}
        defaults={DEFAULT_PROMPTS}
        onChange={({ prompts, custom }) =>
          onSettingsChange({ ...(prompts && { prompts }), ...(custom && { customPrompts: custom }) })
        }
      />

      <PromptSection
        title="Your weekly review prompts"
        intro="Shown in the weekly review, which you can open from the calendar or from any Sunday."
        prompts={settings.weeklyPrompts}
        custom={settings.customWeeklyPrompts}
        library={WEEKLY_PROMPT_LIBRARY}
        defaults={DEFAULT_WEEKLY_PROMPTS}
        onChange={({ prompts, custom }) =>
          onSettingsChange({ ...(prompts && { weeklyPrompts: prompts }), ...(custom && { customWeeklyPrompts: custom }) })
        }
      />

      <div className="card">
        <h2>Keeping your journal safe</h2>
        <p className="muted small">
          Your journal lives only on this device ({total} {total === 1 ? 'day' : 'days'}, {totalWeeks} weekly {totalWeeks === 1 ? 'review' : 'reviews'}).{' '}
          {persist === 'persisted' && 'The browser has agreed not to clear it to free up space.'}
          {persist === 'not-persisted' &&
            "The browser hasn't yet agreed to keep it permanently. Installing the app to your home screen usually fixes this."}
          {persist === 'unsupported' && "This browser can't promise to keep it permanently."}{' '}
          It's still deleted if you clear this site's data or uninstall the app, so export a backup now and then.
        </p>
        {persist === 'not-persisted' && (
          <button className="link-btn" onClick={onRetryPersist}>
            Ask again
          </button>
        )}
        <p className="small">
          {lastExport === null
            ? 'No backup yet.'
            : `Last backup: ${lastExport === 0 ? 'today' : `${lastExport} ${lastExport === 1 ? 'day' : 'days'} ago`}.`}
        </p>
        <div className="row">
          <button className="secondary-btn" onClick={exportData}>
            Export backup
          </button>
          <button className="secondary-btn" onClick={() => fileInput.current?.click()}>
            Import
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importData(file)
              e.target.value = ''
            }}
          />
        </div>
        <p className="muted small">Importing merges days (newer edits win) and uses the backup's prompts.</p>
      </div>

      {message && (
        <p className="muted center" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
