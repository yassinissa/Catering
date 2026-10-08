const API_BASE = import.meta.env.VITE_API_URL || ''
const DEMO = import.meta.env.VITE_DEMO === '1'

/** Sends a booking to Django. Returns { reference } or throws an Error with optional fieldErrors. */
export async function submitBooking(payload) {
  if (DEMO) {
    // Static preview build only: no server is attached.
    await new Promise((r) => setTimeout(r, 900))
    const d = new Date()
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    return { reference: `GH-${ymd}-DEMO`, demo: true }
  }
  let res
  try {
    res = await fetch(`${API_BASE}/api/bookings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('network')
  }
  let data = {}
  try { data = await res.json() } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = new Error(data.detail || 'server')
    err.fieldErrors = data.errors || null
    throw err
  }
  return data
}
