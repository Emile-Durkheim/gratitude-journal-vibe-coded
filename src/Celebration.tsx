import { useEffect, useRef } from 'react'

/**
 * Petals tumbling down over the page, shown once every prompt of a day is answered. Three.js is
 * loaded only at that moment, so it costs nothing until a day is finished. Hidden with reduced motion.
 */
export default function Celebration({ color, onDone }: { color: string; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done.current()
    let stop: (() => void) | undefined
    let cancelled = false
    import('./petalStorm')
      .then(({ startPetalStorm }) => {
        if (cancelled || !ref.current) return
        stop = startPetalStorm(ref.current, color, () => done.current())
      })
      .catch(() => done.current())
    return () => {
      cancelled = true
      stop?.()
    }
  }, [color])
  return <canvas ref={ref} className="petal-shower" aria-hidden="true" />
}
