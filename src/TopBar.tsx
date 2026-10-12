import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  start?: ReactNode
  end?: ReactNode
}

/** Page header: small-caps title over a ruled line, with optional actions either side. */
export default function TopBar({ title, start, end }: Props) {
  return (
    <header className="mb-3 flex min-h-12 items-center gap-2 border-b-[1.5px] border-ink pb-1">
      {start}
      <h1 className="flex-1 text-[0.8rem] font-semibold uppercase tracking-[0.22em]">{title}</h1>
      {end}
    </header>
  )
}

export function BackLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <a className="btn btn-ghost btn-sm btn-square text-2xl" href={href} onClick={onClick} aria-label={label}>
      ‹
    </a>
  )
}

export function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a className="btn btn-ghost btn-sm btn-square" href={href} aria-label={label} title={label}>
      {children}
    </a>
  )
}

export const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
      transform="translate(-1 0)"
    />
  </svg>
)

export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
)

export const WreathIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="4" r="2" fill="currentColor" fillOpacity=".25" />
    <circle cx="19" cy="14.5" r="2" fill="currentColor" fillOpacity=".25" />
    <circle cx="5" cy="14.5" r="2" fill="currentColor" fillOpacity=".25" />
  </svg>
)
