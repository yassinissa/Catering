import { useLang } from '../lib/i18n.jsx'
import { Leaf } from './Icons.jsx'

export default function Marquee() {
  const { t } = useLang()
  const group = (hidden) => (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {t.marquee.map((w) => (
        <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 28 }}>
          {w}
          <Leaf size={22} />
        </span>
      ))}
    </div>
  )
  return (
    <div className="marquee">
      <p className="sr-only">{t.marquee.join(', ')}</p>
      <div className="marquee-track" aria-hidden="true">
        {group(true)}
        {group(true)}
        {group(true)}
        {group(true)}
      </div>
    </div>
  )
}
