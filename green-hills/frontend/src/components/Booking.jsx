import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Minus, Pencil, Plus } from 'lucide-react'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'
import { submitBooking } from '../lib/api.js'
import {
  BUDGETS, CONTACT_METHODS, CUISINES, EVENTS, EXTRAS, GOVERNORATES, SERVICES, VENUES,
} from '../content/site.js'
import Reveal from './Reveal.jsx'
import { rich } from '../lib/rich.jsx'
import Icon from './Icons.jsx'

const EASE = [0.16, 1, 0.3, 1]
const DRAFT_KEY = 'gh-booking-draft'
const SERVICE_OPTIONS = [...SERVICES, { id: 'unsure', icon: 'buffet', name: { en: 'Help me choose', ar: 'ساعدوني في الاختيار' } }]

const EMPTY = {
  eventType: '', date: '', time: '', guests: 50, service: '', cuisines: [], budget: '',
  venueType: '', governorate: '', area: '', address: '', extras: [],
  name: '', phone: '', email: '', company: '', contactMethod: 'whatsapp', notes: '', consent: false,
  website: '', // honeypot: real people never see or fill this
}

const STEP_FIELDS = [
  ['eventType', 'date', 'time', 'guests', 'service', 'cuisines', 'budget'],
  ['venueType', 'governorate', 'area', 'address', 'extras'],
  ['name', 'phone', 'email', 'company', 'contactMethod', 'notes', 'consent'],
]

const SERVER_TO_FIELD = {
  event_type: 'eventType', event_date: 'date', start_time: 'time', guests: 'guests', service_style: 'service',
  cuisines: 'cuisines', budget: 'budget', venue_type: 'venueType', governorate: 'governorate', area: 'area',
  address: 'address', extras: 'extras', full_name: 'name', phone: 'phone', email: 'email', company: 'company',
  contact_method: 'contactMethod', notes: 'notes', consent: 'consent',
}

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return EMPTY
    const d = JSON.parse(raw)
    return { ...EMPTY, ...d, consent: false, website: '' }
  } catch {
    return EMPTY
  }
}

function validate(step, f) {
  const e = {}
  if (step === 0) {
    if (!f.eventType) e.eventType = 'pick'
    if (!f.date) e.date = 'required'
    else if (f.date < tomorrowISO()) e.date = 'date'
    const g = Number(f.guests)
    if (!Number.isFinite(g) || g < 10 || g > 5000) e.guests = 'guests'
    if (!f.service) e.service = 'pick'
    if (!f.cuisines.length) e.cuisines = 'pickOne'
  }
  if (step === 1) {
    if (!f.venueType) e.venueType = 'pick'
    if (!f.governorate) e.governorate = 'pick'
    if (!f.area.trim()) e.area = 'required'
  }
  if (step === 2) {
    if (f.name.trim().length < 2) e.name = 'required'
    if (!/^[24569]\d{7}$/.test(f.phone)) e.phone = 'phone'
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'email'
    if (!f.contactMethod) e.contactMethod = 'pick'
    if (f.contactMethod === 'email' && !f.email.trim()) e.email = 'required'
    if (!f.consent) e.consent = 'consent'
  }
  return e
}

/* ── small field building blocks ── */
function FieldError({ id, msg }) {
  if (!msg) return null
  return (
    <p id={id} className="field-error" role="alert">
      <AlertCircle size={15} aria-hidden="true" />
      {msg}
    </p>
  )
}

function ChoiceGroup({ name, legend, hint, options, value, onChange, multiple, error, cards, L, optional }) {
  const errId = `${name}-err`
  return (
    <fieldset className={`field${error ? ' has-error' : ''}`} id={`f-${name}`} aria-describedby={error ? errId : undefined}>
      <legend>
        {legend}
        {optional && <span className="opt">· {optional}</span>}
      </legend>
      {hint && <p className="field-hint">{hint}</p>}
      <div className={cards ? 'chips chips--cards' : 'chips'}>
        {options.map((o) => {
          const checked = multiple ? value.includes(o.id) : value === o.id
          return (
            <label key={o.id} className="chip">
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={o.id}
                checked={checked}
                onChange={() => {
                  if (multiple) onChange(checked ? value.filter((v) => v !== o.id) : [...value, o.id])
                  else onChange(o.id)
                }}
              />
              <span>
                {cards && o.icon && <Icon name={o.icon} size={22} />}
                {!cards && checked && multiple && <Check size={15} aria-hidden="true" />}
                {L(o.name)}
              </span>
            </label>
          )
        })}
      </div>
      <FieldError id={errId} msg={error} />
    </fieldset>
  )
}

