// One shared wind for every flower on the page. Each flower gets its own idle rhythm (two slow waves that never
// line up), and every few seconds a breeze rolls across the screen from left to right: flowers lean into it one
// after another, overshoot a touch and settle back on their stems, like a spring.
// It writes the CSS `rotate`/`scale` properties, so it composes with any `transform` animation on the same element.

const SELECTOR = '.sway, .sway-svg'
const BREEZE_SPEED = 700 // px per second the breeze travels across the screen
const RESCAN_MS = 400 // how often new flowers and positions are picked up

interface Swayer {
  /** Idle wave periods (s) and phases. */
  p1: number
  p2: number
  f1: number
  f2: number
  /** Degrees of idle sway; the open day's big flower moves less than the small ones. */
  amp: number
  /** Spring: angular frequency and damping ratio. Small flowers are springier. */
  w: number
  zeta: number
  angle: number
  vel: number
  x: number
}

interface Gust {
  start: number // seconds
  strength: number // degrees of lean at full force
  length: number // seconds the gust pushes on one flower
}

const swayers = new Map<HTMLElement | SVGElement, Swayer>()

function makeSwayer(el: Element): Swayer {
  const big = !el.classList.contains('small') && !el.classList.contains('sway-svg')
  const r = Math.random
  return {
    p1: 4.6 + r() * 2.4,
    p2: 2.4 + r() * 1.2,
    f1: r() * Math.PI * 2,
    f2: r() * Math.PI * 2,
    amp: (big ? 2.2 : 3.6) * (0.8 + r() * 0.4),
    w: (big ? 3.2 : 4.2) + r() * 0.8,
    zeta: 0.32 + r() * 0.1,
    angle: 0,
    vel: 0,
    x: 0,
  }
}

function rescan() {
  const seen = new Set<Element>()
  for (const el of document.querySelectorAll<HTMLElement | SVGElement>(SELECTOR)) {
    seen.add(el)
    let s = swayers.get(el)
    if (!s) swayers.set(el, (s = makeSwayer(el)))
    const box = el.getBoundingClientRect()
    s.x = box.left + box.width / 2
  }
  for (const el of swayers.keys()) if (!seen.has(el)) swayers.delete(el)
}

/** Force of the gust (0..1) on a flower at screen position x: a quick push, then a long easing off. */
function gustForce(g: Gust, t: number, x: number): number {
  const local = t - g.start - Math.max(0, x) / BREEZE_SPEED
  if (local < 0 || local > g.length) return 0
  const u = local / g.length
  return Math.sin(u * Math.PI) ** 2 * Math.exp(-u * 1.6)
}

let gusts: Gust[] = []
let nextGust = 2

function scheduleGusts(t: number) {
  if (t >= nextGust) {
    gusts.push({ start: t, strength: 4 + Math.random() * 5, length: 2.2 + Math.random() * 1.2 })
    // now and then a second, smaller gust follows close behind, as real wind does
    if (Math.random() < 0.3) gusts.push({ start: t + 0.9 + Math.random() * 0.6, strength: 2 + Math.random() * 2, length: 1.8 })
    nextGust = t + 6 + Math.random() * 6
  }
  const travel = (window.innerWidth + 200) / BREEZE_SPEED
  gusts = gusts.filter((g) => t - g.start < g.length + travel)
}

export function startWind() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  let frame = 0
  let scanTimer = 0
  let last = 0

  const tick = (now: number) => {
    const t = now / 1000
    const dt = Math.min(0.05, last ? t - last : 0.016) // after a hidden tab, don't let the spring explode
    last = t
    scheduleGusts(t)
    for (const [el, s] of swayers) {
      const idle = s.amp * (Math.sin((t * 2 * Math.PI) / s.p1 + s.f1) * 0.75 + Math.sin((t * 2 * Math.PI) / s.p2 + s.f2) * 0.25)
      let push = 0
      for (const g of gusts) push += g.strength * gustForce(g, t, s.x)
      // the stem is a damped spring pulled toward where the idle rhythm and the wind want it
      const target = idle + push
      const acc = s.w * s.w * (target - s.angle) - 2 * s.zeta * s.w * s.vel
      s.vel += acc * dt
      s.angle += s.vel * dt
      el.style.rotate = `${s.angle.toFixed(2)}deg`
      // the head flattens a little as it bows into the breeze
      el.style.scale = push > 0.05 ? `1 ${(1 - Math.min(push, 9) * 0.004).toFixed(3)}` : ''
    }
    frame = requestAnimationFrame(tick)
  }

  const start = () => {
    if (frame || reduce.matches) return
    rescan()
    scanTimer = window.setInterval(rescan, RESCAN_MS)
    last = 0
    frame = requestAnimationFrame(tick)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    clearInterval(scanTimer)
    frame = 0
    for (const el of swayers.keys()) {
      el.style.rotate = ''
      el.style.scale = ''
    }
    swayers.clear()
  }

  reduce.addEventListener('change', () => (reduce.matches ? stop() : start()))
  start()
}
