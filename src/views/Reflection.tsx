import { useMemo, useState } from 'react'
import { VARK, TOPICS } from '../lib/data'
import { addDays, weekday } from '../lib/time'
import type { LogEvent, Mode, Reflection as R, Style } from '../lib/store'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'

function Ring({ value, label, sub, color = '#b4411f' }: { value: number; label: string; sub: string; color?: string }) {
  const r = 34, c = 2 * Math.PI * r
  return (
    <figure className="flex flex-col items-center text-center" role="img" aria-label={`${label}: ${Math.round(value * 100)} percent, ${sub}`}>
      <svg viewBox="0 0 84 84" className="size-24">
        <circle cx="42" cy="42" r={r} fill="none" stroke="#ddd3c0" strokeWidth="8" opacity="0.6" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} transform="rotate(-90 42 42)" style={{ transition: 'stroke-dashoffset .6s' }} />
        <text x="42" y="47" textAnchor="middle" fontSize="15" fontWeight="600" fill="#1d2433" fontFamily="Fraunces, serif">{Math.round(value * 100)}%</text>
      </svg>
      <figcaption className="mt-1 text-sm font-medium">{label}</figcaption><span className="text-xs text-muted">{sub}</span>
    </figure>
  )
}
const RING_COLORS: Record<string, string> = { V: '#2b5c8a', A: '#a8741a', R: '#2f6b4f', K: '#b4411f' }

const SHADE = ['bg-line/50', 'bg-[#e9b9a5]', 'bg-[#d4825f]', 'bg-accent', 'bg-[#7a2a12]']
const level = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4)

