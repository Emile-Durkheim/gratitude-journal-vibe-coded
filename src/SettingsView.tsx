import { useRef, useState } from 'react'
import { todayKey } from './dates'
import { DEFAULT_PROMPTS, type Prompts } from './prompts'
import { parseExport, toExport, type Entries, type ExportFile, type Settings } from './storage'

type Props = {
  entries: Entries
  settings: Settings
  onPromptsChange: (prompts: Prompts) => void
  onImport: (file: ExportFile) => void
  onBeforeExport: () => void
}

export default function SettingsView({ entries, settings, onPromptsChange, onImport, onBeforeExport }: Props) {
  const [draft, setDraft] = useState<Prompts>(settings.prompts)
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const dirty = draft.some((p, i) => p !== settings.prompts[i])
  const valid = draft.every((p) => p.trim() !== '')
  const isDefault = settings.prompts.every((p, i) => p === DEFAULT_PROMPTS[i])

  const save = () => {
    onPromptsChange(draft.map((p) => p.trim()) as Prompts)
    setMessage("Prompts saved. They apply to days you haven't written yet.")
  }

  const reset = () => {
    setDraft(DEFAULT_PROMPTS)
    onPromptsChange(DEFAULT_PROMPTS)
    setMessage('Prompts reset to the defaults.')
  }

  const exportData = () => {
    onBeforeExport()
    const blob = new Blob([JSON.stringify(toExport(entries, settings), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gratitude-journal-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const data = parseExport(await file.text())
      onImport(data)
      setDraft(data.settings.prompts)
      const n = Object.keys(data.entries).length
      setMessage(`Imported ${n} ${n === 1 ? 'day' : 'days'}.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  const total = Object.keys(entries).length

  return (
    <section>
      <header className="topbar">
        <a className="icon-btn" href="#/" aria-label="Back to calendar">
          ‹
        </a>
        <h1>Settings</h1>
        <span className="icon-btn-spacer" />
      </header>

      <div className="card">
        <h2>Your three prompts</h2>
        <p className="muted small">Changes apply to days you haven't written yet. Past entries keep their original prompts.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (dirty && valid) save()
          }}
        >
          {draft.map((p, i) => (
            <label key={i} className="prompt">
              <span className="prompt-label">
                <span className="prompt-num">{i + 1}</span>
                Prompt {i + 1}
              </span>
              <input
                type="text"
                value={p}
                maxLength={140}
                onChange={(e) => {
                  const next = [...draft] as Prompts
                  next[i] = e.target.value
                  setDraft(next)
                  setMessage(null)
                }}
              />
            </label>
          ))}
          <div className="row">
            <button type="submit" className="primary-btn" disabled={!dirty || !valid}>
              Save prompts
            </button>
            <button type="button" className="link-btn" onClick={reset} disabled={isDefault && !dirty}>
              Reset to defaults
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Backup</h2>
        <p className="muted small">
          Your journal lives only in this browser ({total} {total === 1 ? 'day' : 'days'}). Export a file now and then to keep
          a copy. Importing merges entries and replaces your prompts with the ones in the file.
        </p>
        <div className="row">
          <button className="secondary-btn" onClick={exportData}>
            Export
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
      </div>

      {message && (
        <p className="muted center" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
