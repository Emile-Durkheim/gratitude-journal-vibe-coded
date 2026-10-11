import { useState } from 'react'
import type { PromptGroup } from './prompts'

type Props = {
  title: string
  intro: string
  /** Active prompts, in order. */
  prompts: string[]
  /** User-written prompts, shown in the library under "Your own". */
  custom: string[]
  library: PromptGroup[]
  defaults: string[]
  onChange: (patch: { prompts?: string[]; custom?: string[] }) => void
}

export default function PromptSection({ title, intro, prompts, custom, library, defaults, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const toggle = (text: string) => {
    if (prompts.includes(text)) {
      if (prompts.length > 1) onChange({ prompts: prompts.filter((p) => p !== text) })
    } else {
      onChange({ prompts: [...prompts, text] })
    }
  }
  const move = (i: number, delta: number) => {
    const next = [...prompts]
    ;[next[i], next[i + delta]] = [next[i + delta], next[i]]
    onChange({ prompts: next })
  }
  const add = () => {
    const text = draft.trim()
    if (!text) return
    onChange({
      custom: custom.includes(text) ? custom : [...custom, text],
      prompts: prompts.includes(text) ? prompts : [...prompts, text],
    })
    setDraft('')
  }
  const remove = (text: string) => {
    const nextPrompts = prompts.filter((p) => p !== text)
    onChange({ custom: custom.filter((p) => p !== text), prompts: nextPrompts.length ? nextPrompts : defaults })
  }

  return (
    <>
      <div className="card">
        <h2>{title}</h2>
        <p className="muted small">{intro}</p>
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
        <h2>Choose {title.toLowerCase().replace(/^your /, '')}</h2>
        <p className="muted small">Tap to add or remove. Each one notes the research behind it.</p>
        <div className="library" role="list">
          {library.map((group) => (
            <div key={group.title} role="presentation">
              <h3 className="library-heading">{group.title}</h3>
              {group.prompts.map((lp) => (
                <LibraryRow key={lp.text} text={lp.text} why={lp.why} on={prompts.includes(lp.text)} onToggle={toggle} />
              ))}
            </div>
          ))}
          {custom.length > 0 && (
            <div role="presentation">
              <h3 className="library-heading">Your own</h3>
              {custom.map((text) => (
                <LibraryRow key={text} text={text} on={prompts.includes(text)} onToggle={toggle} onDelete={() => remove(text)} />
              ))}
            </div>
          )}
        </div>
        <form
          className="row add-row"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <input
            type="text"
            value={draft}
            maxLength={140}
            placeholder="Write your own prompt"
            aria-label={`Write your own prompt for ${title.toLowerCase()}`}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="secondary-btn add-btn" disabled={!draft.trim()}>
            Add
          </button>
        </form>
      </div>
    </>
  )
}

function LibraryRow(props: {
  text: string
  why?: string
  on: boolean
  onToggle: (t: string) => void
  onDelete?: () => void
}) {
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
