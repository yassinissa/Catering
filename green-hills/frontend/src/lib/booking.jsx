import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { scrollToId } from './scroll.js'

const BookingContext = createContext(null)

/** Lets any section ("Book this", "Ask for this menu") pre-fill the booking form and jump to it. */
export function BookingProvider({ children }) {
  const [prefill, setPrefill] = useState(null)
  const requestBooking = useCallback((data = {}) => {
    setPrefill({ ...data, nonce: Date.now() })
    scrollToId('book')
  }, [])
  const value = useMemo(() => ({ prefill, requestBooking }), [prefill, requestBooking])
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => useContext(BookingContext)