function TextField({ name, label, value, onChange, error, optional, type = 'text', as, ...rest }) {
  const errId = `${name}-err`
  const Comp = as === 'textarea' ? 'textarea' : 'input'
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor={`f-${name}`}>
        {label}
        {optional && <span className="opt">· {optional}</span>}
      </label>
      <Comp
        id={`f-${name}`}
        name={name}
        type={as === 'textarea' ? undefined : type}
        className={as === 'textarea' ? 'textarea' : 'input'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errId : undefined}
        {...rest}
      />
      <FieldError id={errId} msg={error} />
    </div>
  )
}

function SelectField({ name, label, value, onChange, options, error, L, placeholder }) {
  const errId = `${name}-err`
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor={`f-${name}`}>{label}</label>
      <select
        id={`f-${name}`}
        name={name}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errId : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{L(o.name)}</option>)}
      </select>
      <FieldError id={errId} msg={error} />
    </div>
  )
}

/* ── main component ── */
export default function Booking() {
  const { t, L, lang, isRTL } = useLang()
  const { prefill } = useBooking()
  const b = t.book
  const [form, setForm] = useState(loadDraft)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [serverError, setServerError] = useState('')
  const [reference, setReference] = useState('')
  const cardRef = useRef(null)
  const headingRef = useRef(null)
  const didMount = useRef(false)
  const minDate = useMemo(tomorrowISO, [])

  const set = useCallback((key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }, [])

  // remember an unfinished form on this device
  useEffect(() => {
    if (status === 'done') return
    try {
      const { consent, website, ...rest } = form
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest))
    } catch { /* storage unavailable */ }
  }, [form, status])

  // "Book this" buttons elsewhere on the page pre-fill the form
  useEffect(() => {
    if (!prefill) return
    setForm((f) => ({
      ...f,
      eventType: prefill.eventType || f.eventType,
      cuisines: prefill.cuisine && !f.cuisines.includes(prefill.cuisine) ? [...f.cuisines, prefill.cuisine] : f.cuisines,
    }))
    setErrors({})
    if (status === 'done') { setStatus('idle'); setReference('') }
    if (prefill.eventType || prefill.cuisine) { setDir(-1); setStep(0) }
  }, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps

  // after changing step: bring the card into view on phones and move focus to the step heading
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    const card = cardRef.current
    if (card) {
      const top = card.getBoundingClientRect().top
      if (top < 0 || top > window.innerHeight * 0.6) {
        window.scrollTo({ top: window.scrollY + top - 90, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      }
    }
    const id = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 380)
    return () => clearTimeout(id)
  }, [step, status])

  const errMsg = (k) => (errors[k] ? b.err[errors[k]] : '')

  const focusFirstError = (errs) => {
    const first = STEP_FIELDS.flat().find((k) => errs[k])
    if (!first) return
    setTimeout(() => {
      const el = document.getElementById(`f-${first}`)
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const focusable = el.matches('input,select,textarea') ? el : el.querySelector('input,select,textarea')
      focusable?.focus({ preventScroll: true })
    }, 60)
  }

  const goTo = (n) => { setDir(n > step ? 1 : -1); setStep(n); setServerError('') }

  const next = () => {
    const errs = validate(step, form)
    if (Object.keys(errs).length) { setErrors(errs); focusFirstError(errs); return }
    setErrors({})
    goTo(step + 1)
  }

  const submit = async () => {
    // re-check everything before sending
    for (let s = 0; s < 3; s++) {
      const errs = validate(s, form)
      if (Object.keys(errs).length) { setErrors(errs); goTo(s); focusFirstError(errs); return }
    }
    setStatus('sending')
    setServerError('')
    try {
      const res = await submitBooking({
        event_type: form.eventType,
        event_date: form.date,
        start_time: form.time || null,
        guests: Number(form.guests),
        service_style: form.service,
        cuisines: form.cuisines,
        budget: form.budget,
        venue_type: form.venueType,
        governorate: form.governorate,
        area: form.area.trim(),
        address: form.address.trim(),
        extras: form.extras,
        full_name: form.name.trim(),
        phone: `+965${form.phone}`,
        email: form.email.trim(),
        company: form.company.trim(),
        contact_method: form.contactMethod,
        notes: form.notes.trim(),
        consent: form.consent,
        language: lang,
        website: form.website,
      })
      setReference(res.reference)
      setStatus('done')
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    } catch (err) {
      setStatus('idle')
      if (err.fieldErrors) {
        const mapped = {}
        Object.keys(err.fieldErrors).forEach((k) => { if (SERVER_TO_FIELD[k]) mapped[SERVER_TO_FIELD[k]] = 'required' })
        if (mapped.phone) mapped.phone = 'phone'
        if (mapped.email) mapped.email = 'email'
        if (mapped.date) mapped.date = 'date'
        if (mapped.guests) mapped.guests = 'guests'
        if (Object.keys(mapped).length) {
          setErrors(mapped)
          const s = STEP_FIELDS.findIndex((fs) => fs.some((k) => mapped[k]))
          if (s >= 0) goTo(s)
          setServerError(b.err.fix)
          focusFirstError(mapped)
          return
        }
      }
      setServerError(b.err.server)
    }
  }

  const reset = () => {
    setForm({ ...EMPTY, name: form.name, phone: form.phone, email: form.email, company: form.company, contactMethod: form.contactMethod })
    setErrors({})
    setReference('')
    setStatus('idle')
    setDir(-1)
    setStep(0)
  }

  const label = (list, id) => L(list.find((o) => o.id === id)?.name) || '—'
  const fmtDate = (iso) => {
    if (!iso) return '—'
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-KW' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`))
    } catch { return iso }
  }

  const slide = {
    initial: (d) => ({ opacity: 0, x: (isRTL ? -1 : 1) * d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: (isRTL ? -1 : 1) * d * -40 }),
  }

  const progress = status === 'done' ? 1 : (step + 1) / 4
  const BackIcon = ArrowLeft
  const NextIcon = ArrowRight

  return (
    <section id="book" className="section booking" aria-labelledby="book-title">
      <div className="wrap booking-grid">
        <div className="booking-aside">
          <Reveal><span className="eyebrow">{b.eyebrow}</span></Reveal>
          <Reveal delay={0.05}><h2 id="book-title" className="h-display h2">{rich(b.title)}</h2></Reveal>
          <Reveal delay={0.1}><p className="lead">{b.lead}</p></Reveal>
          <ol className="steps-rail" aria-hidden="true">
            {b.steps.map((s, i) => {
              const done = status === 'done' || i < step
              return (
                <li key={s} className={done ? 'is-done' : i === step ? 'is-current' : ''}>
                  <span>{done ? <Check size={15} /> : i + 1}</span>
                  {s}
                </li>
              )
            })}
          </ol>
        </div>

        <Reveal delay={0.1}>
          <div className="form-card" ref={cardRef}>
            <div className="form-progress">
              <span className="form-progress-label" aria-live="polite">
                {status === 'done' ? b.done.title : <>{b.stepOf(step + 1, 4)} · <b>{b.steps[step]}</b></>}
              </span>
              <span className="progress-bar" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></span>
            </div>

            <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < 3) next(); else submit() }}>
              {/* honeypot */}
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="f-website">Website</label>
                <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website')(e.target.value)} />
              </div>

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                {status === 'done' ? (
                  <motion.div key="done" className="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                    <motion.span className="done-mark" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}>
                      <Check size={40} strokeWidth={2.4} aria-hidden="true" />
                    </motion.span>
                    <h3 ref={headingRef} tabIndex={-1}>{b.done.title}</h3>
                    <div className="done-ref">
                      <small>{b.done.ref}</small>
                      <b>{reference}</b>
                    </div>
                    <p>{b.done.text}</p>
                    <button type="button" className="btn btn--ghost" onClick={reset}>{b.done.again}</button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <h3 ref={headingRef} tabIndex={-1} className="sr-only">{b.steps[step]}</h3>

                    {step === 0 && (
                      <div className="form-step">
                        <ChoiceGroup name="eventType" legend={b.f.eventType} options={EVENTS} value={form.eventType} onChange={set('eventType')} error={errMsg('eventType')} cards L={L} />
                        <div className="field-row field-row--3">
                          <TextField name="date" label={b.f.date} type="date" min={minDate} value={form.date} onChange={set('date')} error={errMsg('date')} />
                          <TextField name="time" label={b.f.time} type="time" value={form.time} onChange={set('time')} optional={b.f.optional} />
                          <div className={`field${errors.guests ? ' has-error' : ''}`}>
                            <label className="field-label" htmlFor="f-guests">{b.f.guests}</label>
                            <div className="stepper">
                              <button type="button" aria-label="−10" onClick={() => set('guests')(Math.max(10, (Number(form.guests) || 0) - 10))}><Minus size={18} aria-hidden="true" /></button>
                              <input
                                id="f-guests"
                                type="number"
                                inputMode="numeric"
                                min={10}
                                max={5000}
                                step={10}
                                value={form.guests}
                                onChange={(e) => set('guests')(e.target.value === '' ? '' : Math.min(5000, Number(e.target.value.replace(/\D/g, ''))))}
                                aria-invalid={errors.guests ? 'true' : undefined}
                                aria-describedby={errors.guests ? 'guests-err' : undefined}
                              />
                              <button type="button" aria-label="+10" onClick={() => set('guests')(Math.min(5000, (Number(form.guests) || 0) + 10))}><Plus size={18} aria-hidden="true" /></button>
                            </div>
                            <FieldError id="guests-err" msg={errMsg('guests')} />
                          </div>
                        </div>
                        <ChoiceGroup name="service" legend={b.f.service} options={SERVICE_OPTIONS} value={form.service} onChange={set('service')} error={errMsg('service')} L={L} />
                        <ChoiceGroup name="cuisines" legend={b.f.cuisines} hint={b.f.cuisinesHint} options={CUISINES} value={form.cuisines} onChange={set('cuisines')} error={errMsg('cuisines')} multiple L={L} />
                        <ChoiceGroup name="budget" legend={b.f.budget} options={BUDGETS} value={form.budget} onChange={set('budget')} L={L} optional={b.f.optional} />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="form-step">
                        <ChoiceGroup name="venueType" legend={b.f.venueType} options={VENUES} value={form.venueType} onChange={set('venueType')} error={errMsg('venueType')} L={L} />
                        <div className="field-row field-row--2">
                          <SelectField name="governorate" label={b.f.governorate} value={form.governorate} onChange={set('governorate')} options={GOVERNORATES} error={errMsg('governorate')} L={L} placeholder={lang === 'ar' ? 'اختر المحافظة' : 'Choose governorate'} />
                          <TextField name="area" label={b.f.area} value={form.area} onChange={set('area')} error={errMsg('area')} placeholder={b.f.areaPh} autoComplete="address-level3" maxLength={80} />
                        </div>
                        <TextField name="address" label={b.f.address} value={form.address} onChange={set('address')} optional={b.f.optional} placeholder={b.f.addressPh} autoComplete="street-address" maxLength={200} />
                        <ChoiceGroup name="extras" legend={b.f.extras} options={EXTRAS} value={form.extras} onChange={set('extras')} multiple L={L} optional={b.f.optional} />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="form-step">
                        <div className="field-row field-row--2">
                          <TextField name="name" label={b.f.name} value={form.name} onChange={set('name')} error={errMsg('name')} autoComplete="name" maxLength={120} dir="auto" />
                          <div className={`field${errors.phone ? ' has-error' : ''}`}>
                            <label className="field-label" htmlFor="f-phone">{b.f.phone}</label>
                            <div className="phone-input">
                              <span className="prefix">+965</span>
                              <input
                                id="f-phone"
                                className="input"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                placeholder={b.f.phonePh}
                                value={form.phone}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/[^\d٠-٩]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
                                  if (v.startsWith('965') && v.length > 8) v = v.slice(3)
                                  set('phone')(v.slice(0, 8))
                                }}
                                aria-invalid={errors.phone ? 'true' : undefined}
                                aria-describedby={errors.phone ? 'phone-err' : undefined}
                              />
                            </div>
                            <FieldError id="phone-err" msg={errMsg('phone')} />
                          </div>
                        </div>
                        <div className="field-row field-row--2">
                          <TextField name="email" label={b.f.email} type="email" value={form.email} onChange={set('email')} error={errMsg('email')} optional={form.contactMethod === 'email' ? undefined : b.f.optional} placeholder={b.f.emailPh} autoComplete="email" inputMode="email" dir="ltr" maxLength={160} />
                          <TextField name="company" label={b.f.company} value={form.company} onChange={set('company')} optional={b.f.companyHint} autoComplete="organization" maxLength={120} dir="auto" />
                        </div>
                        <ChoiceGroup name="contactMethod" legend={b.f.contactMethod} options={CONTACT_METHODS} value={form.contactMethod} onChange={set('contactMethod')} error={errMsg('contactMethod')} L={L} />
                        <TextField name="notes" as="textarea" label={b.f.notes} value={form.notes} onChange={set('notes')} optional={b.f.optional} placeholder={b.f.notesPh} maxLength={1500} dir="auto" />
                        <div className={`field${errors.consent ? ' has-error' : ''}`}>
                          <label className="check" htmlFor="f-consent">
                            <input id="f-consent" type="checkbox" checked={form.consent} onChange={(e) => set('consent')(e.target.checked)} aria-invalid={errors.consent ? 'true' : undefined} aria-describedby={errors.consent ? 'consent-err' : undefined} />
                            {b.f.consent}
                          </label>
                          <FieldError id="consent-err" msg={errMsg('consent')} />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="review">
                        <p style={{ fontWeight: 600, fontSize: 17 }}>{b.reviewTitle}</p>
                        {[
                          {
                            s: 0,
                            rows: [
                              [b.f.eventType, label(EVENTS, form.eventType)],
                              [b.f.date, fmtDate(form.date)],
                              [b.f.time, form.time || '—'],
                              [b.f.guests, `${Number(form.guests).toLocaleString(lang === 'ar' ? 'ar-KW' : 'en')} ${b.guestsUnit}`],
                              [b.f.service, label(SERVICE_OPTIONS, form.service)],
                              [b.f.cuisines, form.cuisines.map((c) => label(CUISINES, c)).join(lang === 'ar' ? '، ' : ', ')],
                              [b.f.budget, form.budget ? label(BUDGETS, form.budget) : '—'],
                            ],
                          },
                          {
                            s: 1,
                            rows: [
                              [b.f.venueType, label(VENUES, form.venueType)],
                              [b.f.governorate, label(GOVERNORATES, form.governorate)],
                              [b.f.area, form.area || '—'],
                              [b.f.address, form.address || '—'],
                              [b.f.extras, form.extras.length ? form.extras.map((x) => label(EXTRAS, x)).join(lang === 'ar' ? '، ' : ', ') : '—'],
                            ],
                          },
                          {
                            s: 2,
                            rows: [
                              [b.f.name, form.name],
                              [b.f.phone, <span dir="ltr" key="p">+965 {form.phone.slice(0, 4)} {form.phone.slice(4)}</span>],
                              [b.f.email, form.email || '—'],
                              [b.f.company, form.company || '—'],
                              [b.f.contactMethod, label(CONTACT_METHODS, form.contactMethod)],
                              [b.f.notes, form.notes || '—'],
                            ],
                          },
                        ].map((blk) => (
                          <div className="review-block" key={blk.s}>
                            <header>
                              <h4>{b.steps[blk.s]}</h4>
                              <button type="button" onClick={() => goTo(blk.s)}>
                                <Pencil size={14} aria-hidden="true" />
                                {b.edit}
                                <span className="sr-only"> {b.steps[blk.s]}</span>
                              </button>
                            </header>
                            <dl>
                              {blk.rows.map(([k, v]) => (
                                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                              ))}
                            </dl>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {serverError && status !== 'done' && (
                <p className="form-alert" role="alert"><AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />{serverError}</p>
              )}

              {status !== 'done' && (
                <div className="form-nav">
                  {step > 0 ? (
                    <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)}>
                      <BackIcon size={18} aria-hidden="true" style={isRTL ? { transform: 'scaleX(-1)' } : undefined} />
                      {b.back}
                    </button>
                  ) : <span className="spacer" />}
                  {step < 3 ? (
                    <button type="submit" className="btn btn--dark">
                      {b.next}
                      <NextIcon size={18} className="btn-icon" aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" className="btn btn--dark" disabled={status === 'sending'}>
                      {status === 'sending' ? b.sending : b.submit}
                      {status !== 'sending' && <Check size={18} aria-hidden="true" />}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
