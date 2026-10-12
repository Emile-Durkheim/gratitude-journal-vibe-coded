import { motion } from 'framer-motion'

/**
 * Pressed-flower drawings. A flower has one petal per prompt; answered prompts are coloured in.
 * Each date grows its own kind of flower (colour, petal shape, centre, sometimes a second ring of
 * petals), chosen from the date so a day looks the same everywhere it appears.
 */

const PALETTE = ['#d98f9f', '#e0a96d', '#a99ad6', '#c97a8d', '#7fb2c9', '#d8b65a', '#8fbf9a']

/** FNV-1a over the date plus a salt, so each trait varies independently of the others. */
function hash(dateKey: string, salt: string): number {
  let h = 0x811c9dc5
  for (const ch of salt + dateKey) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  return h
}

/** A stable colour per date, so a day keeps its flower colour everywhere. */
export function flowerColor(dateKey: string): string {
  return PALETTE[hash(dateKey, 'colour') % PALETTE.length]
}

export type PetalShape = 'round' | 'pointed' | 'heart' | 'slim'
export type FlowerKind = {
  shape: PetalShape
  centre: 'plain' | 'dotted' | 'stamens'
  /** A smaller second ring of petals between the first. */
  double: boolean
  /** Petal length, 0.88 to 1.04. */
  length: number
  /** Turn of the whole flower in degrees, so petals don't all point straight up. */
  twist: number
}

const SHAPES: PetalShape[] = ['round', 'pointed', 'heart', 'slim']
const CENTRES: FlowerKind['centre'][] = ['plain', 'dotted', 'stamens']

