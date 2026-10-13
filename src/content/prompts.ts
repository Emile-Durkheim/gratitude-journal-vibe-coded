import type { Lang } from './i18n'

type Text = Record<Lang, string>

type SourcePrompt = {
  text: Text
  /** One line on why this prompt is in the library. See RESEARCH.md for sources. */
  why: Text
}

type SourceGroup = { title: Text; prompts: SourcePrompt[] }

export type LibraryPrompt = { text: string; why: string }
export type PromptGroup = { title: string; prompts: LibraryPrompt[] }

const DAILY: SourceGroup[] = [
  {
    title: { en: 'What went well', de: 'Was gut lief' },
    prompts: [
      {
        text: {
          en: 'Something that went well today, and why it happened',
          de: 'Etwas, das heute gut lief, und warum es so kam',
        },
        why: {
          en: '"Three Good Things": happier for up to six months (Seligman et al., 2005).',
          de: '„Drei gute Dinge“: bis zu sechs Monate lang glücklicher (Seligman et al., 2005).',
        },
      },
      {
        text: {
          en: 'One good thing from today, described in detail',
          de: 'Eine gute Sache von heute, ausführlich beschrieben',
        },
        why: {
          en: 'Depth beats breadth: one thing in detail over a long list (Emmons).',
          de: 'Tiefe statt Breite: eine Sache im Detail statt einer langen Liste (Emmons).',
        },
      },
      {
        text: {
          en: 'Something good I had a hand in today',
          de: 'Etwas Gutes, zu dem ich heute beigetragen habe',
        },
        why: {
          en: 'Explaining your own part in good events is part of Three Good Things.',
          de: 'Den eigenen Anteil an guten Ereignissen zu erklären, gehört zu „Drei gute Dinge“.',
        },
      },
    ],
  },
  {
    title: { en: 'People', de: 'Menschen' },
    prompts: [
      {
        text: {
          en: 'Someone who made my day better, and what they did',
          de: 'Jemand, der meinen Tag besser gemacht hat, und was er oder sie getan hat',
        },
        why: {
          en: 'Gratitude to people does more than gratitude for things (Emmons).',
          de: 'Dankbarkeit gegenüber Menschen wirkt stärker als Dankbarkeit für Dinge (Emmons).',
        },
      },
      {
        text: {
          en: "Someone I'm glad is in my life, and why",
          de: 'Jemand, über den ich froh bin, dass es ihn in meinem Leben gibt, und warum',
        },
        why: {
          en: 'Gratitude strengthens close relationships (Algoe, 2012).',
          de: 'Dankbarkeit stärkt enge Beziehungen (Algoe, 2012).',
        },
      },
      {
        text: {
          en: "Someone I never properly thanked, and what I'd tell them",
          de: 'Jemand, dem ich nie richtig gedankt habe, und was ich ihm sagen würde',
        },
        why: {
          en: 'Gratitude letters raise happiness and lower depressive symptoms (Toepfer et al., 2012).',
          de: 'Dankesbriefe steigern das Glück und mindern depressive Symptome (Toepfer et al., 2012).',
        },
      },
    ],
  },
  {
    title: { en: 'Imagine it gone', de: 'Stell dir vor, es fehlte' },
    prompts: [
      {
        text: {
          en: 'Something good in my life I might never have had. What if it were gone?',
          de: 'Etwas Gutes in meinem Leben, das ich vielleicht nie gehabt hätte. Was, wenn es fehlte?',
        },
        why: {
          en: 'Mentally subtracting a good thing lifts mood more than counting it (Koo et al., 2008).',
          de: 'Etwas Gutes in Gedanken wegzunehmen hebt die Stimmung mehr, als es zu zählen (Koo et al., 2008).',
        },
      },
      {
        text: {
          en: 'How I might never have met someone I love',
          de: 'Wie ich einem Menschen, den ich liebe, vielleicht nie begegnet wäre',
        },
        why: {
          en: 'Raised relationship satisfaction in Koo et al. (2008), Study 4.',
          de: 'Steigerte die Zufriedenheit in der Beziehung in Koo et al. (2008), Studie 4.',
        },
      },
    ],
  },
  {
    title: { en: 'Surprises and small things', de: 'Überraschungen und Kleinigkeiten' },
    prompts: [
      {
        text: {
          en: 'Something unexpected that made my day better',
          de: 'Etwas Unerwartetes, das meinen Tag besser gemacht hat',
        },
        why: {
          en: 'Surprising good events produce stronger gratitude (Emmons).',
          de: 'Überraschende gute Ereignisse wecken stärkere Dankbarkeit (Emmons).',
        },
      },
      {
        text: { en: 'A small moment I enjoyed', de: 'Ein kleiner Moment, den ich genossen habe' },
        why: {
          en: 'Noticing small daily blessings, as in Emmons & McCullough (2003).',
          de: 'Kleine Freuden des Alltags bemerken, wie bei Emmons & McCullough (2003).',
        },
      },
      {
        text: {
          en: 'Something I usually take for granted',
          de: 'Etwas, das ich sonst für selbstverständlich halte',
        },
        why: {
          en: 'Counters adaptation, the main reason gratitude effects fade (Lyubomirsky).',
          de: 'Wirkt der Gewöhnung entgegen, dem Hauptgrund, warum Dankbarkeit nachlässt (Lyubomirsky).',
        },
      },
    ],
  },
  {
    title: { en: 'Harder days', de: 'Schwerere Tage' },
    prompts: [
      {
        text: {
          en: 'Something hard right now, and anything good that has come from it',
          de: 'Etwas, das gerade schwer ist, und was Gutes daraus entstanden ist',
        },
        why: {
          en: 'Benefit-finding: grateful reappraisal of difficult events (Watkins et al., 2008).',
          de: 'Benefit-Finding: schwierige Ereignisse dankbar neu bewerten (Watkins et al., 2008).',
        },
      },
    ],
  },
]

