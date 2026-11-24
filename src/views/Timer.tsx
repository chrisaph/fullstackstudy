import { useEffect, useRef, useState } from 'react'
import { useLocal } from '../lib/store'

type T = { label: string; total: number; remaining: number; endAt: number | null; status: 'idle' | 'running' | 'paused' | 'done' }
const INIT: T = { label: '', total: 25 * 60000, remaining: 25 * 60000, endAt: null, status: 'idle' }
const PRESETS = [['5 min', 5], ['15 min', 15], ['25 min', 25], ['30 min', 30], ['45 min', 45], ['60 min', 60]] as const
const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return (h ? `${h}:` : '') + `${String(m).padStart(h ? 2 : 2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function TimerWidget() {
  const [t, setT] = useLocal<T>('fs.timer', INIT)
  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState(false)
  const [hms, setHms] = useState({ h: '0', m: '25', s: '0' })
  const [, force] = useState(0)
  const ctx = useRef<AudioContext | null>(null)
  const box = useRef<HTMLDivElement>(null)

  const beep = () => {
    const c = ctx.current; if (!c) return
    for (let i = 0; i < 4; i++) {
      const o = c.createOscillator(), g = c.createGain()
      o.frequency.value = 880; o.connect(g); g.connect(c.destination)
      const at = c.currentTime + i * 0.5
      g.gain.setValueAtTime(0.2, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.35)
      o.start(at); o.stop(at + 0.4)
    }
  }
  const finish = () => {
    setT((p) => ({ ...p, status: 'done', remaining: 0, endAt: null }))
    setAlert(true); beep()
    if ('Notification' in window && Notification.permission === 'granted') new Notification('Timer finished', { body: t.label || 'Time is up.' })
  }
  const left = t.status === 'running' && t.endAt ? Math.max(0, t.endAt - Date.now()) : t.remaining

  useEffect(() => {
    if (t.status !== 'running') return
    const id = setInterval(() => { if (t.endAt && Date.now() >= t.endAt) finish(); else force((n) => n + 1) }, 250)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.status, t.endAt])
  useEffect(() => {
    document.title = t.status === 'running' ? `${fmt(left)} · StackLedger` : t.status === 'done' ? 'Time is up · StackLedger' : 'StackLedger'
  })
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const setDuration = (ms: number) => setT((p) => ({ ...p, total: ms, remaining: ms, endAt: null, status: 'idle' }))
  const start = () => {
    ctx.current ??= new (window.AudioContext || (window as any).webkitAudioContext)()
    ctx.current.resume()
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    const rem = t.status === 'paused' ? t.remaining : t.total
    if (rem <= 0) return
    setAlert(false); setT((p) => ({ ...p, status: 'running', remaining: rem, endAt: Date.now() + rem }))
  }
  const pause = () => setT((p) => ({ ...p, status: 'paused', remaining: left, endAt: null }))
  const reset = () => { setAlert(false); setDuration(t.total) }
  const applyCustom = () => { const ms = ((+hms.h || 0) * 3600 + (+hms.m || 0) * 60 + (+hms.s || 0)) * 1000; if (ms > 0) setDuration(ms) }
  const shown = t.status === 'idle' ? t.total : left
  const pct = t.total ? 1 - shown / t.total : 0

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Timer ${fmt(shown)}`}
        className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm ${t.status === 'running' ? 'border-accent text-accent' : t.status === 'done' ? 'border-accent bg-accent text-white' : 'border-line'}`}>
        <span className="text-xs uppercase tracking-wide">Timer</span><span className="font-mono tabular-nums">{fmt(shown)}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-line bg-card p-4 shadow-lg">
          <p className="font-mono text-4xl tabular-nums">{fmt(shown)}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/60"><div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} /></div>
          <input aria-label="Timer label" placeholder="Label (e.g. LeetCode, reading)" value={t.label} onChange={(e) => setT((p) => ({ ...p, label: e.target.value }))} className="mt-3 min-h-9 w-full rounded-lg border border-line bg-paper px-2 text-sm" />
          <div className="mt-3 flex flex-wrap gap-1">{PRESETS.map(([l, m]) => <button key={l} onClick={() => { setDuration(m * 60000); setHms({ h: String(Math.floor(m / 60)), m: String(m % 60), s: '0' }) }} className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-ink">{l}</button>)}</div>
          <div className="mt-3 flex items-end gap-1.5">
            {(['h', 'm', 's'] as const).map((k) => (
              <label key={k} className="text-xs text-muted">{k === 'h' ? 'Hours' : k === 'm' ? 'Min' : 'Sec'}
                <input type="number" min={0} value={hms[k]} onChange={(e) => setHms({ ...hms, [k]: e.target.value })} className="mt-0.5 min-h-9 w-full rounded-lg border border-line bg-paper px-2 text-sm text-ink" /></label>
            ))}
            <button onClick={applyCustom} className="min-h-9 rounded-lg border border-line px-3 text-sm hover:border-ink">Set</button>
          </div>
          <div className="mt-4 flex gap-2">
            {t.status === 'running' ? <button onClick={pause} className="min-h-10 flex-1 rounded-lg bg-ink text-sm font-medium text-paper">Pause</button>
              : <button onClick={start} className="min-h-10 flex-1 rounded-lg bg-ink text-sm font-medium text-paper hover:bg-accent">{t.status === 'paused' ? 'Resume' : 'Start'}</button>}
            <button onClick={reset} className="min-h-10 rounded-lg border border-line px-4 text-sm hover:border-ink">Reset</button>
          </div>
        </div>
      )}
      {alert && (
        <div role="alertdialog" aria-live="assertive" className="fixed inset-x-0 top-16 z-40 mx-auto w-[min(92vw,380px)] rounded-xl border border-accent bg-card p-5 shadow-xl">
          <p className="font-serif text-xl font-semibold text-accent">Time is up</p>
          <p className="mt-1 text-sm text-muted">{t.label ? `"${t.label}" finished.` : 'Your timer reached 0.'}</p>
          <div className="mt-4 flex gap-2">
            <button autoFocus onClick={() => { setAlert(false); setT((p) => ({ ...p, status: 'idle', remaining: p.total })) }} className="min-h-10 rounded-lg bg-ink px-4 text-sm font-medium text-paper">Dismiss</button>
            <button onClick={start} className="min-h-10 rounded-lg border border-line px-4 text-sm">Restart</button>
          </div>
        </div>
      )}
    </div>
  )
}
