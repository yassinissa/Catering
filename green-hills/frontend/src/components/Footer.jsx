import { ArrowUp, Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { BRANDS, CONTACT } from '../content/site.js'
import { NAV } from './Header.jsx'
import Hills from './Hills.jsx'
import { scrollToId } from '../lib/scroll.js'

const BASE = import.meta.env.BASE_URL

export default function Footer() {
  const { t, lang } = useLang()
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <Hills to="var(--night)" top />
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={`${BASE}media/logo-light@3x.png`} alt="Green Hills" width="148" height="52" loading="lazy" />
            <p>{t.footer.tag}</p>
          </div>
          <div>
            <h4>{t.nav.menu}</h4>
            <ul>
              {NAV.map((id) => <li key={id}><a href={`#${id}`}>{t.nav[id]}</a></li>)}
              <li><a href="#book">{t.nav.book}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.locations.eyebrow}</h4>
            <ul>
              {CONTACT.phone && <li><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} dir="ltr"><Phone size={16} aria-hidden="true" />{CONTACT.phone}</a></li>}
              {CONTACT.whatsapp && <li><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a></li>}
              {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}><Mail size={16} aria-hidden="true" />{CONTACT.email}</a></li>}
              {CONTACT.instagram && <li><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={16} aria-hidden="true" /><span dir="ltr">{CONTACT.instagramHandle}</span></a></li>}
              {BRANDS.map((b) => (
                <li key={b.id}><a href={b.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={16} aria-hidden="true" />{b.name} <span dir="ltr" style={{ opacity: 0.6 }}>{b.handle}</span></a></li>
              ))}
              <li><button type="button" onClick={() => scrollToId('top')}><ArrowUp size={16} aria-hidden="true" />{t.footer.top}</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-big" aria-hidden="true">{lang === 'ar' ? 'جرين هيلز' : 'Green Hills'}</div>
        <div className="footer-bottom">
          <span>© {year} Green Hills. {t.footer.rights}</span>
          <span>{lang === 'ar' ? 'الكويت' : 'Kuwait'}</span>
        </div>
      </div>
    </footer>
  )
}
