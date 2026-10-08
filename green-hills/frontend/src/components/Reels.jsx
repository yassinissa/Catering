import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { REELS } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'
import AutoVideo from './AutoVideo.jsx'

function Lightbox({ reel, onClose }) {
  const { t, L } = useLang()
  const closeRef = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    document.body.classList.add('no-scroll')
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') { e.preventDefault(); closeRef.current?.focus() } // keep focus inside
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={L(reel.label)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.video
        src={reel.src}
        poster={reel.poster}
        autoPlay
        loop
        playsInline
        controls
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label={t.reels.closeVideo}>
        <X size={22} aria-hidden="true" />
      </button>
    </motion.div>
  )
}

export default function Reels() {
  const { t, L, lang } = useLang()
  const [open, setOpen] = useState(null)
  return (
    <section className="section" aria-labelledby="reels-title" style={{ paddingTop: 'clamp(72px, 9vw, 120px)' }}>
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="eyebrow">{t.reels.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="reels-title" className="h-display h2">{rich(t.reels.title)}</h2></Reveal>
        </div>
        <div className="reels-scroller">
          {REELS.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.06} style={{ display: 'grid' }}>
              <button type="button" className="reel" onClick={() => setOpen(r)} aria-label={`${t.reels.play}: ${L(r.label)}`}>
                <AutoVideo src={r.src} poster={r.poster} />
                <span className="reel-label">
                  {L(r.label)}
                  <span className="reel-play"><Play size={16} fill="currentColor" aria-hidden="true" /></span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
        <p className="reel-hint">{lang === 'ar' ? 'اسحب لمشاهدة المزيد ←' : 'Swipe for more →'}</p>
      </div>
      <AnimatePresence>{open && <Lightbox reel={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}
