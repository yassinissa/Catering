import { useLang } from '../lib/i18n.jsx'
import { SERVICES } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'
import Icon from './Icons.jsx'

export default function Services() {
  const { t, L } = useLang()
  return (
    <section id="services" className="section light" aria-labelledby="services-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="eyebrow">{t.services.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="services-title" className="h-display h2">{rich(t.services.title)}</h2></Reveal>
        </div>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} className="service-card" delay={i * 0.08}>
              <img src={s.image} alt="" loading="lazy" />
              <div className="service-body">
                <span className="service-icon"><Icon name={s.icon} size={20} /></span>
                <h3>{L(s.name)}</h3>
                <p>{L(s.text)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
