import { useState } from 'react'
import { VARK, TOPICS, type Level } from '../lib/data'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'
import type { LogEvent } from '../lib/store'

const Q: [string, Level][][] = [
  [['Draw a diagram or chart', 'V'], ['Talk it through with someone', 'A'], ['Read a written guide', 'R'], ['Try it hands-on', 'K']],
  [['Watch a diagram or demo', 'V'], ['Listen to an explanation', 'A'], ['Read the docs', 'R'], ['Build a small example', 'K']],
  [['Sketch the architecture', 'V'], ['Explain it aloud', 'A'], ['Write notes about it', 'R'], ['Break and fix it', 'K']],
]
const COLORS: Record<Level, string> = { V: 'text-sky', A: 'text-gold', R: 'text-moss', K: 'text-accent' }

export default function Pathways({ vark, setVark, counted, log, setLog, today }: {
  vark: Record<Level, number>; setVark: (v: Record<Level, number>) => void
  counted: LogEvent[]; log: LogEvent[]; setLog: (f: (p: LogEvent[]) => LogEvent[]) => void; today: string
}) {
  const { t: tx } = useLang()
  const doneToday = (topic: string, l: Level) => log.some((e) => e.day === today && e.topic === topic && e.style === l)
  const everDone = (topic: string, l: Level) => counted.some((e) => e.topic === topic && e.style === l)
  const topicDone = (topic: string) => (['V', 'A', 'R', 'K'] as Level[]).every((l) => everDone(topic, l))
  const toggle = (topic: string, l: Level) => setLog((p) => doneToday(topic, l)
    ? p.filter((e) => !(e.day === today && e.topic === topic && e.style === l))
    : [...p, { id: crypto.randomUUID(), day: today, ts: Date.now(), topic, style: l }])
  const [ans, setAns] = useState<(Level | null)[]>([null, null, null])
  const [active, setActive] = useState<Level>(() => (Object.entries(vark) as [Level, number][]).sort((a, b) => b[1] - a[1])[0][0])
  const [topic, setTopic] = useState(TOPICS[0].id)
  const t = TOPICS.find((x) => x.id === topic)!
  const submit = () => {
    const c: Record<Level, number> = { V: 0, A: 0, R: 0, K: 0 }
    ans.forEach((a) => a && c[a]++)
    setVark(c)
    setActive((Object.entries(c) as [Level, number][]).sort((a, b) => b[1] - a[1])[0][0])
  }
  return (
    <>
      <Title kicker="VARK pathways" title="Learn each topic through four doors." sub="Most people use a mix. Lead with your strongest, then always finish with Kinesthetic: for engineering, building is the proof." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <h2 className="font-serif text-lg font-semibold">Quick preference check</h2>
          {['When learning something new I prefer to', 'To understand a concept I want to', 'To remember it I will'].map((q, qi) => (
            <fieldset key={q} className="mt-4"><legend className="text-sm font-medium">{q}</legend>
              {Q[qi].map(([label, l]) => (
                <label key={l} className="mt-1 flex items-center gap-2 text-sm"><input type="radio" name={`q${qi}`} checked={ans[qi] === l} onChange={() => setAns((p) => p.map((x, i) => (i === qi ? l : x)))} />{label}</label>
              ))}
            </fieldset>
          ))}
          <div className="mt-4"><Btn onClick={submit} disabled={ans.some((a) => !a)}>Show my lean</Btn></div>
          <ul className="mt-4 space-y-1 text-sm">
            {(Object.keys(VARK) as Level[]).map((l) => <li key={l} className="flex justify-between"><span>{VARK[l].name}</span><span className="font-mono text-muted">{vark[l]}</span></li>)}
          </ul>
        </Card>
        <div>
          <div role="tablist" className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(VARK) as Level[]).map((l) => (
              <button key={l} role="tab" aria-selected={active === l} onClick={() => setActive(l)}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium ${active === l ? 'border-ink bg-ink text-paper' : 'border-line bg-card hover:border-ink'}`}>{VARK[l].name}</button>
            ))}
          </div>
          <Card className="mb-6">
            <p className={`font-serif text-2xl font-semibold ${COLORS[active]}`}>{VARK[active].name}: {VARK[active].tagline}</p>
            <ul className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">{VARK[active].habits.map((h) => <li key={h}>• {h}</li>)}</ul>
          </Card>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <ul className="space-y-1">
              {TOPICS.map((x) => (
                <li key={x.id}><button onClick={() => setTopic(x.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${topic === x.id ? 'bg-accent-soft font-medium' : 'hover:bg-line/40'}`}>{tx(x.title)}{topicDone(x.id) && <span className="text-moss" aria-label="done">done</span>}</button></li>
              ))}
            </ul>
            <Card>
              <h2 className="font-serif text-xl font-semibold">{tx(t.title)}</h2>
              <p className="text-sm text-muted">Goal: {tx(t.goal)}</p>
              <ol className="mt-4 space-y-3">
                {(['V', 'A', 'R', 'K'] as Level[]).map((l) => (
                  <li key={l} className={`rounded-lg border p-3 ${l === active ? 'border-ink bg-paper' : 'border-line'}`}>
                    <div className="flex items-center justify-between gap-2"><p className={`font-mono text-xs uppercase ${COLORS[l]}`}>{VARK[l].name}{everDone(t.id, l) && ' · counted'}</p>
                      <button onClick={() => toggle(t.id, l)} aria-pressed={doneToday(t.id, l)} className={`min-h-8 rounded-md border px-3 text-xs font-medium ${doneToday(t.id, l) ? 'border-moss bg-moss text-white' : 'border-line bg-card hover:border-ink'}`}>{doneToday(t.id, l) ? 'Done today' : 'Mark done today'}</button></div>
                    <p className="mt-1 text-sm">{tx(t[l])}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">{topicDone(t.id) ? 'All four styles counted for this topic.' : 'Complete all four styles to finish the topic. Each tap is tallied on the Reflection heatmap.'}</p>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
