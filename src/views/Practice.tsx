import { useEffect, useState } from 'react'
import { PROBLEMS, PROBLEM_PROMPTS } from '../lib/data'
import type { ProblemState } from '../lib/store'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'

type Custom = { id: string; text: string; solved: boolean }
export default function Practice({ ps, setPs, custom, setCustom }: {
  ps: Record<string, ProblemState>; setPs: (f: (p: Record<string, ProblemState>) => Record<string, ProblemState>) => void
  custom: Custom[]; setCustom: (f: (p: Custom[]) => Custom[]) => void
}) {
  const { t } = useLang()
  const [secs, setSecs] = useState(1800)
  const [run, setRun] = useState(false)
  const [showHint, setShowHint] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [pattern, setPattern] = useState('All')
  useEffect(() => {
    if (!run) return
    const id = setInterval(() => setSecs((s) => (s <= 1 ? (setRun(false), 0) : s - 1)), 1000)
    return () => clearInterval(id)
  }, [run])
  const patterns = ['All', ...Array.from(new Set(PROBLEMS.map((p) => p.pattern)))]
  const list = PROBLEMS.filter((p) => pattern === 'All' || p.pattern === pattern)
  const set = (id: string, status: ProblemState['status']) => setPs((p) => ({ ...p, [id]: { status, at: Date.now() } }))
  const threeDays = 3 * 864e5
  return (
    <>
      <Title kicker="Reading code & problem solving" title="2–3 problems a session. 30 minutes each. Then read the solution." sub={t("Python only. Re-solve from scratch after 3 days without looking. Say the time and space complexity out loud.")} />
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs text-muted">Session timer</p><p className="font-mono text-4xl" aria-live="off">{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</p></div>
        <div className="flex gap-2"><Btn onClick={() => setRun((r) => !r)}>{run ? 'Pause' : 'Start'}</Btn><Btn kind="ghost" onClick={() => { setRun(false); setSecs(1800) }}>Reset</Btn></div>
        <p className="max-w-sm text-sm text-muted">Stuck protocol: 20 min own attempts, then docs, then library source, then ask a human. Log it in the notebook.</p>
      </Card>
      <div className="mb-3 flex flex-wrap gap-2">{patterns.map((p) => <button key={p} onClick={() => setPattern(p)} className={`rounded-full border px-3 py-1 text-xs ${pattern === p ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}>{p}</button>)}</div>
      <ul className="space-y-2">
        {list.map((p) => {
          const s = ps[p.id]
          const due = s?.status === 'solved' && s.at && Date.now() - s.at > threeDays
          return (
            <li key={p.id}><Card className="!py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted">{p.pattern} · {p.diff}{due && <span className="ml-2 font-medium text-accent">re-solve due</span>}</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <Btn kind="ghost" onClick={() => setShowHint(showHint === p.id ? null : p.id)}>Hint</Btn>
                  <select aria-label={`Status of ${p.title}`} value={s?.status ?? 'todo'} onChange={(e) => set(p.id, e.target.value as ProblemState['status'])} className="min-h-10 rounded-lg border border-line bg-card px-2 text-sm">
                    <option value="todo">To do</option><option value="solved">Solved</option><option value="resolved">Re-solved cold</option>
                  </select>
                </div>
              </div>
              {showHint === p.id && <p className="mt-2 text-sm text-muted">Hint: {p.hint}</p>}
            </Card></li>
          )
        })}
      </ul>
      <h2 className="mt-12 text-2xl font-semibold">Make your own problems</h2>
      <p className="mt-1 text-sm text-muted">Inventing problems turns memorisation into understanding.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Card><ul className="space-y-2 text-sm">{PROBLEM_PROMPTS.map((q) => <li key={q} className="flex justify-between gap-3"><span>{q}</span><button className="shrink-0 text-xs font-medium text-accent underline" onClick={() => setText(q + '\n\n')}>use</button></li>)}</ul></Card>
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setCustom((p) => [{ id: crypto.randomUUID(), text: text.trim(), solved: false }, ...p]); setText('') } }}>
            <label className="text-sm font-medium" htmlFor="cp">Write the problem, constraints and an example</label>
            <textarea id="cp" value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono text-sm" />
            <div className="mt-2"><Btn type="submit">Add problem</Btn></div>
          </form>
          <ul className="mt-4 space-y-2">{custom.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm"><input type="checkbox" aria-label="Solved" className="mt-1" checked={c.solved} onChange={() => setCustom((p) => p.map((x) => (x.id === c.id ? { ...x, solved: !x.solved } : x)))} /><span className={`whitespace-pre-wrap ${c.solved ? 'text-muted line-through' : ''}`}>{c.text}</span>
              <button className="ml-auto text-xs text-muted underline" onClick={() => setCustom((p) => p.filter((x) => x.id !== c.id))}>remove</button></li>))}</ul>
        </Card>
      </div>
    </>
  )
}
