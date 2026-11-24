import { useEffect, useMemo, useState } from 'react'
import { useLocal, type Note, type Snapshot, type ProblemState, type LogEvent, type Mode, type Reflection as Refl } from './lib/store'
import type { Level } from './lib/data'
import Dashboard from './views/Dashboard'
import Scorecard from './views/Scorecard'
import Pathways from './views/Pathways'
import Practice from './views/Practice'
import Notebook from './views/Notebook'
import Toolkit from './views/Toolkit'
import Flashcards from './views/Flashcards'
import TimerWidget from './views/Timer'
import LangTab from './views/LangTab'
import { LangContext, toCsharp, type Lang } from './lib/lang'
import Reflection from './views/Reflection'
import CloudSync from './views/CloudSync'
import { PhClock, dayKey, useNow } from './lib/time'

const NAV = [['dashboard', 'Overview'], ['scorecard', 'Scorecard'], ['pathways', 'Pathways'], ['practice', 'Practice'], ['notebook', 'Notebook'], ['reflection', 'Reflection'], ['toolkit', 'Toolkit'], ['flashcards', 'Flashcards'], ['lang', 'Language']] as const

export default function App() {
  const [lang, setLang] = useLocal<Lang>('fs.lang', 'python')
  const ctx = useMemo(() => ({ lang, t: lang === 'csharp' ? toCsharp : (x: string) => x }), [lang])
  const [view, setView] = useState<string>('dashboard')
  const [scores, setScores] = useLocal<Record<string, number>>('fs.scores', {})
  const [snaps, setSnaps] = useLocal<Snapshot[]>('fs.snaps', [])
  const [notesBy, setNotesBy] = useLocal<Record<string, string>>('fs.sectionNotes', {})
  const [vark, setVark] = useLocal<Record<Level, number>>('fs.vark', { V: 0, A: 0, R: 0, K: 0 })
  const [ps, setPs] = useLocal<Record<string, ProblemState>>('fs.problems', {})
  const [custom, setCustom] = useLocal<{ id: string; text: string; solved: boolean }[]>('fs.custom', [])
  const [log, setLog] = useLocal<LogEvent[]>('fs.log', [])
  const [mode, setMode] = useLocal<Mode>('fs.mode', 'cumulative')
  const [baseDay, setBaseDay] = useLocal<string>('fs.baseDay', dayKey(Date.now()))
  const [refl, setRefl] = useLocal<Record<string, Refl>>('fs.refl', {})
  const today = dayKey(useNow())
  // Fresh mode: when the Manila date rolls over, restart counting from the new day
  useEffect(() => { if (mode === 'fresh' && baseDay < today) setBaseDay(today) }, [mode, baseDay, today, setBaseDay])
  const setModeAndBase = (m: Mode) => { setMode(m); if (m === 'fresh') setBaseDay(today) }
  const counted = log.filter((e) => mode === 'cumulative' || e.day >= baseDay)
  const [notes, setNotes] = useLocal<Note[]>('fs.notes', [])
  const go = (v: string) => { setView(v); window.scrollTo(0, 0) }
  const solved = Object.values(ps).filter((p) => p.status !== 'todo').length

  return (
    <LangContext.Provider value={ctx}>
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-card focus:p-2">Skip to content</a>
      <nav className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur" aria-label="Primary">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2">
          <span className="font-serif text-lg font-bold">Stack<span className="text-accent">Ledger</span></span>
          <ul className="flex flex-wrap gap-1">
            {NAV.map(([id, label]) => (
              <li key={id}><button onClick={() => go(id)} aria-current={view === id ? 'page' : undefined}
                className={`min-h-10 rounded-lg px-3 text-sm ${view === id ? 'bg-ink font-medium text-paper' : 'text-muted hover:bg-line/50 hover:text-ink'}`}>{id === 'lang' ? (lang === 'python' ? 'Python' : 'C#') : label}</button></li>
            ))}
            <li>
              <div role="radiogroup" aria-label="Site language focus" className="ml-1 flex rounded-full border border-line bg-card p-0.5">
                {([['python', 'Python'], ['csharp', 'C#']] as const).map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={lang === k} onClick={() => setLang(k)}
                    className={`min-h-9 rounded-full px-3 text-sm font-semibold transition ${lang === k ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}>{l}</button>
                ))}
              </div>
            </li>
          </ul>
          <div className="ml-auto flex items-center gap-4"><TimerWidget /><PhClock /></div>
        </div>
      </nav>
      <main id="main" className="mx-auto max-w-6xl px-5 py-10">
        {view === 'dashboard' && <Dashboard scores={scores} go={go} vark={vark} solved={solved} notes={notes.length} />}
        {view === 'scorecard' && <Scorecard scores={scores} setScores={setScores} snaps={snaps} setSnaps={setSnaps} notesBy={notesBy} setNotesBy={setNotesBy} />}
        {view === 'pathways' && <Pathways vark={vark} setVark={setVark} counted={counted} log={log} setLog={setLog} today={today} />}
        {view === 'practice' && <Practice ps={ps} setPs={setPs} custom={custom} setCustom={setCustom} />}
        {view === 'notebook' && <Notebook notes={notes} setNotes={setNotes} />}
        {view === 'reflection' && <Reflection log={log} setLog={setLog} mode={mode} setMode={setModeAndBase} baseDay={baseDay} resetNow={() => setBaseDay(today)} today={today} refl={refl} setRefl={setRefl} />}
        {view === 'toolkit' && <Toolkit />}
        {view === 'flashcards' && <Flashcards />}
        {view === 'lang' && <LangTab key={lang} />}
      </main>
      <footer className="border-t border-line px-5 py-6 text-center text-xs text-muted">
        <p>Build without AI. Explain every line.</p>
        <CloudSync />
      </footer>
    </div>
    </LangContext.Provider>
  )
}
