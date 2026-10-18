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

export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function petalPath(n: number, shape: PetalShape, scale: number): string {
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

/**
 * Petals and how many are answered, for a stored entry or for an empty day with the current prompts.
 * A stamped day grows only the petals that were answered, so a skipped prompt leaves no empty petal.
 */
export function petalsFor(items: { answer: string }[] | undefined, fallbackCount: number, stamped = false) {
  if (!items) return { petals: fallbackCount, filled: 0 }
  const filled = items.filter((i) => i.answer.trim()).length
  return stamped && filled > 0 ? { petals: filled, filled } : { petals: items.length, filled }
}
