import {
  Building2, ChefHat, Coffee, ConciergeBell, Heart, Hotel, Mic, Moon, PartyPopper, Sun, Users, UtensilsCrossed,
} from 'lucide-react'

const MAP = {
  buffet: UtensilsCrossed,
  plated: ConciergeBell,
  live: ChefHat,
  lifestyle: Coffee,
  rings: Heart,
  building: Building2,
  users: Users,
  hotel: Hotel,
  sun: Sun,
  moon: Moon,
  party: PartyPopper,
  mic: Mic,
}

export default function Icon({ name, size = 22, ...rest }) {
  const C = MAP[name] || UtensilsCrossed
  return <C size={size} strokeWidth={1.75} aria-hidden="true" {...rest} />
}

/** Small leaf glyph used as a bullet/separator. */
export function Leaf({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M3 17c5-9 12-11 18-11-1 7-5 13-13 13-2 0-4-1-5-2Zm3 0c3-3 6-5 10-7-4 3-6 5-8 8Z" />
    </svg>
  )
}
