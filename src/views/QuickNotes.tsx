import { useEffect, useRef, useState, type FormEvent } from 'react'
import { broadcastLocalValue, useLocal, type Note } from '../lib/store'

const DEFAULT_CATEGORIES = ['concept', 'syntax', 'structure', 'stuck.md', 'architecture']

export default function QuickNotes({ notes, setNotes, openNotebook }: {
  notes: Note[]
  setNotes: (update: (current: Note[]) => Note[]) => void
  openNotebook: () => void
}) {
  const [open, setOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [categories, setCategories] = useLocal<string[]>('fs.noteCats', DEFAULT_CATEGORIES)
  const [saveMode, setSaveMode] = useState<'current' | 'new'>('new')
  const [currentNoteId, setCurrentNoteId] = useState(() => notes[0]?.id ?? '')
  const [category, setCategory] = useState('concept')
  const [newCategory, setNewCategory] = useState('')
  const [manageCategories, setManageCategories] = useState(false)
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<string | null>(null)
  const optionsRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const recentNotes = [...notes].sort((a, b) => a.at - b.at).slice(-8)
  const currentNote = notes.find((note) => note.id === currentNoteId) ?? recentNotes[recentNotes.length - 1]
  const latestNote = recentNotes[recentNotes.length - 1]
  const categoryOptions = [...categories, ...(notes.some((note) => note.tag === 'uncategorized') && !categories.includes('uncategorized') ? ['uncategorized'] : [])]

  useEffect(() => {
    if (!open || !latestNote) return
    requestAnimationFrame(() => {
      const chat = chatRef.current
      if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' })
    })
  }, [open, latestNote?.id, latestNote?.at])

  function toggleCategories() {
    const next = !manageCategories
    setManageCategories(next)
    if (!next) { setPendingDeleteCategory(null); return }
    requestAnimationFrame(() => {
      const options = optionsRef.current
      if (options) options.scrollTo({ top: options.scrollHeight, behavior: 'smooth' })
    })
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = newCategory.trim()
    if (!value || categories.includes(value)) return
    const updated = [...categories, value]
    setCategories(updated)
    broadcastLocalValue('fs.noteCats', updated)
    setCategory(value)
    setNewCategory('')
  }

  function renameCategory(oldName: string, value: string) {
    const name = value.trim()
    if (!name || name === oldName || categories.includes(name)) return
    const updated = categories.map((item) => item === oldName ? name : item)
    setCategories(updated)
    broadcastLocalValue('fs.noteCats', updated)
    setNotes((current) => current.map((note) => note.tag === oldName ? { ...note, tag: name } : note))
    if (category === oldName) setCategory(name)
    if (pendingDeleteCategory === oldName) setPendingDeleteCategory(null)
  }

  function deleteCategory(name: string) {
    const updated = categories.filter((item) => item !== name)
    setCategories(updated)
    broadcastLocalValue('fs.noteCats', updated)
    setNotes((current) => current.map((note) => note.tag === name ? { ...note, tag: 'uncategorized' } : note))
    if (category === name) setCategory(categories.find((item) => item !== name) ?? 'uncategorized')
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    if (saveMode === 'current') {
      if (!currentNote) return
      setNotes((current) => current.map((note) => note.id === currentNote.id
        ? { ...note, body: [note.body.trim(), body].filter(Boolean).join('\n\n'), at: Date.now() }
        : note))
      setCurrentNoteId(currentNote.id)
    } else {
      const note: Note = { id: `quick-${crypto.randomUUID()}`, title: 'Quick note', tag: category, body, at: Date.now() }
      setNotes((current) => [note, ...current])
      setCurrentNoteId(note.id)
    }
    setDraft('')
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6" aria-label="Quick notes">
      {open && (
        <section id="quick-notes-panel" role="dialog" aria-label="Quick notepad"
          className="flex h-[min(70dvh,38rem)] max-h-[calc(100dvh-6.5rem)] w-[min(92vw,24rem)] max-w-[calc(100vw-2rem)] min-h-0 flex-col overflow-y-auto rounded-2xl border border-line bg-card shadow-2xl">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-paper px-3 py-3 sm:gap-3 sm:px-4">
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-lg font-semibold">Quick notepad</h2>
              <p className="text-xs text-muted">Notes are also saved in your Notebook.</p>
            </div>
            <button type="button" onClick={() => { setControlsOpen((value) => !value); setManageCategories(false); setPendingDeleteCategory(null) }} aria-expanded={controlsOpen} aria-controls={controlsOpen ? 'quick-note-options' : undefined}
              className="min-h-10 shrink-0 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:border-ink">{controlsOpen ? 'Hide options' : 'Options'}</button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close quick notepad"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card text-xl text-ink hover:border-ink">×</button>
          </header>

          {controlsOpen && (
            <section id="quick-note-options" ref={optionsRef} className="max-h-[45%] shrink-0 overflow-y-auto overscroll-contain border-b border-line bg-paper p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">Save input to</span>
                <button type="button" onClick={toggleCategories} aria-expanded={manageCategories}
                  className="min-h-10 rounded-lg border border-line bg-card px-3 text-sm font-medium">{manageCategories ? 'Done' : 'Manage categories'}</button>
              </div>
              <div role="radiogroup" aria-label="Save input to" className="mb-2 grid grid-cols-2 gap-2">
                <button type="button" role="radio" aria-checked={saveMode === 'current'} disabled={!currentNote}
                  onClick={() => setSaveMode('current')} className={`min-h-10 rounded-lg border px-2 text-sm font-medium disabled:opacity-40 ${saveMode === 'current' ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}>Current note</button>
                <button type="button" role="radio" aria-checked={saveMode === 'new'} onClick={() => setSaveMode('new')}
                  className={`min-h-10 rounded-lg border px-2 text-sm font-medium ${saveMode === 'new' ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}>New note</button>
              </div>
              {saveMode === 'current' && currentNote ? (
                <label className="block text-sm font-medium">Append to current note
                  <select value={currentNote.id} onChange={(event) => setCurrentNoteId(event.target.value)} className="mt-1 min-h-10 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-base">
                    {[...notes].sort((a, b) => b.at - a.at).map((note) => <option key={note.id} value={note.id}>{note.title} · {note.tag}</option>)}
                  </select>
                </label>
              ) : (
                <label className="block text-sm font-medium">Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-10 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-base">
                    {categoryOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              )}
              {manageCategories && (
                <section className="mt-3 rounded-xl border border-line bg-card p-3" aria-label="Manage categories">
                  <h3 className="font-serif text-base font-semibold">Manage categories</h3>
                  <ul className="mt-2 space-y-2">
                    {categories.map((item) => (
                      <li key={item} className="flex min-w-0 flex-wrap items-center gap-2">
                        <input aria-label={`Rename ${item} category`} defaultValue={item} onBlur={(event) => { renameCategory(item, event.currentTarget.value); event.currentTarget.value = item }}
                          onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                          className="min-h-10 min-w-0 flex-1 basis-32 rounded-lg border border-line bg-paper px-3 text-base" />
                        <button type="button" disabled={categories.length <= 1} onClick={() => {
                          setPendingDeleteCategory(item)
                          requestAnimationFrame(() => optionsRef.current?.scrollTo({ top: optionsRef.current.scrollHeight, behavior: 'smooth' }))
                        }}
                          className="min-h-10 shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-accent disabled:opacity-40">Delete</button>
                      </li>
                    ))}
                  </ul>
                  {pendingDeleteCategory && categories.includes(pendingDeleteCategory) && (
                    <div role="group" aria-label={`Confirm deletion of ${pendingDeleteCategory}`} aria-live="polite" className="mt-3 rounded-xl border border-accent/40 bg-accent-soft p-3 text-sm leading-relaxed">
                      <p>Delete “{pendingDeleteCategory}”? Notes in this category will be moved to uncategorized.</p>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => setPendingDeleteCategory(null)} className="min-h-10 rounded-lg border border-line bg-card px-3 font-medium">Cancel</button>
                        <button type="button" onClick={() => { deleteCategory(pendingDeleteCategory); setPendingDeleteCategory(null) }} className="min-h-10 rounded-lg bg-accent px-3 font-semibold text-white">Delete category</button>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted">Edit a name, then tap outside the field to save.</p>
                  <form onSubmit={addCategory} className="mt-3 flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="quick-new-category">New category</label>
                    <input id="quick-new-category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category"
                      className="min-h-10 min-w-0 flex-1 basis-36 rounded-lg border border-line bg-paper px-3 text-base" />
                    <button type="submit" disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                      className="min-h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-40">Add</button>
                  </form>
                  <p className="mt-2 text-xs leading-relaxed text-muted">Deleting a category moves its notes to uncategorized.</p>
                </section>
              )}
            </section>
          )}

          <div ref={chatRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4" role="log" aria-live="polite">
            <div className="max-w-[88%] self-start rounded-2xl rounded-bl-sm border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink">
              Add a thought to an existing note or start a new one. Notes stay in your Notebook.
            </div>
            {recentNotes.map((note) => (
              <button key={note.id} type="button" onClick={() => { setCurrentNoteId(note.id); setSaveMode('current') }}
                className={`max-w-[92%] self-end rounded-2xl rounded-br-sm px-3 py-2 text-left text-base leading-relaxed ${currentNote?.id === note.id ? 'bg-accent text-white' : 'bg-ink text-paper'}`}>
                <span className="mb-1 block text-xs font-semibold opacity-80">{note.title} · {note.tag}</span>
                <span className="block whitespace-pre-wrap [overflow-wrap:anywhere]">{note.body}</span>
                <span className="mt-1 block text-xs opacity-70">{new Date(note.at).toLocaleString()}</span>
              </button>
            ))}
            {recentNotes.length === 0 && <p className="self-center py-3 text-sm text-muted">Your notes will appear here.</p>}

          </div>

          <form onSubmit={saveNote} className="shrink-0 border-t border-line p-3">
            <label htmlFor="quick-note-draft" className="sr-only">Write a quick note</label>
            <textarea id="quick-note-draft" value={draft} onChange={(event) => setDraft(event.target.value)} rows={2}
              placeholder="Write a note…" className="max-h-32 min-h-16 w-full resize-y rounded-xl border border-line bg-paper p-3 text-base leading-relaxed outline-none focus:border-accent" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button type="button" onClick={() => { openNotebook(); setOpen(false) }} className="min-h-10 rounded-lg px-3 text-sm font-medium text-muted underline underline-offset-2 hover:text-ink">Open notebook</button>
              <button type="submit" disabled={!draft.trim()} className="min-h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-40">{saveMode === 'current' ? 'Add to note' : 'Create note'}</button>
            </div>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={open ? 'quick-notes-panel' : undefined}
        aria-label={open ? 'Close quick notepad' : 'Open quick notepad'}
        className="flex size-14 items-center justify-center rounded-full border border-white/70 bg-accent text-white shadow-lg transition hover:scale-105 hover:bg-ink focus-visible:outline-offset-4">
        {open ? <span aria-hidden="true" className="text-2xl leading-none">×</span> : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
        )}
      </button>
    </aside>
  )
}
