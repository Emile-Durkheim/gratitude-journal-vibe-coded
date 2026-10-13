import { useState } from 'react'
import type { PromptGroup } from './prompts'
import { useT } from './useLang'

type Props = {
  title: string
  intro: string
  libraryTitle: string
  /** Active prompts, in order. */
  prompts: string[]
  /** User-written prompts, shown in the library under "Your own". */
  custom: string[]
  library: PromptGroup[]
  defaults: string[]
  onChange: (patch: { prompts?: string[]; custom?: string[] }) => void
}

export default function PromptSection({ title, intro, libraryTitle, prompts, custom, library, defaults, onChange }: Props) {
  const t = useT()
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
      <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
        <div className="card-body gap-2 p-4">
          <h2 className="card-title text-xl font-normal italic">{title}</h2>
          <p className="text-sm text-base-content/70">{intro}</p>
          <ol className="active-list mt-2 grid gap-2">
            {prompts.map((p, i) => (
              <li key={p} className="flex items-center gap-1 rounded-sm bg-base-200 py-2 pl-3 pr-1">
                <span className="mr-2 grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-normal text-primary-content">
                  {i + 1}
                </span>
                <span className="grow">{p}</span>
                <button className="btn btn-ghost btn-square btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t.moveUp(p)}>
                  ↑
                </button>
                <button
                  className="btn btn-ghost btn-square btn-sm"
                  onClick={() => move(i, 1)}
                  disabled={i === prompts.length - 1}
                  aria-label={t.moveDown(p)}
                >
                  ↓
                </button>
                <button
                  className="btn btn-ghost btn-square btn-sm"
                  onClick={() => toggle(p)}
                  disabled={prompts.length === 1}
                  aria-label={t.removePrompt(p)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
        <div className="card-body gap-2 p-4">
          <h2 className="card-title text-xl font-normal italic">{libraryTitle}</h2>
          <p className="text-sm text-base-content/70">{t.libraryIntro}</p>
          <div className="library -mx-1 mt-1 max-h-96 overflow-y-auto overscroll-contain px-1" role="list">
            {library.map((group) => (
              <div key={group.title} role="presentation">
                <h3 className="sticky top-0 z-10 bg-base-100 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">
                  {group.title}
                </h3>
                {group.prompts.map((lp) => (
                  <LibraryRow key={lp.text} text={lp.text} why={lp.why} on={prompts.includes(lp.text)} onToggle={toggle} />
                ))}
              </div>
            ))}
            {custom.length > 0 && (
              <div role="presentation">
                <h3 className="sticky top-0 z-10 bg-base-100 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-widest opacity-60">
                  {t.yourOwn}
                </h3>
                {custom.map((text) => (
                  <LibraryRow key={text} text={text} on={prompts.includes(text)} onToggle={toggle} onDelete={() => remove(text)} />
                ))}
              </div>
            )}
          </div>
          <form
            className="add-row mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              add()
            }}
          >
            <input
              type="text"
              className="input input-primary grow"
              value={draft}
              maxLength={140}
              placeholder={t.writeYourOwn}
              aria-label={`${t.writeYourOwn}: ${title}`}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" disabled={!draft.trim()}>
              {t.add}
            </button>
          </form>
        </div>
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
  const t = useT()
  return (
    <div className="mb-2 flex items-center gap-1" role="listitem">
      <button
        className={`library-item flex flex-1 items-start gap-3 rounded-sm border p-3 text-left transition-colors ${
          on ? 'on border-rose/60 bg-rose/8' : 'border-base-300 bg-base-100 hover:bg-base-200'
        }`}
        aria-pressed={on}
        onClick={() => onToggle(text)}
      >
        <span
          className={`mt-0.5 grid size-6 flex-none place-items-center rounded-full text-sm font-bold ${
            on ? 'bg-rose text-white' : 'border border-base-300 text-base-content/50'
          }`}
          aria-hidden="true"
        >
          {on ? '✓' : '+'}
        </span>
        <span className="grow">
          {text}
          {why && <span className="mt-0.5 block text-xs text-base-content/60">{why}</span>}
        </span>
      </button>
      {onDelete && (
        <button className="btn btn-ghost btn-square btn-sm" onClick={onDelete} aria-label={t.deletePrompt(text)}>
          🗑
        </button>
      )}
    </div>
  )
}
