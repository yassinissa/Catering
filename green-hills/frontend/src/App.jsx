import { MotionConfig } from 'framer-motion'
import { LangProvider, useLang } from './lib/i18n.jsx'
import { BookingProvider } from './lib/booking.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import About from './components/About.jsx'
import Cuisines from './components/Cuisines.jsx'
import Services from './components/Services.jsx'
import Events from './components/Events.jsx'
import Ramadan from './components/Ramadan.jsx'
import Reels from './components/Reels.jsx'
import Process from './components/Process.jsx'
import Locations from './components/Locations.jsx'
import Booking from './components/Booking.jsx'
import Footer from './components/Footer.jsx'
import BookBar from './components/BookBar.jsx'

function Page() {
  const { t, lang } = useLang()
  return (
    // key={lang} is NOT used on purpose: switching language keeps the form and scroll position
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <Header />
      <main id="main" lang={lang}>
        <Hero />
        <Marquee />
        <About />
        <Cuisines />
        <Services />
        <Events />
        <Ramadan />
        <Reels />
        <Process />
        <Locations />
        <Booking />
      </main>
      <Footer />
      <BookBar />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <BookingProvider>
          <Page />
        </BookingProvider>
      </LangProvider>
    </MotionConfig>
  )
}
