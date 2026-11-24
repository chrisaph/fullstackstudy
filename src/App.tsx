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
import Quiz from './views/Quiz'
import TimerWidget from './views/Timer'
import LangTab from './views/LangTab'
import { LangContext, toCsharp, type Lang } from './lib/lang'
import Reflection from './views/Reflection'
import CloudSync from './views/CloudSync'
import QuickNotes from './views/QuickNotes'
import { PhClock, dayKey, useNow } from './lib/time'

const NAV = [['dashboard', 'Overview'], ['scorecard', 'Scorecard'], ['pathways', 'Pathways'], ['practice', 'Practice'], ['notebook', 'Notebook'], ['reflection', 'Reflection'], ['toolkit', 'Toolkit'], ['flashcards', 'Flashcards'], ['quiz', 'Quiz'], ['lang', 'Language']] as const

export default function App() {
  const [lang, setLang] = useLocal<Lang>('fs.lang', 'python')
  const ctx = useMemo(() => ({ lang, t: lang === 'csharp' ? toCsharp : (x: string) => x }), [lang])
  const [view, setView] = useState<string>('dashboard')
  const [navOpen, setNavOpen] = useState(false)
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
      <nav className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur" aria-label="Primary">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-5">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <span className="font-serif text-lg font-bold">Stack<span className="text-accent">Ledger</span></span>
            <span className="min-w-0 flex-1 truncate text-right text-sm text-muted">{view === 'lang' ? (lang === 'python' ? 'Python' : 'C#') : NAV.find(([id]) => id === view)?.[1] ?? 'Overview'}</span>
            <button type="button" aria-expanded={navOpen} aria-controls="site-navigation" onClick={() => setNavOpen((open) => !open)}
              className="min-h-10 shrink-0 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink">
              {navOpen ? 'Close menu' : 'Menu'}
            </button>
          </div>
          <div id="site-navigation" className={`${navOpen ? 'mt-3 flex flex-wrap items-center gap-x-4 gap-y-2' : 'hidden'}`}>
            <ul className="flex min-w-0 flex-1 flex-wrap gap-1">
              {NAV.map(([id, label]) => (
                <li key={id}><button onClick={() => { setView(id); setNavOpen(false); window.scrollTo(0, 0) }} aria-current={view === id ? 'page' : undefined}
                  className={`min-h-10 rounded-lg px-3 text-sm ${view === id ? 'bg-ink font-medium text-paper' : 'text-muted hover:bg-line/50 hover:text-ink'}`}>{id === 'lang' ? (lang === 'python' ? 'Python' : 'C#') : label}</button></li>
              ))}
            </ul>
            <div className="flex max-w-full flex-wrap items-center justify-between gap-3">
              <div role="radiogroup" aria-label="Site language focus" className="flex shrink-0 rounded-full border border-line bg-card p-0.5">
                {([['python', 'Python'], ['csharp', 'C#']] as const).map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={lang === k} onClick={() => setLang(k)}
                    className={`min-h-9 rounded-full px-3 text-sm font-semibold transition ${lang === k ? 'bg-accent text-white' : 'text-muted hover:text-ink'}`}>{l}</button>
                ))}
              </div>
              <TimerWidget />
              <PhClock />
            </div>
          </div>
        </div>
      </nav>
      <main id="main" className="mx-auto min-w-0 max-w-6xl px-4 py-7 sm:px-5 sm:py-10">
        {view === 'dashboard' && <Dashboard scores={scores} go={go} vark={vark} solved={solved} notes={notes.length} />}
        {view === 'scorecard' && <Scorecard scores={scores} setScores={setScores} snaps={snaps} setSnaps={setSnaps} notesBy={notesBy} setNotesBy={setNotesBy} />}
        {view === 'pathways' && <Pathways vark={vark} setVark={setVark} counted={counted} log={log} setLog={setLog} today={today} />}
        {view === 'practice' && <Practice ps={ps} setPs={setPs} custom={custom} setCustom={setCustom} />}
        {view === 'notebook' && <Notebook notes={notes} setNotes={setNotes} />}
        {view === 'reflection' && <Reflection log={log} setLog={setLog} mode={mode} setMode={setModeAndBase} baseDay={baseDay} resetNow={() => setBaseDay(today)} today={today} refl={refl} setRefl={setRefl} />}
        {view === 'toolkit' && <Toolkit />}
        {view === 'flashcards' && <Flashcards />}
        {view === 'quiz' && <Quiz key={lang} />}
        {view === 'lang' && <LangTab key={lang} />}
      </main>
      <QuickNotes notes={notes} setNotes={setNotes} openNotebook={() => go('notebook')} />
      <footer className="border-t border-line px-5 py-6 text-center text-xs text-muted">
        <p>Build without AI. Explain every line.</p>
        <CloudSync />
      </footer>
    </div>
    </LangContext.Provider>
  )
}