const WEEKLY: SourceGroup[] = [
  {
    title: { en: 'Look back', de: 'Zurückblicken' },
    prompts: [
      {
        text: {
          en: 'The best moments of my week, and why they mattered',
          de: 'Die schönsten Momente meiner Woche, und warum sie mir wichtig waren',
        },
        why: {
          en: 'Savoring good moments after the fact extends their benefit (Bryant, 2003).',
          de: 'Gute Momente im Nachhinein auszukosten verlängert ihre Wirkung (Bryant, 2003).',
        },
      },
      {
        text: {
          en: 'Three good things from this week, and why they happened',
          de: 'Drei gute Dinge aus dieser Woche, und warum sie so kamen',
        },
        why: {
          en: 'Three Good Things, at a weekly pace (Seligman et al., 2005).',
          de: '„Drei gute Dinge“ im Wochentakt (Seligman et al., 2005).',
        },
      },
      {
        text: {
          en: 'Someone who made my week better, and what I want to tell them',
          de: 'Jemand, der meine Woche besser gemacht hat, und was ich ihm sagen möchte',
        },
        why: {
          en: 'Gratitude to people does more than gratitude for things (Emmons).',
          de: 'Dankbarkeit gegenüber Menschen wirkt stärker als Dankbarkeit für Dinge (Emmons).',
        },
      },
    ],
  },
  {
    title: { en: 'Gratitude list', de: 'Dankbarkeitsliste' },
    prompts: [
      {
        text: {
          en: 'Up to five things I am grateful for this week',
          de: 'Bis zu fünf Dinge, für die ich diese Woche dankbar bin',
        },
        why: {
          en: 'Weekly lists raised life appraisals and optimism and cut physical symptoms over 10 weeks (Emmons & McCullough, 2003).',
          de: 'Wöchentliche Listen steigerten über 10 Wochen Lebenszufriedenheit und Optimismus und senkten körperliche Beschwerden (Emmons & McCullough, 2003).',
        },
      },
      {
        text: {
          en: 'Something I take for granted that I would miss if it were gone',
          de: 'Etwas Selbstverständliches, das mir fehlen würde, wenn es weg wäre',
        },
        why: {
          en: 'Mental subtraction lifts mood more than counting blessings (Koo et al., 2008).',
          de: 'Gedankliches Wegnehmen hebt die Stimmung mehr als das Zählen guter Dinge (Koo et al., 2008).',
        },
      },
    ],
  },
  {
    title: { en: 'Strengths and kindness', de: 'Stärken und Freundlichkeit' },
    prompts: [
      {
        text: {
          en: 'A strength I used this week, what I did with it, and what I learned',
          de: 'Eine Stärke, die ich diese Woche eingesetzt habe, was ich damit getan und was ich gelernt habe',
        },
        why: {
          en: 'Using strengths and writing up what you learned: happier for six months (Seligman et al., 2005).',
          de: 'Stärken nutzen und aufschreiben, was man gelernt hat: sechs Monate lang glücklicher (Seligman et al., 2005).',
        },
      },
      {
        text: {
          en: 'Kind things I did or received this week, and how they felt',
          de: 'Freundlichkeiten, die ich diese Woche getan oder erfahren habe, und wie sie sich anfühlten',
        },
        why: {
          en: 'Counting acts of kindness, bunched into one day a week, raised happiness (Lyubomirsky et al., 2005).',
          de: 'Freundliche Taten zu zählen, gebündelt an einem Tag pro Woche, steigerte das Glück (Lyubomirsky et al., 2005).',
        },
      },
    ],
  },
  {
    title: { en: 'Look ahead', de: 'Vorausblicken' },
    prompts: [
      {
        text: {
          en: 'What would make next week a good one? One small thing I will do for it',
          de: 'Was würde die nächste Woche zu einer guten machen? Eine Kleinigkeit, die ich dafür tue',
        },
        why: {
          en: 'Picturing a good future in detail raises positive mood (King, 2001; Sheldon & Lyubomirsky, 2006).',
          de: 'Sich eine gute Zukunft genau vorzustellen hebt die Stimmung (King, 2001; Sheldon & Lyubomirsky, 2006).',
        },
      },
      {
        text: {
          en: 'One thing I am looking forward to next week',
          de: 'Eine Sache, auf die ich mich nächste Woche freue',
        },
        why: { en: 'Anticipation is a form of savoring.', de: 'Vorfreude ist eine Form des Auskostens.' },
      },
      {
        text: {
          en: 'A hard thing from this week, and anything good that came out of it',
          de: 'Etwas Schweres aus dieser Woche, und was Gutes daraus entstanden ist',
        },
        why: {
          en: 'Benefit-finding: grateful reappraisal of difficult events (Watkins et al., 2008).',
          de: 'Benefit-Finding: schwierige Ereignisse dankbar neu bewerten (Watkins et al., 2008).',
        },
      },
    ],
  },
]

