import type React from 'react'

const PETAL = 'M0 -1 C-7 -3 -6.6 -17 0 -18.5 C6.6 -17 7 -3 0 -1Z'
const TINTS = ['#d98f9f', '#e0a96d', '#a99ad6', '#c97a8d', '#e3bd62']

/** A fixed scatter (0..1) per petal and property, so renders stay pure and the fall looks random. */
const scatter = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Petals drifting down over the page, shown once every prompt of a day is answered. Hidden with reduced motion. */
export default function Celebration({ color }: { color: string }) {
  const petals = Array.from({ length: 26 }, (_, i) => ({
    left: scatter(i, 1) * 100,
    size: 10 + scatter(i, 2) * 12,
    delay: scatter(i, 3) * 900,
    duration: 2600 + scatter(i, 4) * 1800,
    drift: (scatter(i, 5) - 0.5) * 120,
    spin: (scatter(i, 6) - 0.5) * 720,
    tint: i % 3 === 0 ? TINTS[i % TINTS.length] : color,
  }))
  return (
    <div className="petal-shower" aria-hidden="true">
      {petals.map((p, i) => (
        <svg
          key={i}
          viewBox="-8 -20 16 21"
          width={p.size}
          height={p.size * 1.3}
          style={
            {
              left: `${p.left}%`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          <path d={PETAL} fill={p.tint} fillOpacity={0.7} stroke={p.tint} strokeWidth={0.8} />
        </svg>
      ))}
    </div>
  )
}
