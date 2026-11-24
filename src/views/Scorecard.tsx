import { useState } from 'react'
import { SECTIONS, SCORE_MEANING } from '../lib/data'
import type { Snapshot } from '../lib/store'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'

export default function Scorecard({ scores, setScores, snaps, setSnaps, notesBy, setNotesBy }: {
  scores: Record<string, number>; setScores: (f: (p: Record<string, number>) => Record<string, number>) => void
  snaps: Snapshot[]; setSnaps: (f: (p: Snapshot[]) => Snapshot[]) => void
  notesBy: Record<string, string>; setNotesBy: (f: (p: Record<string, string>) => Record<string, string>) => void
}) {
  const { t } = useLang()
  const [open, setOpen] = useState('s1')
  const avgOf = (sc: Record<string, number>, id: string, n: number) => Array.from({ length: n }, (_, i) => sc[`${id}:${i}`] ?? 0).reduce((a, b) => a + b, 0) / n
  const total = (sc: Record<string, number>) => SECTIONS.reduce((a, s) => a + avgOf(sc, s.id, s.items.length), 0)
  const last = snaps[snaps.length - 1]
  const save = () => setSnaps((p) => [...p, { at: Date.now(), scores: { ...scores }, total: total(scores) }])
  return (
    <>
      <Title kicker="Weekly self-audit" title="Score every item 0 to 3. Be honest." sub="A generous score is a lie you tell your future interviewer. Save a snapshot every Sunday; the delta is your real progress." />
      <Card className="mb-6">
        <dl className="grid gap-3 sm:grid-cols-4">
          {SCORE_MEANING.map((m, i) => <div key={i}><dt className="font-serif text-2xl font-semibold text-accent">{i}</dt><dd className="text-xs text-muted">{m}</dd></div>)}
        </dl>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {SECTIONS.map((s, si) => {
            const a = avgOf(scores, s.id, s.items.length)
            const isOpen = open === s.id
            return (
              <Card key={s.id} className="!p-0">
                <button className="flex w-full items-center justify-between gap-4 p-5 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : s.id)}>
                  <span><span className="font-mono text-xs text-muted">{si + 1}</span> <span className="font-serif text-lg font-semibold">{t(s.title)}</span><span className="block text-sm text-muted">{t(s.blurb)}</span></span>
                  <span className="font-mono text-sm">{a.toFixed(1)} / 3</span>
                </button>
                {isOpen && (
                  <div className="border-t border-line p-5">
                    <ul className="divide-y divide-line/70">
                      {s.items.map((it, i) => {
                        const k = `${s.id}:${i}`
                        return (
                          <li key={k} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                            <span className="max-w-md text-sm">{t(it)}</span>
                            <div role="radiogroup" aria-label={t(it)} className="flex gap-1">
                              {[0, 1, 2, 3].map((n) => (
                                <button key={n} role="radio" aria-checked={(scores[k] ?? 0) === n} title={SCORE_MEANING[n]} onClick={() => setScores((p) => ({ ...p, [k]: n }))}
                                  className={`size-9 rounded-md border font-mono text-sm ${(scores[k] ?? 0) === n ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}>{n}</button>
                              ))}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <label className="mt-4 block text-sm font-medium">Notes: write evidence, not feelings
                      <textarea value={notesBy[s.id] ?? ''} onChange={(e) => setNotesBy((p) => ({ ...p, [s.id]: e.target.value }))} rows={2} placeholder="deployed X on 2026-09-14; fixed N+1 in /orders view"
                        className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono text-sm" />
                    </label>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <p className="text-xs text-muted">Overall</p>
            <p className="font-serif text-4xl font-semibold">{total(scores).toFixed(1)}<span className="text-lg text-muted"> / 27</span></p>
            {last && <p className="mt-1 text-sm text-muted">Since last snapshot: <b className={total(scores) - last.total >= 0 ? 'text-moss' : 'text-accent'}>{(total(scores) - last.total >= 0 ? '+' : '') + (total(scores) - last.total).toFixed(1)}</b></p>}
            <div className="mt-4"><Btn onClick={save}>Save weekly snapshot</Btn></div>
          </Card>
          <Card>
            <h2 className="font-serif text-lg font-semibold">History</h2>
            {snaps.length === 0 ? <p className="mt-2 text-sm text-muted">No snapshots yet.</p> : (
              <ul className="mt-2 space-y-1 text-sm">
                {[...snaps].reverse().map((s) => <li key={s.at} className="flex justify-between"><span className="text-muted">{new Date(s.at).toLocaleDateString()}</span><span className="font-mono">{s.total.toFixed(1)}</span></li>)}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </>
  )
}
