import { Clock, Instagram, MapPin, Phone } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { BRANDS, GOVERNORATES } from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'

const fmtPhone = (p) => (p.length === 8 ? `${p.slice(0, 4)} ${p.slice(4)}` : p)

function PhoneLink({ number, label }) {
  return (
    <a className="brand-phone" href={`tel:+965${number}`} aria-label={`${label} ${fmtPhone(number)}`}>
      <Phone size={14} aria-hidden="true" />
      <span dir="ltr">{fmtPhone(number)}</span>
    </a>
  )
}

export default function Locations() {
  const { t, L } = useLang()
  const l = t.locations
  return (
    <section id="locations" className="section light" aria-labelledby="locations-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="eyebrow">{l.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="locations-title" className="h-display h2">{rich(l.title)}</h2></Reveal>
        </div>

        <div className="brand-grid">
          {BRANDS.map((b, i) => (
            <Reveal as="article" key={b.id} className="brand-card" delay={i * 0.08} aria-labelledby={`brand-${b.id}`}>
              <header className="brand-head">
                <img
                  className="brand-logo"
                  src={b.logo}
                  alt={`${b.name} logo`}
                  width="76"
                  height="76"
                  loading="lazy"
                />
                <div className="brand-title">
                  <h3 id={`brand-${b.id}`}>{b.name}</h3>
                  <span className="brand-count">{l.branches(b.branches.length)}</span>
                </div>
              </header>

              {b.hotline && (
                <div className="brand-hotline">
                  <span>{l.hotline}</span>
                  <div className="brand-phones">
                    {b.hotline.map((n) => <PhoneLink key={n} number={n} label={l.call} />)}
                  </div>
                </div>
              )}

              <ul className="branch-list">
                {b.branches.map((br) => (
                  <li key={br.name.en} className="branch">
                    <p className="branch-name">{L(br.name)}</p>
                    {br.hours && (
                      <p className="branch-hours"><Clock size={14} aria-hidden="true" />{L(br.hours)}</p>
                    )}
                    <div className="branch-actions">
                      {br.phone && <PhoneLink number={br.phone} label={l.call} />}
                      <a className="brand-map" href={br.maps} target="_blank" rel="noopener noreferrer">
                        <MapPin size={14} aria-hidden="true" />
                        {l.directions}
                        <span className="sr-only"> – {b.name}, {L(br.name)}</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>

              <a className="brand-insta" href={b.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram size={18} aria-hidden="true" />
                <span>{l.follow}</span>
                <span className="brand-handle" dir="ltr">{b.handle}</span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="coverage">
          <p>{l.coverage}</p>
          <div className="gov-row">
            {GOVERNORATES.map((g) => (
              <span key={g.id} className="gov-chip"><i aria-hidden="true" />{L(g.name)}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
