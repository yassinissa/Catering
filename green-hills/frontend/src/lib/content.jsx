import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as SITE from '../content/site.js'
import { fetchContent } from './api.js'

/*
 * Website content edited in the Django admin (/admin → Website content).
 * Django hands it over inside the page (window.__GH_CONTENT__); the dev server fetches it from /api/content/.
 * Without a server (static preview) the built-in content in content/site.js is used.
 */

const ContentContext = createContext(null)
const BASE = import.meta.env.BASE_URL
const DEMO = import.meta.env.VITE_DEMO === '1'

/** Uploaded files come as full addresses; built-in ones as a path under public/media/. */
export const asset = (p) => (!p ? '' : /^(https?:)?\/\//.test(p) || p.startsWith('/') ? p : `${BASE}media/${p}`)

const BUILTIN_HERO = { r2: 1, r3: 2, r6: 3 }

const FALLBACK = {
  texts: {},
  contact: { phone: SITE.CONTACT.phone, whatsapp: SITE.CONTACT.whatsapp, email: SITE.CONTACT.email },
  socials: SITE.CONTACT.instagram ? [{ platform: 'instagram', url: SITE.CONTACT.instagram, handle: SITE.CONTACT.instagramHandle }] : [],
  logo: asset('logo-light@3x.png'),
  about: {
    main: { src: SITE.img('pomegranate.jpg'), alt: { en: 'Pomegranate jelly with pistachio and mint', ar: 'جيلي الرمان بالفستق والنعناع' } },
    small: { src: SITE.img('croquettes.jpg'), alt: { en: 'Crispy croquettes with dip', ar: 'كروكيت مقرمش مع صلصة' } },
  },
  reels: SITE.REELS.map((r) => ({ ...r, heroSlot: BUILTIN_HERO[r.id] || 0 })),
  cuisines: SITE.CUISINES,
  services: SITE.SERVICES,
  events: SITE.EVENTS,
  ramadan: SITE.RAMADAN,
  brands: SITE.BRANDS,
}

function fromServer(d) {
  return {
    texts: d.texts || {},
    contact: d.contact,
    socials: d.socials,
    logo: asset(d.logo),
    about: {
      main: { ...d.about.main, src: asset(d.about.main.src) },
      small: { ...d.about.small, src: asset(d.about.small.src) },
    },
    reels: d.reels.map((r) => ({ ...r, src: asset(r.src), poster: asset(r.poster) })),
    cuisines: d.cuisines.map((c) => ({ ...c, image: asset(c.image) })),
    services: d.services.map((s) => ({ ...s, image: asset(s.image) })),
    events: d.events,
    ramadan: d.ramadan.map((p) => ({ ...p, image: asset(p.image) })),
    brands: d.brands.map((b) => ({ ...b, logo: asset(b.logo) })),
  }
}

export function ContentProvider({ children }) {
  const [data, setData] = useState(() => (typeof window !== 'undefined' && window.__GH_CONTENT__) || null)

  useEffect(() => {
    if (data || DEMO) return
    let live = true
    fetchContent().then((d) => { if (live && d) setData(d) })
    return () => { live = false }
  }, [data])

  const value = useMemo(() => {
    if (!data) return FALLBACK
    try {
      return fromServer(data)
    } catch {
      return FALLBACK // unexpected shape: never show a blank page
    }
  }, [data])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)

/* ── Page texts: admin edits laid over content/strings.js ── */

const getIn = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj)

function setIn(obj, [k, ...rest], value) {
  const copy = Array.isArray(obj) ? [...obj] : { ...obj }
  copy[k] = rest.length ? setIn(obj[k], rest, value) : value
  return copy
}

/** Returns strings with the admin's texts applied. Empty texts, and keys that no longer exist in the code, are ignored. */
export function applyTexts(strings, texts, lang) {
  let out = strings
  for (const [key, value] of Object.entries(texts || {})) {
    const text = value?.[lang]
    if (typeof text !== 'string' || !text.trim()) continue
    const path = key.split('.')
    const current = getIn(strings, path)
    if (current === undefined || typeof current === 'function') continue
    out = setIn(out, path, Array.isArray(current) ? text.split('\n').map((w) => w.trim()).filter(Boolean) : text)
  }
  return out
}
