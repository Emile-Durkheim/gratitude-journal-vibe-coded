/**
 * The app speaks English and German. With no choice made it follows the device's languages,
 * taking the first of them it knows and falling back to English.
 */
export type Lang = 'en' | 'de'
export const LANGS: Lang[] = ['en', 'de']

export function deviceLang(languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]): Lang {
  for (const l of languages) {
    const base = l.slice(0, 2).toLowerCase()
    if (base === 'de' || base === 'en') return base
  }
  return 'en'
}

export function isLang(x: unknown): x is Lang {
  return x === 'en' || x === 'de'
}

/** The locale for dates and times: the device's own variant when it speaks the same language. */
export function localeFor(lang: Lang): string {
  const device = typeof navigator === 'undefined' ? '' : navigator.language ?? ''
  return device.toLowerCase().startsWith(lang) ? device : lang === 'de' ? 'de-DE' : 'en-GB'
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const en = {
  appTitle: 'The Flower Press',
  docTitle: 'Gratitude Journal',
  quoted: (text: string) => `“${text}”`,
  calendarView: 'Calendar view',
  wreathView: 'Wreath view',
  settings: 'Settings',
  backToWreath: 'Back to the wreath',

  // wreath
  thisWeek: 'This week',
  weekOf: 'Week of',
  weekLabel: (range: string) => `Week of ${range}`,
  slotPressed: 'pressed',
  slotNotYet: 'not yet',
  slotQuiet: 'quiet day',
  reviewWritten: 'Weekly review written',
  earlier: '‹ Earlier',
  later: 'Later ›',
  openToday: "Open today's page",
  pressToday: "Press today's flower",
  sundayReview: "It's Sunday: review your week",
  readReview: 'Read the weekly review',
  reviewThisWeek: 'Review this week',
  installApp: 'Install as an app',
  addToHome: 'Add the journal to your home screen',

  // calendar
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  nothingPressed: 'Nothing pressed this month',
  flowersPressed: (n: number) => `${plural(n, 'flower', 'flowers')} pressed`,
  today: 'Today',
  hasEntry: 'has entry',
  reviewWrittenShort: 'weekly review written',

  // day
  aPressedDay: 'A pressed day',
  thisWeekNav: 'This week',
  notYetHappened: "This day hasn't happened yet.",
  changePrompts: 'Change prompts',
  weeklyReview: 'Weekly review',
  reviewCardWritten: 'Written. Tap to read or edit.',
  reviewCardInvite: 'Sunday is a good day to look back on the week.',
  previousDay: '‹ Previous day',
  nextDay: 'Next day ›',
  writeHere: 'write here…',

  // stamp
  stampPressed: 'Pressed',
  stampWrite: 'Write to press',
  stampFull: 'Press this day',
  stampPartial: 'Press it as it is',
  stampDoneLabel: 'This day is pressed. Press again to reopen it',
  stampLabel: (filled: number, total: number) => `Press this day (${filled} of ${total} answered)`,

  // week review
  notStarted: "This week hasn't started yet.",
  lookBack: (n: number) => `Look back: ${n} of 7 days written`,
  noDailyEntries: 'No daily entries this week.',
  changeWeeklyPrompts: 'Change weekly prompts',
  previousWeek: '‹ Previous week',
  nextWeek: 'Next week ›',

  // settings
  language: 'Language',
  languageIntro: 'Follows your device unless you pick one. Days you have already written keep their words.',
  languageAuto: (name: string) => `Device (${name})`,
  langNames: { en: 'English', de: 'Deutsch' } as Record<Lang, string>,
  dailyPromptsTitle: 'Your daily prompts',
  dailyPromptsIntro: "New days use these, in this order. Days you've already written keep their prompts.",
  dailyLibraryTitle: 'Choose daily prompts',
  weeklyPromptsTitle: 'Your weekly review prompts',
  weeklyPromptsIntro: 'Shown in the weekly review, which you can open from the calendar or from any Sunday.',
  weeklyLibraryTitle: 'Choose weekly review prompts',
  libraryIntro: 'Tap to add or remove. Each one notes the research behind it.',
  yourOwn: 'Your own',
  writeYourOwn: 'Write your own prompt',
  add: 'Add',
  dragPrompt: (p: string) => `Move "${p}": drag, or use the arrow keys`,
  addPrompts: 'Add or change prompts',
  addWeeklyPrompts: 'Add or change weekly prompts',
  removePrompt: (p: string) => `Remove "${p}"`,
  deletePrompt: (p: string) => `Delete "${p}"`,
  safeTitle: 'Keeping your journal safe',
  livesHere: (days: number, weeks: number) =>
    `Your journal lives only on this device (${plural(days, 'day', 'days')}, ${plural(weeks, 'weekly review', 'weekly reviews')}).`,
  persisted: 'The browser has agreed not to clear it to free up space.',
  notPersisted: "The browser hasn't yet agreed to keep it permanently. Installing the app to your home screen usually fixes this.",
  persistUnsupported: "This browser can't promise to keep it permanently.",
  stillDeleted: "It's still deleted if you clear this site's data or uninstall the app, so export a backup now and then.",
  askAgain: 'Ask again',
  noBackup: 'No backup yet.',
  lastBackup: (days: number) => `Last backup: ${days === 0 ? 'today' : `${plural(days, 'day', 'days')} ago`}.`,
  exportBackup: 'Export backup',
  import: 'Import',
  importNote: "Importing merges days (newer edits win) and uses the backup's prompts.",
  imported: (days: number, weeks: number) =>
    `Imported ${plural(days, 'day', 'days')} and ${plural(weeks, 'weekly review', 'weekly reviews')}.`,
  importFailed: 'Import failed.',
  notABackup: 'Not a Gratitude Journal backup file.',

  // install
  installTitle: 'Put it on your home screen',
  installBody: 'Installed, the journal opens like any other app, works offline, and your browser is less likely to clear its storage.',
  installButton: 'Install app',
  riskTitle: "Your journal isn't safe yet",
  riskBody:
    'Until the journal is installed, your browser can delete your entries without asking: when space runs low, and in Safari after seven days without a visit. Install it to keep them.',
  riskHow: 'How to install',
  iosStep1: 'Open this page in Safari.',
  iosStep2: 'Tap the Share button',
  iosStep3: 'Choose “Add to Home Screen”, then “Add”.',
  manualInstall: 'Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.',

  // reminder
  reminderTitle: 'A gentle reminder',
  reminderToggle: 'Daily reminder',
  reminderBody: "One quiet notification a day, only on days you haven't written yet.",
  remindMeAt: 'Remind me at',
  reminderIos: 'On iPhone, add the journal to your home screen first. Safari only lets installed apps send notifications.',
  reminderUnsupported: "This browser can't show notifications.",
  reminderDenied: "Notifications are blocked for the journal. Allow them in your phone's settings for this app, then come back.",
  reminderBackground: (time: string) => `Around ${time}. Your phone picks the exact moment, so it can arrive a little late.`,
  reminderForeground: (time: string) =>
    `At ${time}, as long as the journal is still open in the background. If you swipe it away, today's reminder can't reach you.`,
  notificationTitle: 'A moment for gratitude',
  notificationBody: 'A few lines about today, whenever you’re ready.',

  // onboarding
  welcomeKicker: 'Welcome to the Flower Press',
  welcomeTitle: 'A few lines of thanks',
  welcomeLead:
    'Gratitude journaling is a small habit: now and then, write down something good and stay with it for a moment. Psychologists have studied it for twenty years. The effect is real but gentle, a little more contentment and optimism rather than a transformation.',
  welcomeHowTitle: 'What helps most',
  welcomeHow: [
    { title: 'Say why.', body: 'Not just what went well, but why it happened.', source: 'Seligman et al., 2005' },
    { title: 'Think of people.', body: 'Someone who made your day better counts for more than something you own.', source: 'Emmons; Algoe, 2012' },
    { title: 'Go deep.', body: 'One thing in detail beats a long list.', source: 'Emmons' },
    { title: 'Imagine it gone.', body: 'Picture a good thing never having happened. It lifts the mood more than people expect.', source: 'Koo et al., 2008' },
  ],
  welcomeEasyTitle: 'And go easy on yourself',
  welcomeEasy:
    'In one study, writing once a week did more than writing three times a week. So there are no streaks here: a missed day is simply a quiet day, and you can change your prompts whenever they go stale.',
  welcomePress: 'Each day you write presses a flower, with one petal for every prompt you answer.',
  welcomePrivate: 'Everything stays on this device. No account, no server.',
  welcomeBegin: 'Set up my journal',
  welcomeSkip: 'Skip, use the defaults',
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  obLanguageTitle: 'Which language?',
  obLanguageBody: 'Prompts, dates and quotes follow it. You can change it later in settings.',
  obDailyTitle: 'Your daily prompts',
  obDailyBody: 'Pick the questions for each day. Three is a good start; fewer is fine too.',
  obPetals: (n: number) => (n === 1 ? 'One prompt, one petal' : `${n} prompts, ${n} petals`),
  obWeeklyTitle: 'A weekly look back',
  obWeeklyBody: 'Once a week, often on a Sunday, a slower review of the week and a look ahead. Pick its questions.',
  obOwnLater: 'You can write your own prompts and reorder them in settings at any time.',
  obReminderTitle: 'Would a reminder help?',
  obReminderBody: 'Entirely optional. The journal never nags, and you can turn it on or off in settings.',
  obHomeTitle: 'Keep it close, keep it safe',
  obHomeBody: 'Your journal lives only in this browser. Export a backup from settings now and then, especially before changing phones.',
  obInstalled: 'The journal is already installed on this device.',
  obDoneTitle: 'Your press is ready',
  obDoneBody: "Write a few lines whenever something good happens, then press the day with the stamp at the foot of the page.",
  obToWreath: 'Go to the wreath',
  showIntro: 'Show the introduction again',

  saveError: "Couldn't read or write this device's storage. Export a backup from settings if you can.",
}

export type Strings = typeof en

const de: Strings = {
  appTitle: 'Die Blütenpresse',
  docTitle: 'Dankbarkeitstagebuch',
  quoted: (text) => `„${text}“`,
  calendarView: 'Kalender',
  wreathView: 'Blüten',
  settings: 'Einstellungen',
  backToWreath: 'Zurück zu Blüten',

  thisWeek: 'Diese Woche',
  weekOf: 'Woche vom',
  weekLabel: (range) => `Woche ${range}`,
  slotPressed: 'gepresst',
  slotNotYet: 'noch nicht',
  slotQuiet: 'stiller Tag',
  reviewWritten: 'Wochenrückblick geschrieben',
  earlier: '‹ Früher',
  later: 'Später ›',
  openToday: 'Heutige Seite öffnen',
  pressToday: 'Heutige Blüte pressen',
  sundayReview: 'Es ist Sonntag: Schaue auf deine Woche zurück',
  readReview: 'Wochenrückblick lesen',
  reviewThisWeek: 'Wochenrückblick anfertigen',
  installApp: 'Als App installieren',
  addToHome: 'Das Tagebuch zum Home-Bildschirm hinzufügen',

  previousMonth: 'Voriger Monat',
  nextMonth: 'Nächster Monat',
  nothingPressed: 'Diesen Monat noch keine Blüte gepresset',
  flowersPressed: (n) => `${plural(n, 'Blüte', 'Blüten')} gepresst`,
  today: 'Heute',
  hasEntry: 'mit Eintrag',
  reviewWrittenShort: 'Wochenrückblick geschrieben',

  aPressedDay: 'Ein gepresster Tag',
  thisWeekNav: 'Diese Woche',
  notYetHappened: 'Dieser Tag kommt erst noch.',
  changePrompts: 'Fragen ändern',
  weeklyReview: 'Wochenrückblick',
  reviewCardWritten: 'Geschrieben. Tippen zum Lesen oder Bearbeiten.',
  reviewCardInvite: 'Sonntag ist ein guter Tag, um auf die Woche zurückzublicken.',
  previousDay: '‹ Voriger Tag',
  nextDay: 'Nächster Tag ›',
  writeHere: 'hier schreiben…',

  stampPressed: 'Gepresst',
  stampWrite: 'Erst schreiben',
  stampFull: 'Diesen Tag pressen',
  stampPartial: 'So pressen, wie die Blüte ist',
  stampDoneLabel: 'Dieser Tag ist gepresst. Wenn du nochmal drückst, kannst du ihn wieder ändern.',
  stampLabel: (filled, total) => `Diesen Tag pressen (${filled} von ${total} beantwortet)`,

  notStarted: 'Diese Woche hat noch nicht begonnen.',
  lookBack: (n) => `Rückblick: ${n} von 7 Tagen geschrieben`,
  noDailyEntries: 'Diese Woche keine Tageseinträge.',
  changeWeeklyPrompts: 'Wochenfragen ändern',
  previousWeek: '‹ Vorige Woche',
  nextWeek: 'Nächste Woche ›',

  language: 'Sprache',
  languageIntro: 'Folgt deinem Gerät, solange du keine wählst. Bereits geschriebene Tage behalten ihren Wortlaut.',
  languageAuto: (name) => `Gerät (${name})`,
  langNames: { en: 'English', de: 'Deutsch' },
  dailyPromptsTitle: 'Deine täglichen Fragen',
  dailyPromptsIntro: 'Neue Tage nutzen diese Fragen in dieser Reihenfolge. Bereits geschriebene Tage behalten ihre Fragen.',
  dailyLibraryTitle: 'Tägliche Fragen wählen',
  weeklyPromptsTitle: 'Deine Fragen für den Wochenrückblick',
  weeklyPromptsIntro: 'Erscheinen im Wochenrückblick, den du vom Kalender oder von jedem Sonntag aus öffnen kannst.',
  weeklyLibraryTitle: 'Fragen für den Wochenrückblick wählen',
  libraryIntro: 'Tippen zum Hinzufügen oder Entfernen. Zu jeder Frage steht, welche Forschung dahintersteht.',
  yourOwn: 'Eigene',
  writeYourOwn: 'Eigene Frage schreiben',
  add: 'Hinzufügen',
  dragPrompt: (p) => `„${p}“ verschieben: ziehen oder Pfeiltasten nutzen`,
  addPrompts: 'Fragen hinzufügen oder ändern',
  addWeeklyPrompts: 'Wochenfragen hinzufügen oder ändern',
  removePrompt: (p) => `„${p}“ entfernen`,
  deletePrompt: (p) => `„${p}“ löschen`,
  safeTitle: 'Dein Tagebuch sicher aufbewahren',
  livesHere: (days, weeks) =>
    `Dein Tagebuch liegt nur auf diesem Gerät (${plural(days, 'Tag', 'Tage')}, ${plural(weeks, 'Wochenrückblick', 'Wochenrückblicke')}).`,
  persisted: 'Der Browser hat zugesagt, es nicht zu löschen, um Platz zu schaffen.',
  notPersisted: 'Der Browser hat noch nicht zugesagt, es dauerhaft aufzubewahren. Meist hilft es, die App zum Home-Bildschirm hinzuzufügen.',
  persistUnsupported: 'Dieser Browser kann nicht versprechen, es dauerhaft aufzubewahren.',
  stillDeleted: 'Es wird trotzdem gelöscht, wenn du die Websitedaten löschst oder die App entfernst. Exportiere also ab und zu eine Sicherung.',
  askAgain: 'Erneut fragen',
  noBackup: 'Noch keine Sicherung.',
  lastBackup: (days) => `Letzte Sicherung: ${days === 0 ? 'heute' : `vor ${plural(days, 'Tag', 'Tagen')}`}.`,
  exportBackup: 'Sicherung exportieren',
  import: 'Importieren',
  importNote: 'Beim Import werden Tage zusammengeführt (neuere Änderungen gewinnen) und die Fragen der Sicherung übernommen.',
  imported: (days, weeks) =>
    `${plural(days, 'Tag', 'Tage')} und ${plural(weeks, 'Wochenrückblick', 'Wochenrückblicke')} importiert.`,
  importFailed: 'Import fehlgeschlagen.',
  notABackup: 'Das ist keine Sicherungsdatei des Dankbarkeitstagebuchs.',

  installTitle: 'Aks App installieren',
  installBody: 'Installiert öffnet sich das Tagebuch wie jede andere App, funktioniert offline, und der Browser löscht seinen Speicher seltener.',
  riskTitle: 'Dein Tagebuch ist noch nicht sicher',
  riskBody:
    'Solange das Tagebuch nicht installiert ist, kann der Browser deine Einträge ungefragt löschen: wenn der Speicher knapp wird, und in Safari nach sieben Tagen ohne Besuch. Installiere es, damit sie bleiben.',
  riskHow: 'So installierst du es',
  installButton: 'App installieren',
  iosStep1: 'Öffne diese Seite in Safari.',
  iosStep2: 'Tippe auf „Teilen“',
  iosStep3: 'Wähle „Zum Home-Bildschirm“ und dann „Hinzufügen“.',
  manualInstall: 'Öffne das Browsermenü (⋮) und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',

  reminderTitle: 'Eine leise Erinnerung',
  reminderToggle: 'Tägliche Erinnerung',
  reminderBody: 'Eine leise Mitteilung am Tag, nur an Tagen, an denen du noch nichts geschrieben hast.',
  remindMeAt: 'Erinnere mich um',
  reminderIos: 'Auf dem iPhone lege das Tagebuch zuerst auf den Home-Bildschirm. Safari erlaubt Mitteilungen nur installierten Apps.',
  reminderUnsupported: 'Dieser Browser kann keine Mitteilungen anzeigen.',
  reminderDenied: 'Mitteilungen sind für das Tagebuch blockiert. Erlaube sie in den Einstellungen deines Telefons für diese App und komm dann zurück.',
  reminderBackground: (time) => `Gegen ${time}. Dein Telefon wählt den genauen Moment, es kann also etwas später kommen.`,
  reminderForeground: (time) =>
    `Um ${time}, solange das Tagebuch im Hintergrund geöffnet ist. Wenn du es wegwischst, kann die heutige Erinnerung dich nicht erreichen.`,
  notificationTitle: 'Ein Moment der Dankbarkeit',
  notificationBody: 'Ein paar Zeilen über heute, wann immer du so weit bist.',

  welcomeKicker: 'Willkommen in der Blumenpresse',
  welcomeTitle: 'Ein paar Zeilen Dank',
  welcomeLead:
    'Ein Dankbarkeitstagebuch ist eine kleine Gewohnheit: Ab und zu schreibst du etwas Gutes auf und bleibst einen Moment dabei. Die Psychologie erforscht das seit zwanzig Jahren. Die Wirkung ist echt, aber sanft: etwas mehr Zufriedenheit und Zuversicht, keine Verwandlung.',
  welcomeHowTitle: 'Was am meisten hilft',
  welcomeHow: [
    { title: 'Sag, warum.', body: 'Nicht nur, was gut lief, sondern warum es so kam.', source: 'Seligman et al., 2005' },
    { title: 'Denk an Menschen.', body: 'Jemand, der deinen Tag besser gemacht hat, zählt mehr als etwas, das du besitzt.', source: 'Emmons; Algoe, 2012' },
    { title: 'Geh in die Tiefe.', body: 'Eine Sache im Detail ist besser als eine lange Liste.', source: 'Emmons' },
    { title: 'Stell dir vor, es fehlte.', body: 'Denk dir etwas Gutes weg, als wäre es nie geschehen. Das hebt die Stimmung mehr, als man erwartet.', source: 'Koo et al., 2008' },
  ],
  welcomeEasyTitle: 'Und sei nachsichtig mit dir',
  welcomeEasy:
    'In einer Studie brachte einmal pro Woche mehr als dreimal pro Woche. Deshalb gibt es hier keine Serien: Ein ausgelassener Tag ist einfach ein stiller Tag, und du kannst deine Fragen wechseln, sobald sie sich abnutzen.',
  welcomePress: 'Jeder Tag, an dem du schreibst, presst eine Blume, mit einem Blütenblatt für jede beantwortete Frage.',
  welcomePrivate: 'Alles bleibt auf diesem Gerät. Kein Konto, kein Server.',
  welcomeBegin: 'Mein Tagebuch einrichten',
  welcomeSkip: 'Überspringen, Standard nehmen',
  stepOf: (n, total) => `Schritt ${n} von ${total}`,
  next: 'Weiter',
  back: 'Zurück',
  skip: 'Überspringen',
  obLanguageTitle: 'Welche Sprache?',
  obLanguageBody: 'Fragen, Daten und Zitate richten sich danach. Du kannst sie später in den Einstellungen ändern.',
  obDailyTitle: 'Deine täglichen Fragen',
  obDailyBody: 'Wähle die Fragen für jeden Tag. Drei sind ein guter Anfang, weniger geht auch.',
  obPetals: (n) => (n === 1 ? 'Eine Frage, ein Blütenblatt' : `${n} Fragen, ${n} Blütenblätter`),
  obWeeklyTitle: 'Ein Blick auf die Woche',
  obWeeklyBody: 'Einmal pro Woche, gern am Sonntag, ein ruhigerer Rückblick und ein Blick nach vorn. Wähle seine Fragen.',
  obOwnLater: 'Eigene Fragen schreiben und die Reihenfolge ändern kannst du jederzeit in den Einstellungen.',
  obReminderTitle: 'Hilft eine Erinnerung?',
  obReminderBody: 'Ganz freiwillig. Das Tagebuch drängelt nie, und du kannst sie in den Einstellungen ein- und ausschalten.',
  obHomeTitle: 'Griffbereit und sicher',
  obHomeBody: 'Dein Tagebuch liegt nur in diesem Browser. Exportiere ab und zu eine Sicherung in den Einstellungen, vor allem vor einem Handywechsel.',
  obInstalled: 'Das Tagebuch ist auf diesem Gerät schon installiert.',
  obDoneTitle: 'Deine Presse ist bereit',
  obDoneBody: 'Schreib ein paar Zeilen, wann immer dir etwas Gutes begegnet, und presse den Tag dann mit dem Stempel unten auf der Seite.',
  obToWreath: 'Zum Kranz',
  showIntro: 'Die Einführung noch einmal zeigen',

  saveError: 'Der Speicher dieses Geräts konnte nicht gelesen oder beschrieben werden. Exportiere wenn möglich eine Sicherung in den Einstellungen.',
}

export const STRINGS: Record<Lang, Strings> = { en, de }
