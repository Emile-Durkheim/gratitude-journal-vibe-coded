import { dateLocale } from './dates'
import { useReminder } from './reminderClient'
import { useT } from './useLang'

/** The daily reminder: off until someone turns it on, which is the only time it asks for permission. */
export default function ReminderCard() {
  const t = useT()
  const { reminder, support, permission, background, setEnabled, setTime } = useReminder()
  if (!reminder) return null
  const on = reminder.enabled && permission === 'granted'
  const time = new Date(`2000-01-01T${reminder.time}`).toLocaleTimeString(dateLocale(), { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="card-title text-xl font-normal italic">{t.reminderTitle}</h2>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            aria-label={t.reminderToggle}
            checked={on}
            disabled={support !== 'ok' || permission === 'denied'}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </div>
        <p className="text-sm text-base-content/70">
          {t.reminderBody}
        </p>
        {on && (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t.remindMeAt}</span>
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
            {t.reminderIos}
          </p>
        )}
        {support === 'unsupported' && <p className="text-xs text-base-content/60">{t.reminderUnsupported}</p>}
        {permission === 'denied' && (
          <p className="text-xs text-base-content/60">
            {t.reminderDenied}
          </p>
        )}
        {on && background === true && (
          <p className="text-xs text-base-content/60">
            {t.reminderBackground(time)}
          </p>
        )}
        {on && background !== true && (
          <p className="text-xs text-base-content/60">
            {t.reminderForeground(time)}
          </p>
        )}
      </div>
    </div>
  )
}
