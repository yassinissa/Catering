import { useLang } from '../lib/i18n.jsx'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'

const AR_DIGITS = ['١', '٢', '٣', '٤']

export default function Process() {
  const { t, lang } = useLang()
  return (
    <section className="section light" aria-labelledby="process-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="eyebrow">{t.process.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="process-title" className="h-display h2">{rich(t.process.title)}</h2></Reveal>
        </div>
        <ol className="process-list">
          {t.process.steps.map((s, i) => (
            <Reveal as="li" key={s.t} className="process-step" delay={i * 0.1}>
              <span className="process-num" aria-hidden="true">{lang === 'ar' ? AR_DIGITS[i] : i + 1}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