export default function Reflection({ log, setLog, mode, setMode, baseDay, resetNow, today, refl, setRefl }: {
  log: LogEvent[]; setLog: (f: (p: LogEvent[]) => LogEvent[]) => void
  mode: Mode; setMode: (m: Mode) => void; baseDay: string; resetNow: () => void; today: string
  refl: Record<string, R>; setRefl: (f: (p: Record<string, R>) => Record<string, R>) => void
}) {
  const [sel, setSel] = useState(today)
  const [confirm, setConfirm] = useState(false)
  const counts = useMemo(() => { const m: Record<string, number> = {}; log.forEach((e) => (m[e.day] = (m[e.day] ?? 0) + 1)); return m }, [log])
  // grid: 53 weeks ending on this week, Sunday first
  const start = addDays(today, -(52 * 7 + weekday(today)))
  const weeks = Array.from({ length: 53 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))
  const counted = log.filter((e) => mode === 'cumulative' || e.day >= baseDay)
  const todayCount = counts[today] ?? 0
  let streak = 0
  for (let k = counts[today] ? today : addDays(today, -1); counts[k]; k = addDays(k, -1)) streak++
  const days = Object.keys(counts).sort()
  let best = 0, run = 0, prev = ''
  days.forEach((d) => { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d })
  const byStyle = (s: Style) => counted.filter((e) => e.style === s).length
  const months = weeks.map((w, i) => (i === 0 || w[0].slice(5, 7) !== weeks[i - 1][0].slice(5, 7) ? new Date(w[0] + 'T00:00:00Z').toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) : ''))
  const { t } = useLang()
  const year = today.slice(0, 4)
  const yearLog = log.filter((e) => e.day.startsWith(year))
  const dayOfYear = Math.round((Date.parse(today + 'T00:00:00Z') - Date.parse(year + '-01-01T00:00:00Z')) / 864e5) + 1
  const daysInYear = (+year % 4 === 0 && (+year % 100 !== 0 || +year % 400 === 0)) ? 366 : 365
  const activeDays = new Set(yearLog.map((e) => e.day)).size
  const styleRing = (st: Style) => { const ev = yearLog.filter((e) => e.style === st); return { n: ev.length, topics: new Set(ev.map((e) => e.topic)).size } }
  const cur = refl[sel] ?? { learned: '', hard: '', next: '', other: '' }
  const upd = (p: Partial<R>) => setRefl((x) => ({ ...x, [sel]: { ...cur, ...p } }))
  const dayEvents = log.filter((e) => e.day === sel)
  const past = Object.entries(refl).filter(([, v]) => v.learned || v.hard || v.next || v.other).sort((a, b) => (a[0] < b[0] ? 1 : -1))

  return (
    <>
      <Title kicker="Reflection & progress" title="Show up every day. Let the squares fill in." sub="Every VARK pathway activity you mark done is tallied on the day you did it (Philippine time). Click a square to review or reflect on that day." />
      <div className="grid gap-4 sm:grid-cols-4">
        {[['Today', todayCount], ['Current streak', `${streak} d`], ['Longest streak', `${best} d`], ['Total activities', log.length]].map(([k, v]) => (
          <Card key={k}><p className="text-xs text-muted">{k}</p><p className="font-serif text-3xl font-semibold">{v}</p></Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-serif text-xl font-semibold">{log.length} activities in the last year</h2>
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="inline-block min-w-max">
            <div className="ml-8 flex gap-[3px] text-[10px] text-muted">{months.map((m, i) => <span key={i} className="w-3 overflow-visible whitespace-nowrap">{m}</span>)}</div>
            <div className="flex gap-[3px]">
              <div className="mr-1 flex w-7 flex-col gap-[3px] text-[10px] text-muted">{['', 'Mon', '', 'Wed', '', 'Fri', ''].map((l, i) => <span key={i} className="h-3 leading-3">{l}</span>)}</div>
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {w.map((d) => d > today ? <span key={d} className="size-3" /> : (
                    <button key={d} onClick={() => setSel(d)} title={`${counts[d] ?? 0} activities on ${d}`} aria-label={`${counts[d] ?? 0} activities on ${d}`}
                      className={`size-3 rounded-[3px] ${SHADE[level(counts[d] ?? 0)]} ${sel === d ? 'ring-2 ring-ink ring-offset-1' : ''} ${d === today ? 'outline outline-1 outline-ink/40' : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted">Less {SHADE.map((s, i) => <span key={i} className={`size-3 rounded-[3px] ${s}`} />)} More</div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-serif text-xl font-semibold">{year} year progress by category</h2>
        <p className="mt-1 text-sm text-muted">Each VARK ring shows how many of the {TOPICS.length} topics you have practised in that style this year. The topic rings show how many of the four styles you have covered.</p>
        <div className="mt-5 flex flex-wrap justify-around gap-6">
          <Ring value={activeDays / daysInYear} label="Active days" sub={`${activeDays} of ${daysInYear} (day ${dayOfYear})`} color="#1d2433" />
          {(Object.keys(VARK) as Style[]).map((st) => { const r = styleRing(st); return <Ring key={st} value={r.topics / TOPICS.length} label={VARK[st].name} sub={`${r.topics}/${TOPICS.length} topics · ${r.n} sessions`} color={RING_COLORS[st]} /> })}
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex flex-wrap justify-around gap-5">
            {TOPICS.map((tp) => { const k = new Set(yearLog.filter((e) => e.topic === tp.id).map((e) => e.style)).size; return <Ring key={tp.id} value={k / 4} label={t(tp.title)} sub={`${k}/4 styles`} color="#2f6b4f" /> })}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-serif text-xl font-semibold">{sel === today ? 'Today' : sel}</h2>
            {dayEvents.length === 0 ? <p className="mt-2 text-sm text-muted">No pathway activity logged. Mark activities done in Pathways.</p> : (
              <ul className="mt-2 space-y-1 text-sm">{dayEvents.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2"><span><b>{VARK[e.style].name}</b> · {TOPICS.find((t) => t.id === e.topic)?.title}</span>
                  <button className="text-xs text-muted underline" onClick={() => setLog((p) => p.filter((x) => x.id !== e.id))}>remove</button></li>))}</ul>
            )}
            <div className="mt-5 space-y-3">
              {([['learned', 'What did I learn?'], ['hard', 'What was hard or confusing?'], ['next', 'What will I do next?'], ['other', 'Other']] as const).map(([k, l]) => (
                <label key={k} className="block text-sm font-medium">{l}
                  <textarea rows={2} value={cur[k] ?? ''} onChange={(e) => upd({ [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-line bg-paper p-2 text-sm font-normal" /></label>
              ))}
            </div>
          </Card>
          {past.length > 0 && (
            <Card><h2 className="font-serif text-xl font-semibold">Past reflections</h2>
              <ul className="mt-3 divide-y divide-line">{past.slice(0, 10).map(([d, v]) => (
                <li key={d} className="py-2 text-sm"><button className="font-mono text-xs text-accent underline" onClick={() => setSel(d)}>{d}</button><p className="text-muted">{v.learned || v.hard || v.next || v.other}</p></li>))}</ul></Card>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="font-serif text-xl font-semibold">How progress is counted</h2>
            <div role="radiogroup" className="mt-3 space-y-2">
              {([['cumulative', 'Add to old progress', 'New days keep building on everything you have done before.'], ['fresh', 'Fresh each day', 'When a new day starts (12:00 AM PHT), counted progress restarts and only that day counts. Heatmap history is kept.']] as const).map(([m, t, d]) => (
                <label key={m} className={`block cursor-pointer rounded-lg border p-3 text-sm ${mode === m ? 'border-ink bg-paper' : 'border-line'}`}>
                  <input type="radio" name="mode" className="mr-2" checked={mode === m} onChange={() => setMode(m)} /><b>{t}</b><span className="mt-1 block text-muted">{d}</span></label>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{mode === 'fresh' ? `Counting from ${baseDay}.` : 'Counting all history.'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn kind="ghost" onClick={resetNow}>Restart counting from today</Btn>
              {!confirm ? <Btn kind="ghost" onClick={() => setConfirm(true)}>Erase all history</Btn> : <Btn onClick={() => { setLog(() => []); setConfirm(false) }}>Confirm: erase heatmap</Btn>}
            </div>
          </Card>
          <Card>
            <h2 className="font-serif text-xl font-semibold">Counted by style</h2>
            <ul className="mt-3 space-y-1 text-sm">{(Object.keys(VARK) as Style[]).map((s) => <li key={s} className="flex justify-between"><span>{VARK[s].name}</span><span className="font-mono">{byStyle(s)}</span></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  )
}

