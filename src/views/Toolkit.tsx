import { useState } from 'react'
import { UX, HOPS, COOKIE_STEPS, COOKIE_FLAGS, DEVTOOLS, SECURITY, SECRET_RESPONSE, PROJECTS } from '../lib/data'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'

function Stepper({ steps, label }: { steps: string[][]; label: string }) {
  const [i, setI] = useState(0)
  return (
    <Card>
      <h2 className="font-serif text-xl font-semibold">{label}</h2>
      <ol className="my-4 flex flex-wrap gap-1.5">{steps.map(([n], k) => (
        <li key={n}><button onClick={() => setI(k)} aria-current={k === i} className={`rounded-full border px-3 py-1 text-xs ${k === i ? 'border-accent bg-accent text-white' : k < i ? 'border-ink/40 bg-line/50' : 'border-line'}`}>{k + 1}. {n}</button></li>))}</ol>
      <div className="min-h-20 rounded-lg bg-paper p-4"><p className="font-medium">{steps[i][0]}</p><p className="mt-1 text-sm text-muted">{steps[i][1]}</p></div>
      <div className="mt-3 flex gap-2"><Btn kind="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Btn><Btn disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>Next</Btn></div>
    </Card>
  )
}

export default function Toolkit() {
  const { t } = useLang()
  return (
    <>
      <Title kicker="Toolkit" title="UI/UX principles and the full-stack process." sub="Reference material for the hops, cookies, DevTools and security habits that sit around the code." />
      <h2 className="mb-3 text-2xl font-semibold">UI / UX design principles</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {UX.map((u) => <Card key={u.t} className="!p-4"><h3 className="font-semibold">{u.t}</h3><p className="mt-1 text-sm text-muted">{u.d}</p></Card>)}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Stepper label="Click to Postgres and back" steps={HOPS.map(([a, b]) => [t(a), t(b)])} />
        <Stepper label="Cookie round trip" steps={COOKIE_STEPS} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h2 className="font-serif text-xl font-semibold">Cookie flags</h2><dl className="mt-3 space-y-2 text-sm">{COOKIE_FLAGS.map(([k, v]) => <div key={k}><dt className="inline font-mono font-medium text-accent">{k}</dt> <dd className="inline text-muted">{v}</dd></div>)}</dl></Card>
        <Card><h2 className="font-serif text-xl font-semibold">Browser DevTools</h2><dl className="mt-3 space-y-2 text-sm">{DEVTOOLS.map(([k, v]) => <div key={k}><dt className="inline font-medium">{k}.</dt> <dd className="inline text-muted">{v}</dd></div>)}</dl></Card>
      </div>
      <h2 className="mb-3 mt-10 text-2xl font-semibold">Security basics</h2>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase text-muted"><tr><th className="py-2">Principle</th><th>Implementation</th><th>Pitfall</th></tr></thead>
          <tbody>{SECURITY.map(([a, b, c]) => <tr key={a} className="border-t border-line"><td className="py-2 font-medium">{a}</td><td className="text-muted">{b}</td><td className="text-accent">{c}</td></tr>)}</tbody></table>
      </Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h2 className="font-serif text-xl font-semibold">A secret was committed. In order:</h2><ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{SECRET_RESPONSE.map((s) => <li key={s}>{t(s)}</li>)}</ol></Card>
        <Card><h2 className="font-serif text-xl font-semibold">Project ideas</h2><ul className="mt-3 space-y-2 text-sm">{PROJECTS.map(([a, b]) => <li key={a}><b>{a}.</b> <span className="text-muted">{b}</span></li>)}</ul></Card>
      </div>
    </>
  )
}
