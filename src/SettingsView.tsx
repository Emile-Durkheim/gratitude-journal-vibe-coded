import { useRef, useState } from 'react'
import { todayKey } from './dates'
import InstallCard from './InstallCard'
import PromptSection from './PromptSection'
import ReminderCard from './ReminderCard'
import TopBar, { BackLink } from './TopBar'
import { LANGS, deviceLang } from './i18n'
import { defaultPrompts, defaultWeeklyPrompts, promptLibrary, weeklyPromptLibrary } from './prompts'
import { useLang } from './useLang'
import { parseExport, toExport, type Entries, type ExportFile, type PersistState, type Settings } from './storage'

type Props = {
  entries: Entries
  weeks: Entries
  settings: Settings
  persist: PersistState | null
  onSettingsChange: (patch: Partial<Settings>) => void
  onImport: (file: ExportFile) => void
  onBeforeExport: () => void
  onRetryPersist: () => void
}

const DAY_MS = 24 * 60 * 60 * 1000

export default function SettingsView(props: Props) {
  const { entries, weeks, settings, persist, onSettingsChange, onImport, onBeforeExport, onRetryPersist } = props
  const { t, lang, choice, setChoice } = useLang()
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const exportData = () => {
    onBeforeExport()
    const now = Date.now()
    const file = toExport(entries, { ...settings, lastExportAt: now }, weeks)
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `gratitude-journal-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    onSettingsChange({ lastExportAt: now })
  }

  const importData = async (file: File) => {
    try {
      let data: ExportFile
      try {
        data = parseExport(await file.text(), lang)
      } catch {
        throw new Error(t.notABackup)
      }
      onImport(data)
      const n = Object.keys(data.entries).length
      const w = Object.keys(data.weeks).length
      setMessage(t.imported(n, w))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t.importFailed)
    }
  }

  const total = Object.keys(entries).length
  const totalWeeks = Object.keys(weeks).length
  const lastExport = settings.lastExportAt
    ? Math.floor((Date.now() - settings.lastExportAt) / DAY_MS)
    : null

  return (
    <section>
      <TopBar title={t.settings} start={<BackLink href="#/" label={t.backToWreath} />} />

      <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
        <div className="card-body gap-2 p-4">
          <h2 className="card-title text-xl font-normal italic">{t.language}</h2>
          <p className="text-sm text-base-content/70">{t.languageIntro}</p>
          <div className="language-choice join mt-1 self-start" role="radiogroup" aria-label={t.language}>
            {[null, ...LANGS].map((option) => (
              <button
                key={option ?? 'device'}
                type="button"
                role="radio"
                aria-checked={choice === option}
                className={`btn join-item btn-sm ${choice === option ? 'btn-primary' : 'btn-outline btn-primary'}`}
                onClick={() => setChoice(option)}
              >
                {option ? t.langNames[option] : t.languageAuto(t.langNames[deviceLang()])}
              </button>
            ))}
          </div>
        </div>
      </div>

      <InstallCard />

      <ReminderCard />

      <PromptSection
        title={t.dailyPromptsTitle}
        intro={t.dailyPromptsIntro}
        libraryTitle={t.dailyLibraryTitle}
        prompts={settings.prompts}
        custom={settings.customPrompts}
        library={promptLibrary(lang)}
        defaults={defaultPrompts(lang)}
        onChange={({ prompts, custom }) =>
          onSettingsChange({ ...(prompts && { prompts }), ...(custom && { customPrompts: custom }) })
        }
      />

      <PromptSection
        title={t.weeklyPromptsTitle}
        intro={t.weeklyPromptsIntro}
        libraryTitle={t.weeklyLibraryTitle}
        prompts={settings.weeklyPrompts}
        custom={settings.customWeeklyPrompts}
        library={weeklyPromptLibrary(lang)}
        defaults={defaultWeeklyPrompts(lang)}
        onChange={({ prompts, custom }) =>
          onSettingsChange({ ...(prompts && { weeklyPrompts: prompts }), ...(custom && { customWeeklyPrompts: custom }) })
        }
      />

      <div className="card mb-4 rounded-sm border border-base-300 bg-base-100">
        <div className="card-body gap-3 p-4">
          <h2 className="card-title text-xl font-normal italic">{t.safeTitle}</h2>
          <p className="text-sm text-base-content/70">
            {t.livesHere(total, totalWeeks)} {persist === 'persisted' && t.persisted}
            {persist === 'not-persisted' && t.notPersisted}
            {persist === 'unsupported' && t.persistUnsupported} {t.stillDeleted}
          </p>
          {persist === 'not-persisted' && (
            <button className="btn btn-ghost btn-sm self-start" onClick={onRetryPersist}>
              {t.askAgain}
            </button>
          )}
          <p className="text-sm font-bold">
            {lastExport === null ? t.noBackup : t.lastBackup(lastExport)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-primary" onClick={exportData}>
              {t.exportBackup}
            </button>
            <button className="btn btn-outline btn-primary" onClick={() => fileInput.current?.click()}>
              {t.import}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importData(file)
                e.target.value = ''
              }}
            />
          </div>
          <p className="text-xs text-base-content/60">{t.importNote}</p>
        </div>
      </div>

      {message && (
        <div role="status" className="alert alert-success mb-4 text-sm">
          {message}
        </div>
      )}
    </section>
  )
}
