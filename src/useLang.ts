import { createContext, useContext } from 'react'
import { STRINGS, type Lang, type Strings } from './i18n'

export type LangState = {
  lang: Lang
  /** The stored choice; null follows the device. */
  choice: Lang | null
  t: Strings
  setChoice: (choice: Lang | null) => void
}

export const LangContext = createContext<LangState>({ lang: 'en', choice: null, t: STRINGS.en, setChoice: () => {} })

export function useLang(): LangState {
  return useContext(LangContext)
}

export function useT(): Strings {
  return useContext(LangContext).t
}
