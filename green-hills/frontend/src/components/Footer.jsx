import { ArrowUp, Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useContent } from '../lib/content.jsx'
import { NAV } from './Header.jsx'
import Hills from './Hills.jsx'
import { SocialIcon, socialName } from './Icons.jsx'
import { scrollToId } from '../lib/scroll.js'

export default function Footer() {
  const { t, lang } = useLang()
  const { logo, contact, socials, brands } = useContent()
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <Hills to="var(--night)" top />
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="Green Hills" width="148" height="52" loading="lazy" />
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
              {contact.phone && <li><a href={`tel:${contact.phone.replace(/\s/g, '')}`} dir="ltr"><Phone size={16} aria-hidden="true" />{contact.phone}</a></li>}
              {contact.whatsapp && <li><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a></li>}
              {contact.email && <li><a href={`mailto:${contact.email}`}><Mail size={16} aria-hidden="true" />{contact.email}</a></li>}
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.handle ? `${socialName(s.platform)} ${s.handle}` : undefined}>
                    <SocialIcon platform={s.platform} />
                    <span dir="ltr">{s.handle || socialName(s.platform)}</span>
                  </a>
                </li>
              ))}
              {brands.filter((b) => b.instagram).map((b) => (
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
