import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import { STRINGS, type Lang, type Strings } from '../content/i18n'

export type LangState = {
  lang: Lang
  /** The stored choice; null follows the device. */
  choice: Lang | null
  t: Strings
  setChoice: (choice: Lang | null) => void
}

export const LangKey: InjectionKey<ComputedRef<LangState>> = Symbol('lang')

const fallback = computed<LangState>(() => ({ lang: 'en', choice: null, t: STRINGS.en, setChoice: () => {} }))

export function useLang(): ComputedRef<LangState> {
  return inject(LangKey, fallback)
}

export function useT(): ComputedRef<Strings> {
  const state = useLang()
  return computed(() => state.value.t)
}
