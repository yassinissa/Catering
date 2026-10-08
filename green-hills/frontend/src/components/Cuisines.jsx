import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'
import { CUISINES } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'
import { Leaf } from './Icons.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function Cuisines() {
  const { t, L, isRTL } = useLang()
  const { requestBooking } = useBooking()
  const [active, setActive] = useState(CUISINES[0].id)
  const tabsRef = useRef([])
  const uid = useId()
  const c = CUISINES.find((x) => x.id === active)

  // arrow-key navigation between tabs (mirrored in Arabic)
  const onKeyDown = (e, i) => {
    const fwd = isRTL ? 'ArrowLeft' : 'ArrowRight'
    const back = isRTL ? 'ArrowRight' : 'ArrowLeft'
    let n = null
    if (e.key === fwd) n = (i + 1) % CUISINES.length
    if (e.key === back) n = (i - 1 + CUISINES.length) % CUISINES.length
    if (e.key === 'Home') n = 0
    if (e.key === 'End') n = CUISINES.length - 1
    if (n !== null) {
      e.preventDefault()
      setActive(CUISINES[n].id)
      tabsRef.current[n]?.focus()
    }
  }

  return (
    <section id="cuisines" className="section" aria-labelledby="cuisines-title">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div>
            <Reveal><span className="eyebrow">{t.cuisines.eyebrow}</span></Reveal>
            <Reveal delay={0.05}><h2 id="cuisines-title" className="h-display h2">{rich(t.cuisines.title)}</h2></Reveal>
          </div>
          <Reveal delay={0.1}><p className="lead">{t.cuisines.note}</p></Reveal>
        </div>

        <Reveal>
          <div className="cuisine-tabs" role="tablist" aria-label={t.cuisines.eyebrow}>
            {CUISINES.map((x, i) => {
              const selected = x.id === active
              return (
                <button
                  key={x.id}
                  ref={(el) => { tabsRef.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${x.id}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className="cuisine-tab"
                  onClick={() => setActive(x.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  {selected && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ duration: 0.45, ease: EASE }} />}
                  {L(x.name)}
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="cuisine-panel" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active}`}>
          <div className="cuisine-image">
            <AnimatePresence initial={false}>
              <motion.img
                key={c.id}
                src={c.image}
                alt={L(c.dishes[0])}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              className="cuisine-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <h3 className="h-display cuisine-name">{L(c.name)}</h3>
              <p className="cuisine-tagline">{L(c.tagline)}</p>
              <div className="menu-card">
                <h4>{t.cuisines.sample}</h4>
                <ul>
                  {c.dishes.map((d, i) => (
                    <motion.li
                      key={d.en}
                      initial={{ opacity: 0, x: isRTL ? -14 : 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.08 + i * 0.05, ease: EASE }}
                    >
                      <Leaf size={15} />
                      {L(d)}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <button type="button" className="link-arrow" onClick={() => requestBooking({ cuisine: c.id })}>
                  {t.cuisines.ask}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
