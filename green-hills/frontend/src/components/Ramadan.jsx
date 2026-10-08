import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'
import { RAMADAN } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'

function Crescent() {
  return (
    <motion.svg
      className="crescent"
      width="56"
      height="56"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      initial={{ rotate: -30, opacity: 0 }}
      whileInView={{ rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <path d="M40 8a24 24 0 1 0 16 40A20 20 0 1 1 40 8Z" fill="currentColor" />
      <path d="m48 14 1.6 4.2 4.4.3-3.4 2.8 1.1 4.3-3.7-2.4-3.7 2.4 1.1-4.3-3.4-2.8 4.4-.3Z" fill="currentColor" />
    </motion.svg>
  )
}

export default function Ramadan() {
  const { t, L } = useLang()
  const { requestBooking } = useBooking()
  const r = t.ramadan
  return (
    <section id="ramadan" className="section ramadan" aria-labelledby="ramadan-title">
      <div className="ramadan-pattern" aria-hidden="true" />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="ramadan-head">
          <div>
            <Crescent />
            <Reveal><span className="eyebrow" style={{ marginTop: 18 }}>{r.eyebrow}</span></Reveal>
            <Reveal delay={0.05}><h2 id="ramadan-title" className="h-display h2">{rich(r.title)}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gap: 24 }}>
            <Reveal delay={0.1}><p className="lead">{r.lead}</p></Reveal>
            <Reveal delay={0.15}>
              <button type="button" className="btn" onClick={() => requestBooking({ eventType: 'ramadan' })}>
                {r.cta}
                <ArrowRight size={18} className="btn-icon" aria-hidden="true" />
              </button>
            </Reveal>
          </div>
        </div>
        <div className="ramadan-grid">
          {RAMADAN.map((p, i) => (
            <Reveal as="article" key={p.id} className="ramadan-card" delay={i * 0.1}>
              <div className="r-img"><img src={p.image} alt="" loading="lazy" /></div>
              <div className="r-body">
                <span className="r-time">{L(p.time)}</span>
                <h3>{L(p.name)}</h3>
                <p>{L(p.text)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
