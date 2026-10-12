import { useInstall } from './install'

/** Explains, per browser, how to put the journal on the home screen as its own app. */
export default function InstallCard() {
  const state = useInstall()
  if (state.kind === 'installed') return null
  return (
    <div className="install-card card mb-4 rounded-sm border border-rose/40 bg-base-100">
      <div className="card-body gap-2 p-4">
        <h2 className="card-title text-xl font-normal italic">Put it on your home screen</h2>
        <p className="text-sm opacity-80">
          Installed, the journal opens like any other app, works offline, and your browser is less likely to clear its storage.
        </p>
        {state.kind === 'prompt' && (
          <button className="btn btn-primary self-start" onClick={state.install}>
            Install app
          </button>
        )}
        {state.kind === 'ios' && (
          <ol className="list-decimal pl-5 text-sm">
            <li>Open this page in Safari.</li>
            <li>
              Tap the Share button <span aria-hidden="true">(□↑)</span>.
            </li>
            <li>Choose “Add to Home Screen”, then “Add”.</li>
          </ol>
        )}
        {state.kind === 'manual' && (
          <p className="text-sm">
            Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.
          </p>
        )}
      </div>
    </div>
  )
}
