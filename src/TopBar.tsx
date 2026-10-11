import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** Left action, e.g. a back link. */
  start?: ReactNode
  /** Right action, e.g. settings. */
  end?: ReactNode
}

/** Page header with a title centred between two fixed-width slots. */
export default function TopBar({ title, start, end }: Props) {
  return (
    <header className="mb-2 flex min-h-12 items-center gap-2">
      <div className="flex w-11 justify-start">{start}</div>
      <h1 className="flex-1 text-center text-xl font-extrabold tracking-tight">{title}</h1>
      <div className="flex w-11 justify-end">{end}</div>
    </header>
  )
}

export function BackLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <a className="btn btn-circle btn-ghost text-2xl" href={href} onClick={onClick} aria-label={label}>
      ‹
    </a>
  )
}
