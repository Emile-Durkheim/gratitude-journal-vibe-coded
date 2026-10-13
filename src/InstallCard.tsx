import { useInstall } from './install'
import { useT } from './useLang'

/** Explains, per browser, how to put the journal on the home screen as its own app. */
export default function InstallCard() {
  const state = useInstall()
  const t = useT()
  if (state.kind === 'installed') return null
  return (
    <div className="install-card card mb-4 rounded-sm border border-rose/40 bg-base-100">
      <div className="card-body gap-2 p-4">
        <h2 className="card-title text-xl font-normal italic">{t.installTitle}</h2>
        <p className="text-sm opacity-80">
          {t.installBody}
        </p>
        {state.kind === 'prompt' && (
          <button className="btn btn-primary self-start" onClick={state.install}>
            {t.installButton}
          </button>
        )}
        {state.kind === 'ios' && (
          <ol className="list-decimal pl-5 text-sm">
            <li>{t.iosStep1}</li>
            <li>
              {t.iosStep2} <span aria-hidden="true">(□↑)</span>.
            </li>
            <li>{t.iosStep3}</li>
          </ol>
        )}
        {state.kind === 'manual' && (
          <p className="text-sm">
            {t.manualInstall}
          </p>
        )}
      </div>
    </div>
  )
}
