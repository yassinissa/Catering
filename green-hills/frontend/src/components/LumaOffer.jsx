import { ArrowUpRight } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useContent } from '../lib/content.jsx'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Kuwaiti dinars keep three decimals: 18.000 KD / ١٨٫٠٠٠ د.ك */
function formatPrice(price, currency, lang) {
  const amount = lang === 'ar'
    ? price.replace(/\d/g, (d) => ARABIC_DIGITS[d]).replace('.', '٫')
    : price
  return `${amount} ${currency}`
}

export default function LumaOffer() {
  const { t, L, lang } = useLang()
  const { offer, brands } = useContent()
  const o = t.offer
  const cakes = offer.filter((x) => x.category === 'cake')
  const drinks = offer.filter((x) => x.category === 'drink')
  const instagram = brands.find((b) => b.name.toLowerCase() === 'luma')?.instagram

  if (!offer.length) return null // every item hidden in the admin: the section disappears

  return (
    <section id="luma-offer" className="section offer" aria-labelledby="offer-title">
      <div className="wrap">
        <div className="offer-head">
          <div>
            <Reveal><span className="eyebrow">{o.eyebrow}</span></Reveal>
            <Reveal delay={0.05}><h2 id="offer-title" className="h-display h2">{rich(o.title)}</h2></Reveal>
          </div>
          <div className="offer-intro">
            <Reveal delay={0.1}><p className="lead">{o.lead}</p></Reveal>
            <Reveal delay={0.15}>
              <dl className="offer-dates">
                <div><dt>{o.openLabel}</dt><dd>{o.open}</dd></div>
                <div><dt>{o.launchLabel}</dt><dd>{o.launch}</dd></div>
              </dl>
            </Reveal>
            {instagram && (
              <Reveal delay={0.2}>
                <a className="btn" href={instagram} target="_blank" rel="noopener noreferrer">
                  {o.cta}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </Reveal>
            )}
          </div>
        </div>

        {cakes.length > 0 && (
          <>
            <Reveal><h3 className="offer-subtitle">{o.cakesTitle}</h3></Reveal>
            <div className="offer-cakes">
              {cakes.map((c, i) => (
                <Reveal as="article" key={c.id} className="cake-card" delay={(i % 2) * 0.08}>
                  <div className="cake-img"><img src={c.image} alt={L(c.name)} loading="lazy" /></div>
                  <div className="cake-body">
                    <div>
                      <h4>{L(c.name)}</h4>
                      <p>{o.cakeTag}</p>
                    </div>
                    <span className="offer-price">{formatPrice(c.price, o.currency, lang)}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {drinks.length > 0 && (
          <>
            <Reveal><h3 className="offer-subtitle">{o.drinksTitle}</h3></Reveal>
            <div className="offer-drinks">
              {drinks.map((d, i) => (
                <Reveal as="article" key={d.id} className="drink-card" delay={(i % 4) * 0.05}>
                  <div className="drink-img"><img src={d.image} alt={L(d.name)} loading="lazy" /></div>
                  <h4>{L(d.name)}</h4>
                  <span className="offer-price">{formatPrice(d.price, o.currency, lang)}</span>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
