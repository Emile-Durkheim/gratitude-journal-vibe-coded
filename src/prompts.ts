export type LibraryPrompt = {
  text: string
  /** One line on why this prompt is in the library. See RESEARCH.md for sources. */
  why: string
}

export type PromptGroup = {
  title: string
  prompts: LibraryPrompt[]
}

export const PROMPT_LIBRARY: PromptGroup[] = [
  {
    title: 'What went well',
    prompts: [
      {
        text: 'Something that went well today, and why it happened',
        why: '"Three Good Things": happier for up to six months (Seligman et al., 2005).',
      },
      {
        text: 'One good thing from today, described in detail',
        why: 'Depth beats breadth: one thing in detail over a long list (Emmons).',
      },
      {
        text: 'Something good I had a hand in today',
        why: 'Explaining your own part in good events is part of Three Good Things.',
      },
    ],
  },
  {
    title: 'People',
    prompts: [
      {
        text: 'Someone who made my day better, and what they did',
        why: 'Gratitude to people does more than gratitude for things (Emmons).',
      },
      {
        text: "Someone I'm glad is in my life, and why",
        why: 'Gratitude strengthens close relationships (Algoe, 2012).',
      },
      {
        text: "Someone I never properly thanked, and what I'd tell them",
        why: 'Gratitude letters raise happiness and lower depressive symptoms (Toepfer et al., 2012).',
      },
    ],
  },
  {
    title: 'Imagine it gone',
    prompts: [
      {
        text: 'Something good in my life I might never have had. What if it were gone?',
        why: 'Mentally subtracting a good thing lifts mood more than counting it (Koo et al., 2008).',
      },
      {
        text: 'How I might never have met someone I love',
        why: 'Raised relationship satisfaction in Koo et al. (2008), Study 4.',
      },
    ],
  },
  {
    title: 'Surprises and small things',
    prompts: [
      {
        text: 'Something unexpected that made my day better',
        why: 'Surprising good events produce stronger gratitude (Emmons).',
      },
      {
        text: 'A small moment I enjoyed',
        why: 'Noticing small daily blessings, as in Emmons & McCullough (2003).',
      },
      {
        text: 'Something I usually take for granted',
        why: 'Counters adaptation, the main reason gratitude effects fade (Lyubomirsky).',
      },
    ],
  },
  {
    title: 'Harder days',
    prompts: [
      {
        text: 'Something hard right now, and anything good that has come from it',
        why: 'Benefit-finding: grateful reappraisal of difficult events (Watkins et al., 2008).',
      },
    ],
  },
]

export const ALL_LIBRARY_PROMPTS: LibraryPrompt[] = PROMPT_LIBRARY.flatMap((g) => g.prompts)

/** Starting set: one prompt from each of the three best-supported techniques. */
export const DEFAULT_PROMPTS: string[] = [
  'Something that went well today, and why it happened',
  'Someone who made my day better, and what they did',
  'Something good in my life I might never have had. What if it were gone?',
]

export const WEEKLY_PROMPT_LIBRARY: PromptGroup[] = [
  {
    title: 'Look back',
    prompts: [
      {
        text: 'The best moments of my week, and why they mattered',
        why: 'Savoring good moments after the fact extends their benefit (Bryant, 2003).',
      },
      {
        text: 'Three good things from this week, and why they happened',
        why: 'Three Good Things, at a weekly pace (Seligman et al., 2005).',
      },
      {
        text: 'Someone who made my week better, and what I want to tell them',
        why: 'Gratitude to people does more than gratitude for things (Emmons).',
      },
    ],
  },
  {
    title: 'Gratitude list',
    prompts: [
      {
        text: 'Up to five things I am grateful for this week',
        why: 'Weekly lists raised life appraisals and optimism and cut physical symptoms over 10 weeks (Emmons & McCullough, 2003).',
      },
      {
        text: 'Something I take for granted that I would miss if it were gone',
        why: 'Mental subtraction lifts mood more than counting blessings (Koo et al., 2008).',
      },
    ],
  },
  {
    title: 'Strengths and kindness',
    prompts: [
      {
        text: 'A strength I used this week, what I did with it, and what I learned',
        why: 'Using strengths and writing up what you learned: happier for six months (Seligman et al., 2005).',
      },
      {
        text: 'Kind things I did or received this week, and how they felt',
        why: 'Counting acts of kindness, bunched into one day a week, raised happiness (Lyubomirsky et al., 2005).',
      },
    ],
  },
  {
    title: 'Look ahead',
    prompts: [
      {
        text: 'What would make next week a good one? One small thing I will do for it',
        why: 'Picturing a good future in detail raises positive mood (King, 2001; Sheldon & Lyubomirsky, 2006).',
      },
      {
        text: 'One thing I am looking forward to next week',
        why: 'Anticipation is a form of savoring.',
      },
      {
        text: 'A hard thing from this week, and anything good that came out of it',
        why: 'Benefit-finding: grateful reappraisal of difficult events (Watkins et al., 2008).',
      },
    ],
  },
]

/** Starting weekly set: look back, give thanks, use a strength, look ahead. */
export const DEFAULT_WEEKLY_PROMPTS: string[] = [
  'The best moments of my week, and why they mattered',
  'Up to five things I am grateful for this week',
  'A strength I used this week, what I did with it, and what I learned',
  'What would make next week a good one? One small thing I will do for it',
]
