import type { Item } from './storage'

type Props = {
  items: Item[]
  rows: number
  onAnswer: (index: number, answer: string) => void
}

/** One card per prompt, each with a text box. Shared by the day and week views. */
export default function PromptFields({ items, rows, onAnswer }: Props) {
  return (
    <div className="grid gap-4">
      {items.map((item, i) => (
        <label key={i} className="prompt card bg-base-100 shadow-md">
          <span className="card-body gap-3 p-4">
            <span className="prompt-label flex items-start gap-3 font-bold leading-snug">
              <span className="grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-content">
                {i + 1}
              </span>
              <span>{item.prompt}</span>
            </span>
            <textarea
              className="textarea textarea-primary w-full bg-base-100 text-base"
              value={item.answer}
              onChange={(e) => onAnswer(i, e.target.value)}
              rows={rows}
              placeholder="Write here…"
            />
          </span>
        </label>
      ))}
    </div>
  )
}
