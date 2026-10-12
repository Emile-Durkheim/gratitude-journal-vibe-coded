import { useEffect, type RefObject } from 'react'

/**
 * Keeps a sticky header in view while the on-screen keyboard is up. Android resizes the page for
 * the keyboard (see interactive-widget in index.html), but iOS only shrinks the visible area and
 * scrolls it, which leaves sticky elements above the screen. This moves the header down into the
 * visible area and marks it `compact` while the keyboard takes up the screen.
 */
export function useKeyboardShift(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let shift = 0
    const update = () => {
      const el = ref.current
      if (!el) return
      const keyboard = vv.height * vv.scale < document.documentElement.clientHeight - 120
      el.classList.toggle('compact', keyboard)
      const naturalTop = el.getBoundingClientRect().top - shift
      shift = keyboard ? Math.max(0, vv.offsetTop - naturalTop) : 0
      el.style.setProperty('--kb-shift', `${shift}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('scroll', update)
    }
  }, [ref])
}
