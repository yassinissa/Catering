import { Fragment } from 'react'

/** Renders "Plain text *accent phrase*" with the starred part as <em> (italic serif accent in headings). */
export function rich(text) {
  if (typeof text !== 'string' || !text.includes('*')) return text
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  )
}