const localize = (groups: SourceGroup[], lang: Lang): PromptGroup[] =>
  groups.map((g) => ({
    title: g.title[lang],
    prompts: g.prompts.map((p) => ({ text: p.text[lang], why: p.why[lang] })),
  }))

export const promptLibrary = (lang: Lang) => localize(DAILY, lang)
export const weeklyPromptLibrary = (lang: Lang) => localize(WEEKLY, lang)

/** Starting set: one prompt from each of the three best-supported techniques. */
export const defaultPrompts = (lang: Lang): string[] => [DAILY[0].prompts[0], DAILY[1].prompts[0], DAILY[2].prompts[0]].map((p) => p.text[lang])

/** Starting weekly set: look back, give thanks, use a strength, look ahead. */
export const defaultWeeklyPrompts = (lang: Lang): string[] =>
  [WEEKLY[0].prompts[0], WEEKLY[1].prompts[0], WEEKLY[2].prompts[0], WEEKLY[3].prompts[0]].map((p) => p.text[lang])

const ALL_SOURCE = [...DAILY, ...WEEKLY].flatMap((g) => g.prompts)

/**
 * Library prompts in a list, switched to another language. Prompts the user wrote themselves have
 * no translation and stay as they are.
 */
export function translatePrompts(prompts: string[], to: Lang): string[] {
  return prompts.map((p) => ALL_SOURCE.find((s) => Object.values(s.text).includes(p))?.text[to] ?? p)
}
