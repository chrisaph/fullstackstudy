import { useEffect, useState } from 'react'

const TZ = 'Asia/Manila'
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
export const dayKey = (ms: number) => dayFmt.format(ms) // YYYY-MM-DD in Manila
export const addDays = (key: string, n: number) => {
  const d = new Date(key + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10)
}
export const weekday = (key: string) => new Date(key + 'T00:00:00Z').getUTCDay()

export function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  return now
}
export function PhClock() {
  const now = useNow()
  const t = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(now)
  const d = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(now)
  return (
    <div className="text-right leading-tight" role="timer" aria-label={`Philippine time ${t}`}>
      <p className="font-mono text-sm font-medium tabular-nums">{t} <span className="text-xs text-accent">PHT</span></p>
      <p className="text-xs text-muted">{d}</p>
    </div>
  )
}