export function flowerKind(dateKey: string): FlowerKind {
  return {
    shape: SHAPES[hash(dateKey, 'shape') % SHAPES.length],
    centre: CENTRES[hash(dateKey, 'centre') % CENTRES.length],
    double: hash(dateKey, 'double') % 3 === 0,
    length: 0.88 + (hash(dateKey, 'length') % 17) / 100,
    twist: hash(dateKey, 'twist') % 40 - 20,
  }
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function petalPath(n: number, shape: PetalShape, scale: number): string {
  const L = 18.5 * scale
  let w = Math.min(11.5, ((2 * Math.PI * 10) / n) * 0.62) * scale
  switch (shape) {
    case 'pointed':
      return `M0 -1 C${-w} -3 ${-w * 0.8} ${-L * 0.7} 0 ${-L} C${w * 0.8} ${-L * 0.7} ${w} -3 0 -1Z`
    case 'heart': {
      const t = -L + 2.6
      return `M0 -1 C${-w} -3 ${-w * 1.05} ${-L + 1} ${-w * 0.45} ${-L} Q0 ${-L - 0.4} 0 ${t} Q0 ${-L - 0.4} ${w * 0.45} ${-L} C${w * 1.05} ${-L + 1} ${w} -3 0 -1Z`
    }
    case 'slim':
      w *= 0.62
      return `M0 -1 C${-w} -4 ${-w} ${-L * 0.9} 0 ${-L * 1.04} C${w} ${-L * 0.9} ${w} -4 0 -1Z`
    default:
      return `M0 -1 C${-w} -3 ${-w * 0.95} ${-L * 0.92} 0 ${-L} C${w * 0.95} ${-L * 0.92} ${w} -3 0 -1Z`
  }
}

type FlowerProps = {
  petals: number
  filled: number
  /** The day this flower belongs to; it decides colour and kind. */
  day: string
  stem?: boolean
  /** Seconds before the first coloured petal opens, to stagger flowers on the wreath. */
  delay?: number
}

const springOpen = { type: 'spring', stiffness: 220, damping: 13, mass: 0.8 } as const

/** The flower as an SVG group centred on 0,0 (radius about 19), for use inside another SVG. */
export function FlowerG({ petals, filled, day, stem = false, delay = 0 }: FlowerProps) {
  const n = Math.max(1, petals)
  const kind = flowerKind(day)
  const color = flowerColor(day)
  const d = petalPath(n, kind.shape, kind.length)
  const inner = kind.double ? petalPath(n, kind.shape, kind.length * 0.62) : null
  return (
    <g>
      {stem && (
        <>
          <path d="M0 3 Q3 14 -1 26" stroke="#7d9a72" strokeWidth="1.3" fill="none" />
          <path d="M1 15 q8 -6 12 -2 q-5 6 -12 2z" fill="#a9c39b" fillOpacity=".7" stroke="#6f8c64" strokeWidth=".8" />
          <path d="M0 20 q-8 -5 -11 -1 q5 5 11 1z" fill="#a9c39b" fillOpacity=".6" stroke="#6f8c64" strokeWidth=".8" />
        </>
      )}
      <g transform={`rotate(${kind.twist})`}>
        {Array.from({ length: n }, (_, i) => {
          const on = i < filled
          return (
            <g key={i} transform={`rotate(${(360 * i) / n})`}>
              {on ? (
                // a petal springs open from the centre when it is coloured in
                <motion.g
                  key="on"
                  className="petal"
                  initial={{ scale: 0, rotate: -35 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...springOpen, delay: delay + i * 0.07 }}
                  style={{ originX: 0.5, originY: 1 }}
                >
                  <path d={d} fill={color} fillOpacity={0.55} stroke={shade(color, 0.68)} strokeWidth={1.1} />
                  {kind.shape === 'slim' ? (
                    <path d="M0 -4 L0 -15" stroke={shade(color, 0.6)} strokeWidth={0.5} opacity={0.6} />
                  ) : (
                    <path
                      d="M0 -4 L0 -13 M0 -6 L-2.6 -11.5 M0 -6 L2.6 -11.5"
                      stroke={shade(color, 0.6)}
                      strokeWidth={0.5}
                      opacity={0.55}
                      fill="none"
                    />
                  )}
                  {inner && (
                    <path
                      d={inner}
                      transform={`rotate(${180 / n})`}
                      fill={shade(color, 1.12)}
                      fillOpacity={0.7}
                      stroke={shade(color, 0.75)}
                      strokeWidth={0.7}
                    />
                  )}
                </motion.g>
              ) : (
                <path key="off" d={d} fill="none" stroke="#c9bca7" strokeWidth={1.1} strokeDasharray="2 1.6" />
              )}
            </g>
          )
        })}
        <Centre kind={kind.centre} filled={filled > 0} />
      </g>
    </g>
  )
}

function Centre({ kind, filled }: { kind: FlowerKind['centre']; filled: boolean }) {
  if (kind === 'stamens' && filled)
    return (
      <g className="flower-heart-group">
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2
          const x = Math.cos(a) * 5.2
          const y = Math.sin(a) * 5.2
          return (
            <g key={i}>
              <path d={`M0 0 L${x} ${y}`} stroke="#b08a3a" strokeWidth={0.6} />
              <circle cx={x} cy={y} r={0.9} fill="#c99a3e" />
            </g>
          )
        })}
        <circle className="flower-heart" r={2.6} fill="#e3bd62" stroke="#b08a3a" strokeWidth={0.7} />
      </g>
    )
  return (
    <g>
      <circle className="flower-heart" r={3.4} fill="#e3bd62" stroke="#b08a3a" strokeWidth={0.8} />
      {kind === 'dotted' &&
        filled &&
        Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2
          return <circle key={i} cx={Math.cos(a) * 1.7} cy={Math.sin(a) * 1.7} r={0.55} fill="#9a7428" />
        })}
    </g>
  )
}

export function Flower({ size, rotate = 0, ...props }: FlowerProps & { size: number; rotate?: number }) {
  const h = props.stem ? size * 1.25 : size
  return (
    <svg width={size} height={h} viewBox={`-21 -21 42 ${props.stem ? 52 : 42}`} aria-hidden="true" overflow="visible">
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
