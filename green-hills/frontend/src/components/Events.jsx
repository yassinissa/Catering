import { ArrowRight } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'
import { EVENTS } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'
import Icon from './Icons.jsx'

export default function Events() {
  const { t, L } = useLang()
  const { requestBooking } = useBooking()
  return (
    <section id="events" className="section events" aria-labelledby="events-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="eyebrow">{t.events.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="events-title" className="h-display h2">{rich(t.events.title)}</h2></Reveal>
        </div>
        <div className="events-grid">
          {EVENTS.map((e, i) => (
            <Reveal key={e.id} delay={(i % 4) * 0.06} style={{ display: 'flex' }}>
              <button type="button" className="event-tile" style={{ width: '100%' }} onClick={() => requestBooking({ eventType: e.id })}>
                <span className="event-icon"><Icon name={e.icon} size={28} /></span>
                <h3>{L(e.name)}</h3>
                <p>{L(e.text)}</p>
                <span className="event-cta">{t.events.cta}<ArrowRight size={16} aria-hidden="true" /></span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
