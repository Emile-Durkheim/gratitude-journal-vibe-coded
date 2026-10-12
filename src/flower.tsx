import type React from 'react'

/** Pressed-flower drawings. A flower has one petal per prompt; answered prompts are coloured in. */

const PALETTE = ['#d98f9f', '#e0a96d', '#a99ad6', '#c97a8d', '#7fb2c9', '#d8b65a', '#8fbf9a']

/** A stable colour per date, so a day keeps its flower colour everywhere. */
export function flowerColor(dateKey: string): string {
  let h = 0
  for (const ch of dateKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function petalPath(n: number): string {
  const w = Math.min(11.5, ((2 * Math.PI * 10) / n) * 0.62)
  return `M0 -1 C${-w} -3 ${-w * 0.95} -17 0 -18.5 C${w * 0.95} -17 ${w} -3 0 -1Z`
}

type FlowerProps = { petals: number; filled: number; color: string; stem?: boolean; className?: string }

/** The flower as an SVG group centred on 0,0 (radius about 19), for use inside another SVG. */
export function FlowerG({ petals, filled, color, stem = false, className }: FlowerProps) {
  const n = Math.max(1, petals)
  const d = petalPath(n)
  return (
    <g className={className}>
      {stem && (
        <>
          <path d="M0 3 Q3 14 -1 26" stroke="#7d9a72" strokeWidth="1.3" fill="none" />
          <path d="M1 15 q8 -6 12 -2 q-5 6 -12 2z" fill="#a9c39b" fillOpacity=".7" stroke="#6f8c64" strokeWidth=".8" />
          <path d="M0 20 q-8 -5 -11 -1 q5 5 11 1z" fill="#a9c39b" fillOpacity=".6" stroke="#6f8c64" strokeWidth=".8" />
        </>
      )}
      {Array.from({ length: n }, (_, i) => {
        const on = i < filled
        return (
          <g key={i} transform={`rotate(${(360 * i) / n})`}>
            {/* a petal unfolds from the centre when it is coloured in (see .petal in index.css) */}
            <g className={on ? 'petal on' : 'petal'} style={{ '--i': i } as React.CSSProperties}>
              <path
                d={d}
                fill={on ? color : 'none'}
                fillOpacity={0.55}
                stroke={on ? shade(color, 0.68) : '#c9bca7'}
                strokeWidth={1.1}
                strokeDasharray={on ? undefined : '2 1.6'}
              />
              {on && <path d="M0 -4 L0 -13" stroke={shade(color, 0.6)} strokeWidth={0.6} opacity={0.6} />}
            </g>
          </g>
        )
      })}
      <circle className="flower-heart" r={3.4} fill="#e3bd62" stroke="#b08a3a" strokeWidth={0.8} />
    </g>
  )
}

export function Flower({ size, rotate = 0, svgClass, ...props }: FlowerProps & { size: number; rotate?: number; svgClass?: string }) {
  const h = props.stem ? size * 1.25 : size
  return (
    <svg className={svgClass} width={size} height={h} viewBox={`-21 -21 42 ${props.stem ? 52 : 42}`} aria-hidden="true" overflow="visible">
      <g transform={`rotate(${rotate})`}>
        <FlowerG {...props} />
      </g>
    </svg>
  )
}

/** A sprig of two leaves: a quiet day with no entry. */
export function LeafG() {
  return (
    <g>
      <path d="M0 0 q7 -6 13 -1 q-6 6 -13 1z" fill="#a9c39b" fillOpacity=".75" stroke="#6f8c64" strokeWidth=".7" />
      <path d="M0 0 q-6 -7 -12 -3 q5 6 12 3z" fill="#bcd2ae" fillOpacity=".7" stroke="#6f8c64" strokeWidth=".7" />
    </g>
  )
}

/** Petals and how many are answered, for a stored entry or for an empty day with the current prompts. */
export function petalsFor(items: { answer: string }[] | undefined, fallbackCount: number) {
  if (!items) return { petals: fallbackCount, filled: 0 }
  return { petals: items.length, filled: items.filter((i) => i.answer.trim()).length }
}
