import type { Lang } from './i18n'

/** A line for the top of each day page, chosen from the date so a day keeps its quote. */
export type Quote = { text: string; by: string }

/** English and German have their own collections, not translations of each other. */
export const QUOTES: Record<Lang, Quote[]> = {
  en: [
    { text: 'Enjoy the little things, for one day you may look back and realize they were the big things.', by: 'Robert Brault' },
    { text: 'Gratitude is not only the greatest of virtues, but the parent of all the others.', by: 'Cicero' },
    { text: 'Some people grumble that roses have thorns; I am grateful that thorns have roses.', by: 'Alphonse Karr' },
    { text: 'Let us be grateful to the people who make us happy; they are the charming gardeners who make our souls blossom.', by: 'Marcel Proust' },
    { text: 'When eating fruit, remember the one who planted the tree.', by: 'Vietnamese proverb' },
    { text: 'Gratitude is the memory of the heart.', by: 'Jean-Baptiste Massieu' },
    { text: 'Feeling gratitude and not expressing it is like wrapping a present and not giving it.', by: 'William Arthur Ward' },
    { text: 'Gratitude unlocks the fullness of life.', by: 'Melody Beattie' },
    { text: 'This is a wonderful day. I have never seen this one before.', by: 'Maya Angelou' },
    { text: 'If the only prayer you said was thank you, that would be enough.', by: 'Meister Eckhart' },
    { text: 'It is not happiness that makes us grateful, but gratefulness that makes us happy.', by: 'David Steindl-Rast' },
    { text: 'Acknowledging the good that you already have in your life is the foundation for all abundance.', by: 'Eckhart Tolle' },
    { text: 'Where flowers bloom, so does hope.', by: 'Lady Bird Johnson' },
    { text: 'Even the smallest flower was once a seed someone kept.', by: 'The Flower Press' },
    { text: 'Small kindnesses, pressed between pages, keep their colour.', by: 'The Flower Press' },
    { text: 'Notice one good thing; it tends to bring friends.', by: 'The Flower Press' },
  ],
  de: [
    { text: 'Willst du immer weiter schweifen? Sieh, das Gute liegt so nah. Lerne nur das Glück ergreifen, denn das Glück ist immer da.', by: 'Johann Wolfgang von Goethe' },
    { text: 'Es gibt nichts Gutes, außer: Man tut es.', by: 'Erich Kästner' },
    { text: 'Die Erinnerung ist das einzige Paradies, aus dem wir nicht vertrieben werden können.', by: 'Jean Paul' },
    { text: 'Und jedem Anfang wohnt ein Zauber inne.', by: 'Hermann Hesse' },
    { text: 'Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.', by: 'Antoine de Saint-Exupéry' },
    { text: 'Wer nicht genießt, ist ungenießbar.', by: 'Konstantin Wecker' },
    { text: 'Glück ist das Einzige, was sich verdoppelt, wenn man es teilt.', by: 'Albert Schweitzer' },
    { text: '… dass Dankbarkeit das Leben erst reich macht.', by: 'Dietrich Bonhoeffer' },
    { text: 'Die Erde lacht in Blumen.', by: 'Ralph Waldo Emerson' },
    { text: 'Das Glück deines Lebens hängt von der Beschaffenheit deiner Gedanken ab.', by: 'Marc Aurel' },
    { text: 'Jeder Tag ist ein neuer Anfang.', by: 'Sprichwort' },
    { text: 'Was man gern tut, das tut man gut, und was man gut tut, das tut man gern.', by: 'Sprichwort' },
    { text: 'Auch die kleinste Blume war einmal ein Samen, den jemand aufbewahrt hat.', by: 'Die Blumenpresse' },
    { text: 'Ein guter Moment, aufgeschrieben, verblasst nicht so schnell.', by: 'Die Blumenpresse' },
    { text: 'Wer das Kleine bemerkt, dem wird der Tag groß.', by: 'Die Blumenpresse' },
  ],
}

export function quoteFor(dateKey: string, lang: Lang): Quote {
  const list = QUOTES[lang]
  let h = 2166136261
  for (const ch of 'quote' + dateKey) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return list[h % list.length]
}
