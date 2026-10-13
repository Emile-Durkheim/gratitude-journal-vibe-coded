import { useLayoutEffect, useRef } from 'react'
import { useT } from './useLang'
import type { Item } from './storage'

type Props = {
  items: Item[]
  rows: number
  onAnswer: (index: number, answer: string) => void
}

/** Prompts in italic serif, answers handwritten on ruled lines. Shared by the day and week views. */
export default function PromptFields({ items, rows, onAnswer }: Props) {
  return (
    <div className="grid gap-6">
      {items.map((item, i) => (
        <label key={i} className="prompt block">
          <span className="prompt-label flex items-baseline gap-2 text-lg italic leading-snug">
            <span className="flex-none text-sm not-italic text-rose" aria-hidden="true">
              ✿ {i + 1}
            </span>
            <span>{item.prompt}</span>
          </span>
          <Ruled value={item.answer} rows={rows} onChange={(v) => onAnswer(i, v)} />
        </label>
      ))}
    </div>
  )
}

function Ruled({ value, rows, onChange }: { value: string; rows: number; onChange: (v: string) => void }) {
  const t = useT()
  const ref = useRef<HTMLTextAreaElement>(null)
  // Grow with the writing so the page reads like paper, not a scroll box.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      className="ruled mt-1"
      style={{ minHeight: `calc(2.25rem * ${rows})` }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={t.writeHere}
    />
  )
}
