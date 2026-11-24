import { useState } from 'react'
import { PY_GROUPS, CS_GROUPS, PY_NOTES, CS_NOTES, W3, useLang } from '../lib/lang'
import { useLocal } from '../lib/store'
import { Card, Title, Bar } from './ui'

export default function LangTab() {
  const { lang } = useLang()
  const py = lang === 'python'
  const groups = py ? PY_GROUPS : CS_GROUPS
  const notes = py ? PY_NOTES : CS_NOTES
  const [done, setDone] = useLocal<Record<string, boolean>>(`fs.lang.${lang}`, {})
  const [sel, setSel] = useState(py ? 'Python Syntax' : 'C# Syntax')
  const [q, setQ] = useState('')
  const all = groups.flatMap((g) => g.topics)
  const count = all.filter((t) => done[t]).length
  const n = notes[sel]
  const name = py ? 'Python' : 'C#'
  return (
    <>
      <Title kicker={`${name} fundamentals`} title={`Learn ${name} step by step.`} sub={`A study outline following the W3Schools ${name} course. Read a lesson summary here, then work through the full tutorial on W3Schools and tick topics off as you can write them from memory.`} />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="min-w-60 flex-1"><p className="mb-1 text-sm text-muted">{count} of {all.length} topics complete</p><Bar value={count / all.length} color="bg-moss" /></div>
        <a href={W3[lang]} target="_blank" rel="noreferrer" className="min-h-10 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium hover:border-ink">Open W3Schools {name} tutorial</a>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="!p-3 lg:max-h-[75vh] lg:overflow-y-auto">
          <input aria-label="Search topics" placeholder="Search topics" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 min-h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm" />
          {groups.map((gr) => {
            const ts = gr.topics.filter((t) => t.toLowerCase().includes(q.toLowerCase()))
            if (!ts.length) return null
            return (
              <details key={gr.title} open={gr.title.endsWith('Tutorial') || !!q || gr.topics.includes(sel)} className="mb-1">
                <summary className="cursor-pointer rounded px-2 py-1.5 text-sm font-semibold hover:bg-line/40">{gr.title} <span className="font-mono text-xs font-normal text-muted">{gr.topics.filter((t) => done[t]).length}/{gr.topics.length}</span></summary>
                <ul>{ts.map((t) => (
                  <li key={t} className={`flex items-center gap-2 rounded px-2 py-1 ${sel === t ? 'bg-accent-soft' : ''}`}>
                    <input type="checkbox" aria-label={`${t} complete`} checked={!!done[t]} onChange={(e) => setDone((p) => ({ ...p, [t]: e.target.checked }))} />
                    <button onClick={() => setSel(t)} className="flex-1 text-left text-sm">{t}{notes[t] && <span className="ml-1 text-accent" title="Has summary">•</span>}</button>
                  </li>))}</ul>
              </details>
            )
          })}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl font-semibold">{sel}</h2>
          {n ? (
            <>
              <p className="mt-3 text-muted">{n.text}</p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-4 font-mono text-sm leading-6 text-paper"><code>{n.code}</code></pre>
              <p className="mt-4 text-sm text-muted">Practice: retype this from memory in your own file, change one thing, and predict the output before running it. No AI.</p>
            </>
          ) : (
            <p className="mt-3 text-muted">No summary written for this topic yet. Read it in the W3Schools {name} tutorial, then add what you learned (concept, syntax, structure) to your Notebook.</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!done[sel]} onChange={(e) => setDone((p) => ({ ...p, [sel]: e.target.checked }))} />I can write this from memory</label>
            <a href={W3[lang]} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent underline">Read on W3Schools</a>
          </div>
        </Card>
      </div>
    </>
  )
}
