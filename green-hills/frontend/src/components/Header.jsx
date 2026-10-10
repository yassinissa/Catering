import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'

const BASE = import.meta.env.BASE_URL
export const NAV = ['about', 'cuisines', 'services', 'events', 'ramadan', 'locations']

function LangButton() {
  const { t, toggle, lang } = useLang()
  return (
    <button type="button" className="lang-btn" onClick={toggle} aria-label={t.langLabel} lang={lang === 'en' ? 'ar' : 'en'}>
      {t.lang}
    </button>
  )
}

export default function Header() {
  const { t } = useLang()
  const { requestBooking } = useBooking()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const menuBtn = useRef(null)
  const closeBtn = useRef(null)

  // the bar always stays visible; it only turns solid once the page leaves the top
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setSolid(window.scrollY > 40)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight the section currently on screen
  useEffect(() => {
    const els = [...NAV, 'book'].map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // mobile menu: lock scroll, close on Escape, manage focus
  useEffect(() => {
    if (!open) return
    document.body.classList.add('no-scroll')
    closeBtn.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const btn = menuBtn.current
    return () => {
      document.body.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
      btn?.focus()
    }
  }, [open])

  const goBook = () => { setOpen(false); requestBooking() }

  return (
    <>
      <header className={`header${solid ? ' is-solid' : ''}`}>
        <div className="wrap header-inner">
          <a href="#top" className="brand" aria-label="Green Hills — home">
            <img src={`${BASE}media/logo-light@3x.png`} alt="Green Hills" width="114" height="40" />
          </a>
          <nav className="nav-links" aria-label="Main">
            {NAV.map((id) => (
              <a key={id} href={`#${id}`} className={active === id ? 'is-active' : undefined} aria-current={active === id ? 'true' : undefined}>
                {t.nav[id]}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <LangButton />
            <button type="button" className="btn btn--sm" onClick={goBook}>
              {t.nav.book}
            </button>
            <button
              ref={menuBtn}
              type="button"
              className="menu-btn"
              aria-label={t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-menu-top">
              <img src={`${BASE}media/logo-light@3x.png`} alt="Green Hills" width="114" height="40" style={{ height: 40, width: 'auto' }} />
              <button ref={closeBtn} type="button" className="menu-btn" aria-label={t.nav.close} onClick={() => setOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Main">
              {NAV.map((id, i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {t.nav[id]}
                  <ArrowRight size={22} aria-hidden="true" />
                </motion.a>
              ))}
            </nav>
            <div className="mobile-menu-foot">
              <button type="button" className="btn" onClick={goBook}>{t.nav.book}</button>
              <LangButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
