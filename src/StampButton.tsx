import { motion } from 'framer-motion'

type Props = {
  filled: number
  total: number
  stamped: boolean
  onStamp: () => void
}

const R = 44
const CIRC = 2 * Math.PI * R

/**
 * The stamp at the foot of a day. Its ring fills in slowly as prompts are answered; pressing it
 * stamps the day as pressed. Answers are saved as you type either way: this is the moment of
 * saying "done".
 */
export default function StampButton({ filled, total, stamped, onStamp }: Props) {
  const progress = stamped ? 1 : total ? filled / total : 0
  const ready = filled > 0 && !stamped
  const full = filled === total && !stamped
  const label = stamped ? 'Pressed' : filled === 0 ? 'Write to press' : full ? 'Press this day' : 'Press it as it is'
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        className={`stamp ${full ? 'invite' : ''} ${stamped ? 'stamped' : ''}`}
        disabled={!ready}
        onClick={onStamp}
        whileTap={ready ? { scale: 0.86 } : undefined}
        aria-label={stamped ? 'This day is pressed' : `Press this day (${filled} of ${total} answered)`}
        aria-pressed={stamped}
      >
        <svg viewBox="-50 -50 100 100" width="104" height="104" aria-hidden="true">
          <circle r={R} className="stamp-track" />
          <circle
            r={R}
            className="stamp-ring"
            transform="rotate(-90)"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
          />
          {stamped ? (
            // the inked seal lands like a rubber stamp
            <motion.g
              initial={{ scale: 1.7, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 18, mass: 0.7 }}
            >
              <circle r={36} className="seal" />
              <circle r={31} className="seal-inner" />
              <SealFlower />
            </motion.g>
          ) : (
            <g className="stamp-idle">
              <SealFlower />
            </g>
          )}
        </svg>
      </motion.button>
      <span className={`text-sm uppercase tracking-[0.2em] ${stamped ? 'text-rose' : ready ? '' : 'opacity-50'}`}>{label}</span>
    </div>
  )
}

function SealFlower() {
  return (
    <g className="seal-flower">
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d="M0 -2 C-7 -5 -6 -18 0 -19 C6 -18 7 -5 0 -2Z" transform={`rotate(${i * 72})`} />
      ))}
      <circle r={3.5} />
    </g>
  )
}
