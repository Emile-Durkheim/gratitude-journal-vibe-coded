import { useRef, useState } from 'react'
import { todayKey } from './dates'
import { DEFAULT_PROMPTS, PROMPT_LIBRARY } from './prompts'
import { parseExport, toExport, type Entries, type ExportFile, type PersistState, type Settings } from './storage'

type Props = {
  entries: Entries
  settings: Settings
  persist: PersistState | null
  onSettingsChange: (patch: Partial<Settings>) => void
  onImport: (file: ExportFile) => void
  onBeforeExport: () => void
  onRetryPersist: () => void
}

const DAY_MS = 24 * 60 * 60 * 1000

export default function SettingsView(props: Props) {
  const { entries, settings, persist, onSettingsChange, onImport, onBeforeExport, onRetryPersist } = props
  const [custom, setCustom] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const { prompts, customPrompts } = settings

  const setPrompts = (next: string[]) => onSettingsChange({ prompts: next })
  const toggle = (text: string) => {
    if (prompts.includes(text)) {
      if (prompts.length > 1) setPrompts(prompts.filter((p) => p !== text))
    } else {
      setPrompts([...prompts, text])
    }
  }
  const move = (i: number, delta: number) => {
    const next = [...prompts]
    ;[next[i], next[i + delta]] = [next[i + delta], next[i]]
    setPrompts(next)
  }
  const addCustom = () => {
    const text = custom.trim()
    if (!text) return
    onSettingsChange({
      customPrompts: customPrompts.includes(text) ? customPrompts : [...customPrompts, text],
      prompts: prompts.includes(text) ? prompts : [...prompts, text],
    })
    setCustom('')
  }
  const deleteCustom = (text: string) => {
    const nextPrompts = prompts.filter((p) => p !== text)
    onSettingsChange({
      customPrompts: customPrompts.filter((p) => p !== text),
      prompts: nextPrompts.length ? nextPrompts : DEFAULT_PROMPTS,
    })
  }

  const exportData = () => {
    onBeforeExport()
    const now = Date.now()
    const file = toExport(entries, { ...settings, lastExportAt: now })
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
      setMessage(`Imported ${n} ${n === 1 ? 'day' : 'days'}.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.')
    }
  }

  const total = Object.keys(entries).length
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

      <div className="card">
        <h2>Your daily prompts</h2>
        <p className="muted small">
          New days use these, in this order. Days you've already written keep their prompts.
        </p>
        <ol className="active-list">
          {prompts.map((p, i) => (
            <li key={p}>
              <span className="prompt-num">{i + 1}</span>
              <span className="grow">{p}</span>
              <button className="mini-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move "${p}" up`}>
                ↑
              </button>
              <button
                className="mini-btn"
                onClick={() => move(i, 1)}
                disabled={i === prompts.length - 1}
                aria-label={`Move "${p}" down`}
              >
                ↓
              </button>
              <button
                className="mini-btn"
                onClick={() => toggle(p)}
                disabled={prompts.length === 1}
                aria-label={`Remove "${p}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h2>Choose prompts</h2>
        <p className="muted small">Tap to add or remove. Each one notes the research behind it.</p>
        <div className="library" role="list">
          {PROMPT_LIBRARY.map((group) => (
            <div key={group.title} role="presentation">
              <h3 className="library-heading">{group.title}</h3>
              {group.prompts.map((lp) => (
                <LibraryRow key={lp.text} text={lp.text} why={lp.why} on={prompts.includes(lp.text)} onToggle={toggle} />
              ))}
            </div>
          ))}
          {customPrompts.length > 0 && (
            <div role="presentation">
              <h3 className="library-heading">Your own</h3>
              {customPrompts.map((text) => (
                <LibraryRow
                  key={text}
                  text={text}
                  on={prompts.includes(text)}
                  onToggle={toggle}
                  onDelete={() => deleteCustom(text)}
                />
              ))}
            </div>
          )}
        </div>
        <form
          className="row add-row"
          onSubmit={(e) => {
            e.preventDefault()
            addCustom()
          }}
        >
          <input
            type="text"
            value={custom}
            maxLength={140}
            placeholder="Write your own prompt"
            aria-label="Write your own prompt"
            onChange={(e) => setCustom(e.target.value)}
          />
          <button type="submit" className="secondary-btn add-btn" disabled={!custom.trim()}>
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Keeping your journal safe</h2>
        <p className="muted small">
          Your journal lives only on this device ({total} {total === 1 ? 'day' : 'days'}).{' '}
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

function LibraryRow(props: { text: string; why?: string; on: boolean; onToggle: (t: string) => void; onDelete?: () => void }) {
  const { text, why, on, onToggle, onDelete } = props
  return (
    <div className="library-row" role="listitem">
      <button className={`library-item${on ? ' on' : ''}`} aria-pressed={on} onClick={() => onToggle(text)}>
        <span className="check" aria-hidden="true">
          {on ? '✓' : '+'}
        </span>
        <span className="grow">
          {text}
          {why && <span className="why">{why}</span>}
        </span>
      </button>
      {onDelete && (
        <button className="mini-btn" onClick={onDelete} aria-label={`Delete "${text}"`}>
          🗑
        </button>
      )}
    </div>
  )
}
