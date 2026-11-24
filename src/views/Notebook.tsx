import { useState } from 'react'
import { useLocal, type Note } from '../lib/store'
import { useLang } from '../lib/lang'
import { Card, Title, Btn } from './ui'

const DEFAULT_TAGS = ['concept', 'syntax', 'structure', 'stuck.md', 'architecture']
const TEMPLATES: Record<string, string> = {
  'stuck.md': 'Problem:\nWhat I tried (20 min):\nDocs said:\nLibrary source showed:\nWho I asked / answer:\nRoot cause + lesson:',
  architecture: 'Repo:\nEntry points:\nData flow:\nWhere auth happens:\nWhere the DB is touched:\nWhat breaks first under load:',
  concept: 'In one sentence:\nWhy it exists:\nExample:\nTrade-offs:',
  syntax: '```python\n\n```\nWhen to use:',
  structure: 'Files / layers:\nResponsibilities:\nHow they connect:',
}
export default function Notebook({ notes, setNotes }: { notes: Note[]; setNotes: (f: (p: Note[]) => Note[]) => void }) {
  const { t } = useLang()
  const [tags, setTags] = useLocal<string[]>('fs.noteCats', DEFAULT_TAGS)
  const [manage, setManage] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [delCat, setDelCat] = useState<string | null>(null)
  const addCat = () => { const c = newCat.trim(); if (c && !tags.includes(c)) setTags((p) => [...p, c]); setNewCat('') }
  const renameCat = (old: string, name: string) => {
    const n = name.trim(); if (!n || n === old || tags.includes(n)) return
    setTags((p) => p.map((x) => (x === old ? n : x)))
    setNotes((p) => p.map((x) => (x.tag === old ? { ...x, tag: n } : x)))
    if (tag === old) setTag(n)
  }
  const removeCat = (c: string) => {
    setTags((p) => p.filter((x) => x !== c))
    setNotes((p) => p.map((x) => (x.tag === c ? { ...x, tag: 'uncategorized' } : x)))
    if (tag === c) setTag('All'); setDelCat(null)
  }
  const [sel, setSel] = useState<string | null>(notes[0]?.id ?? null)
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('All')
  const [pending, setPending] = useState<string | null>(null)
  const cur = notes.find((n) => n.id === sel)
  const add = (tg: string) => {
    const n: Note = { id: crypto.randomUUID(), title: 'Untitled', tag: tg, body: TEMPLATES[tg] ? t(TEMPLATES[tg]) : '', at: Date.now() }
    setNotes((p) => [n, ...p]); setSel(n.id)
  }
  const upd = (patch: Partial<Note>) => setNotes((p) => p.map((n) => (n.id === sel ? { ...n, ...patch, at: Date.now() } : n)))
  const shown = notes.filter((n) => (tag === 'All' || n.tag === tag) && (n.title + n.body).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <Title kicker="Notebook" title="Write it down to remember it." sub="Capture concepts, syntax and code structure in your own words. Review weekly; a note you never reread is a note you never wrote." />
      <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-sm text-muted">New:</span>{tags.map((c) => <Btn key={c} kind="ghost" onClick={() => add(c)}>{c}</Btn>)}<Btn kind="ghost" onClick={() => setManage(!manage)}>{manage ? 'Done' : 'Edit categories'}</Btn></div>
      {manage && (
        <Card className="mb-4">
          <h2 className="font-serif text-lg font-semibold">Categories</h2>
          <ul className="mt-3 space-y-2">
            {tags.map((c) => (
              <li key={c} className="flex min-w-0 flex-wrap items-center gap-2">
                <input aria-label={`Rename ${c}`} defaultValue={c} key={c} onBlur={(e) => { renameCat(c, e.target.value); e.target.value = c }} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} className="min-h-10 min-w-0 flex-1 basis-36 rounded-lg border border-line bg-paper px-3 text-sm" />
                <span className="w-14 shrink-0 text-xs text-muted">{notes.filter((n) => n.tag === c).length} notes</span>
                <button onClick={() => setDelCat(c)} className="min-h-10 shrink-0 rounded-lg border border-line px-3 text-sm hover:border-accent hover:text-accent">Delete</button>
              </li>
            ))}
          </ul>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addCat() }}>
            <input aria-label="New category" placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="min-h-9 flex-1 rounded-lg border border-line bg-paper px-3 text-sm" />
            <Btn type="submit">Add</Btn>
          </form>
          <p className="mt-2 text-xs text-muted">Edit a name and press Enter to rename it; its notes follow. Deleting a category keeps its notes as "uncategorized".</p>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="!p-3">
          <input aria-label="Search notes" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="mb-2 min-h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm" />
          <select aria-label="Filter by tag" value={tag} onChange={(e) => setTag(e.target.value)} className="mb-2 min-h-10 w-full rounded-lg border border-line bg-paper px-2 text-sm"><option>All</option>{[...tags, ...(notes.some((n) => n.tag === 'uncategorized') && !tags.includes('uncategorized') ? ['uncategorized'] : [])].map((c) => <option key={c}>{c}</option>)}</select>
          {shown.length === 0 && <p className="p-2 text-sm text-muted">No notes yet. Create one above.</p>}
          <ul className="space-y-1">{shown.map((n) => (
            <li key={n.id} className="relative"><button onClick={() => setPending(n.id)} aria-label={`Delete note ${n.title}`} title="Delete note"
              className="absolute left-0.5 top-0.5 z-10 grid size-5 place-items-center rounded-full border border-line bg-card text-xs leading-none text-muted hover:border-accent hover:bg-accent hover:text-white">×</button>
              <button onClick={() => setSel(n.id)} className={`w-full rounded-lg px-3 py-2 pl-7 text-left ${sel === n.id ? 'bg-accent-soft' : 'hover:bg-line/40'}`}>
              <span className="block truncate text-sm font-medium">{n.title}</span><span className="font-mono text-xs text-muted">{n.tag} · {new Date(n.at).toLocaleDateString()}</span></button></li>))}</ul>
        </Card>
        {cur ? (
          <Card className="notebook">
            <div className="flex gap-2">
              <input aria-label="Title" value={cur.title} onChange={(e) => upd({ title: e.target.value })} className="min-w-0 flex-1 bg-transparent font-serif text-2xl font-semibold outline-none" />
              <button className="text-sm text-muted underline" onClick={() => setPending(cur.id)}>delete</button>
            </div>
            <p className="font-mono text-xs text-accent">{cur.tag}</p>
            <textarea aria-label="Note body" value={cur.body} onChange={(e) => upd({ body: e.target.value })} rows={18}
              className="mt-3 w-full resize-y bg-transparent font-mono text-sm leading-7 outline-none"
              style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #ddd3c0 28px)' }} />
          </Card>
        ) : <Card><p className="text-muted">Select or create a note.</p></Card>}
      </div>
      {delCat && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4" onClick={() => setDelCat(null)}>
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-xl border border-line bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl font-semibold">Delete category "{delCat}"?</h2>
            <p className="mt-2 text-sm text-muted">{notes.filter((n) => n.tag === delCat).length} notes will move to "uncategorized". No notes are deleted.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button autoFocus className="min-h-10 rounded-lg border border-line px-4 text-sm" onClick={() => setDelCat(null)}>Cancel</button>
              <button className="min-h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white" onClick={() => removeCat(delCat)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {pending && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4" onClick={() => setPending(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full max-w-sm rounded-xl border border-line bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 id="del-title" className="font-serif text-xl font-semibold">Delete this note?</h2>
            <p className="mt-2 text-sm text-muted">"{notes.find((n) => n.id === pending)?.title}" will be permanently removed. This cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button autoFocus className="min-h-10 rounded-lg border border-line px-4 text-sm hover:border-ink" onClick={() => setPending(null)}>Cancel</button>
              <button className="min-h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white" onClick={() => {
                const rest = notes.filter((n) => n.id !== pending)
                setNotes(() => rest); if (sel === pending) setSel(rest[0]?.id ?? null); setPending(null)
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
