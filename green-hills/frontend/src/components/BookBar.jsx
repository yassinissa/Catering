import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../lib/i18n.jsx'
import { useBooking } from '../lib/booking.jsx'

/** Phone-only floating "Book your event" button: shows after the hero, hides at the form. */
export default function BookBar() {
  const { t } = useLang()
  const { requestBooking } = useBooking()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const book = document.getElementById('book')
    if (!hero || !book) return
    let heroVisible = true
    let bookVisible = false
    const update = () => setShow(!heroVisible && !bookVisible)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) heroVisible = e.isIntersecting
        if (e.target === book) bookVisible = e.isIntersecting
      })
      update()
    }, { threshold: 0.05 })
    io.observe(hero)
    io.observe(book)
    return () => io.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="book-bar"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button type="button" className="btn" onClick={() => requestBooking()}>{t.nav.book}</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
