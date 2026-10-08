import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/scroll.js'

/** Muted looping video that only plays while on screen (saves battery and data on phones). */
export default function AutoVideo({ src, poster, className, eager = false, label }) {
  const ref = useRef(null)
  const [canAutoplay] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    const v = ref.current
    if (!v || !canAutoplay) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const p = v.play()
          if (p && typeof p.catch === 'function') p.catch(() => {})
        } else {
          v.pause()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [canAutoplay])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      aria-label={label}
      disablePictureInPicture
      tabIndex={-1}
    />
  )
}
