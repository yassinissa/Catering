import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'
import { scrollToId } from '../lib/scroll.js'
import { useContent } from '../lib/content.jsx'
import AutoVideo from './AutoVideo.jsx'
import Hills from './Hills.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function Hero() {
  const { t, L } = useLang()
  const { reels } = useContent()
  const { requestBooking } = useBooking()
  // videos picked in the admin for the left, middle and right spots; the middle one also fills the phone background
  const mosaic = [1, 2, 3].map((slot) => reels.find((r) => r.heroSlot === slot)).filter(Boolean)
  const bg = reels.find((r) => r.heroSlot === 2) || mosaic[0] || reels[0]
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -30])
  const ys = [y1, y2, y3]

  const line = (delay) => ({
    initial: { y: '110%' },
    animate: { y: 0 },
    transition: { duration: 1.05, delay, ease: EASE },
  })
  const fade = (delay) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  })

  return (
    <section className="hero" id="top" ref={ref} aria-labelledby="hero-title">
      {/* phones & tablets: full-bleed video behind the text */}
      <div className="hero-bg" aria-hidden="true">
        {bg && <AutoVideo src={bg.src} poster={bg.poster} eager />}
      </div>

      <div className="wrap hero-content">
        <div className="hero-copy">
          <motion.span className="eyebrow" {...fade(0.1)}>{t.hero.eyebrow}</motion.span>
          <h1 id="hero-title" className="h-display hero-title">
            <span className="line"><motion.span {...line(0.15)}>{t.hero.title1}</motion.span></span>
            <span className="line"><motion.span className="accent" {...line(0.28)}>{t.hero.title2}</motion.span></span>
          </h1>
          <motion.p className="lead hero-lead" {...fade(0.5)}>{t.hero.lead}</motion.p>
          <motion.div className="hero-ctas" {...fade(0.62)}>
            <button type="button" className="btn" onClick={() => requestBooking()}>
              {t.hero.cta}
              <ArrowRight size={18} className="btn-icon" aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => scrollToId('cuisines')}>
              {t.hero.cta2}
            </button>
          </motion.div>
        </div>

        {/* desktop: three reels at different heights, drifting at different speeds */}
        <div className="hero-mosaic" aria-hidden="true">
          {mosaic.map((r, i) => (
            <motion.div
              key={r.id}
              className="mosaic-col"
              style={{ y: ys[i] }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.14, ease: EASE }}
            >
              <AutoVideo src={r.src} poster={r.poster} eager={i === 1} />
              <span className="mosaic-tag">{L(r.label)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true"><i />{t.hero.scroll}</div>
      <Hills to="var(--leaf)" />
    </section>
  )
}
