import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS } from '../content/strings.js'

const LangContext = createContext(null)
const STORAGE_KEY = 'gh-lang'

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ar') return saved
  } catch { /* storage unavailable */ }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar')) return 'ar'
  return 'en'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? 'جرين هيلز للضيافة · الكويت' : 'Green Hills Catering · Kuwait'
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), [])
  // L() picks the right language from a { en, ar } content object
  const L = useCallback((obj) => (obj == null ? '' : typeof obj === 'string' ? obj : obj[lang] ?? obj.en), [lang])

  const value = useMemo(() => ({ lang, setLang, toggle, t: STRINGS[lang], L, isRTL: lang === 'ar' }), [lang, toggle, L])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
