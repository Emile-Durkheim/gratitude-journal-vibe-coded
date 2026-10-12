import { useReminder } from './reminderClient'

/** The daily reminder: off until someone turns it on, which is the only time it asks for permission. */
export default function ReminderCard() {
  const { reminder, support, permission, background, setEnabled, setTime } = useReminder()
  if (!reminder) return null
  const on = reminder.enabled && permission === 'granted'
  const time = new Date(`2000-01-01T${reminder.time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="card-title text-xl font-normal italic">A gentle reminder</h2>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            aria-label="Daily reminder"
            checked={on}
            disabled={support !== 'ok' || permission === 'denied'}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </div>
        <p className="text-sm text-base-content/70">
          One quiet notification a day, only on days you haven't written yet.
        </p>
        {on && (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Remind me at</span>
            <input
              type="time"
              className="input input-sm w-32 font-serif"
              value={reminder.time}
              onChange={(e) => e.target.value && setTime(e.target.value)}
            />
          </label>
        )}
        {support === 'ios-install-first' && (
          <p className="text-xs text-base-content/60">
            On iPhone, add the journal to your home screen first. Safari only lets installed apps send notifications.
          </p>
        )}
        {support === 'unsupported' && <p className="text-xs text-base-content/60">This browser can't show notifications.</p>}
        {permission === 'denied' && (
          <p className="text-xs text-base-content/60">
            Notifications are blocked for the journal. Allow them in your phone's settings for this app, then come back.
          </p>
        )}
        {on && background === true && (
          <p className="text-xs text-base-content/60">
            Around {time}. Your phone picks the exact moment, so it can arrive a little late.
          </p>
        )}
        {on && background !== true && (
          <p className="text-xs text-base-content/60">
            At {time}, as long as the journal is still open in the background. If you swipe it away, today's reminder can't
            reach you.
          </p>
        )}
      </div>
    </div>
  )
}
