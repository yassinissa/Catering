import { motion } from 'framer-motion'
import { Flame, Users, Utensils } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { img } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'

const PILLAR_ICONS = [Flame, Users, Utensils]
const EASE = [0.16, 1, 0.3, 1]

export default function About() {
  const { t, lang } = useLang()
  const a = t.about
  return (
    <section id="about" className="section light" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div className="about-text">
          <Reveal><span className="eyebrow">{a.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="about-title" className="h-display h2">{rich(a.title)}</h2></Reveal>
          <Reveal delay={0.1}><p>{a.p1}</p></Reveal>
          <Reveal delay={0.15}><p>{a.p2}</p></Reveal>
          <ul className="pillars">
            {a.pillars.map((p, i) => {
              const Ico = PILLAR_ICONS[i]
              return (
                <Reveal as="li" key={p.t} className="pillar" delay={0.1 + i * 0.08}>
                  <span className="pillar-icon"><Ico size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                  <div>
                    <h3>{p.t}</h3>
                    <p>{p.d}</p>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>

        <motion.div
          className="about-media"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div
            className="m-main"
            variants={{ hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, shown: { clipPath: 'inset(0% 0% 0% 0%)' } }}
            transition={{ duration: 1.3, ease: EASE }}
          >
            <motion.img
              src={img('pomegranate.jpg')}
              alt={lang === 'ar' ? 'جيلي الرمان بالفستق والنعناع' : 'Pomegranate jelly with pistachio and mint'}
              loading="lazy"
              variants={{ hidden: { scale: 1.2 }, shown: { scale: 1 } }}
              transition={{ duration: 1.8, ease: EASE }}
            />
          </motion.div>
          <motion.div
            className="m-small"
            variants={{ hidden: { opacity: 0, y: 40 }, shown: { opacity: 1, y: 0 } }}
            transition={{ duration: 1, delay: 0.45, ease: EASE }}
          >
            <img src={img('croquettes.jpg')} alt={lang === 'ar' ? 'كروكيت مقرمش مع صلصة' : 'Crispy croquettes with dip'} loading="lazy" />
          </motion.div>
          <motion.div
            className="about-badge"
            variants={{ hidden: { opacity: 0, scale: 0.6, rotate: -20 }, shown: { opacity: 1, scale: 1, rotate: 0 } }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          >
            <span><b>{lang === 'ar' ? '٥' : '5'}</b>{lang === 'ar' ? 'مطابخ' : 'kitchens'}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
