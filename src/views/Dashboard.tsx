import { SECTIONS, MISTAKES, ROADMAP, REVIEW_PROMPTS, type Level } from '../lib/data'
import { useLang } from '../lib/lang'
import { Card, Title, Bar, Btn } from './ui'

export default function Dashboard({ scores, go, vark, solved, notes }: { scores: Record<string, number>; go: (v: string) => void; vark: Record<Level, number>; solved: number; notes: number }) {
  const { t } = useLang()
  const per = SECTIONS.map((s) => {
    const sum = s.items.reduce((a, _, i) => a + (scores[`${s.id}:${i}`] ?? 0), 0)
    return { s, avg: sum / s.items.length, done: s.items.filter((_, i) => (scores[`${s.id}:${i}`] ?? 0) >= 2).length }
  })
  const overall = per.reduce((a, p) => a + p.avg, 0)
  const zeros = SECTIONS.slice(3, 8).filter((s) => s.items.some((_, i) => (scores[`${s.id}:${i}`] ?? 0) === 0)).length
  const threes = per.filter((p) => p.avg >= 2.5).length
  const top = (Object.entries(vark) as [Level, number][]).sort((a, b) => b[1] - a[1])[0]
  const weakest = [...per].sort((a, b) => a.avg - b.avg)[0]
  return (
    <>
      <Title kicker="Full-stack learning lab" title="Learn to read, build, test, ship and secure real software." sub="A weekly self-audit, a notebook, algorithm practice and four learning pathways. Build without AI. Explain every line." />
      <div className="grid gap-4 md:grid-cols-4">
        {[['Overall', `${overall.toFixed(1)} / 27`], ['Problems solved', String(solved)], ['Notebook entries', String(notes)], ['Strong areas (avg 2.5+)', `${threes} / 3 target`]].map(([k, v]) => (
          <Card key={k}><p className="text-xs text-muted">{k}</p><p className="mt-1 font-serif text-3xl font-semibold">{v}</p></Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Section progress</h2><Btn kind="ghost" onClick={() => go('scorecard')}>Open scorecard</Btn></div>
          <ul className="space-y-3">
            {per.map(({ s, avg }, i) => (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-sm"><span>{i + 1}. {t(s.title)}</span><span className="font-mono text-muted">{avg.toFixed(1)}</span></div>
                <Bar value={avg / 3} color={avg >= 2 ? 'bg-moss' : 'bg-accent'} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Target: no 0s in sections 4–8, at least 2 in every subsection, and 3 in three areas you can name aloud. {zeros > 0 ? `${zeros} of sections 4–8 still contain 0s.` : 'No zeros in sections 4–8.'}</p>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold">Next focus</h2>
            <p className="mt-2 text-sm text-muted">Your weakest area right now:</p>
            <p className="mt-1 font-medium">{t(weakest.s.title)}</p>
            <p className="mt-3 text-sm text-muted">Learning style leaning: <b className="text-ink">{top[1] > 0 ? top[0] : 'not set'}</b>. Pick a pathway activity for it.</p>
            <div className="mt-4 flex gap-2"><Btn onClick={() => go('pathways')}>Pathways</Btn><Btn kind="ghost" onClick={() => go('practice')}>Practice</Btn></div>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Roadmap</h2>
            <ul className="mt-2 space-y-2 text-sm">{ROADMAP.map(([m, r]) => <li key={m}><b>{m}.</b> <span className="text-muted">{t(r)}</span></li>)}</ul>
          </Card>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card><h2 className="text-xl font-semibold">Common mistakes</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">{MISTAKES.map((m) => <li key={m}>{t(m)}</li>)}</ul></Card>
        <Card><h2 className="text-xl font-semibold">Monthly review, answer aloud</h2><ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">{REVIEW_PROMPTS.map((m) => <li key={m}>{t(m)}</li>)}</ol></Card>
      </div>
    </>
  )
}
