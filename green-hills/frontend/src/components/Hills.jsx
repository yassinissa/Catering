/*
 * Signature element: rolling hill contours taken from the Green Hills logo.
 * Three layers drift at different speeds. `to` is the colour of the section below.
 */
const WAVE = (h, amp, phase) => {
  // two identical periods side by side so the CSS drift loops seamlessly
  const w = 1440
  let d = `M0 ${h}`
  for (let i = 0; i < 4; i++) {
    const x0 = i * (w / 2)
    const up = (i + phase) % 2 === 0
    d += ` C ${x0 + w / 8} ${up ? h - amp : h + amp}, ${x0 + (3 * w) / 8} ${up ? h - amp : h + amp}, ${x0 + w / 2} ${h}`
  }
  return `${d} L ${w * 2} 200 L 0 200 Z`
}

export default function Hills({ to = 'var(--paper)', top = false, tone = 'leaf' }) {
  const c1 = tone === 'leaf' ? '#2e6b33' : 'rgba(201,163,91,0.35)'
  const c2 = tone === 'leaf' ? '#76ae41' : 'rgba(201,163,91,0.6)'
  return (
    <div className={`hills${top ? ' hills--top' : ''}`} aria-hidden="true">
      <svg className="hl1" viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path d={WAVE(78, 34, 0)} fill={c1} opacity="0.55" />
      </svg>
      <svg className="hl2" viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path d={WAVE(112, 30, 1)} fill={c2} opacity="0.85" />
      </svg>
      <svg className="hl3" viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path d={WAVE(146, 22, 0)} fill={to} />
      </svg>
    </div>
  )
}
