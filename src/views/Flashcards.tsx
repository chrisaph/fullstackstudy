import { useEffect, useMemo, useRef, useState } from 'react'
import { HOPS, COOKIE_STEPS, COOKIE_FLAGS, DEVTOOLS, SECURITY, SECRET_RESPONSE, UX, TOPICS, VARK, REVIEW_PROMPTS, type Level } from '../lib/data'
import { PY_NOTES, CS_NOTES, useLang } from '../lib/lang'
import { useLocal } from '../lib/store'
import { Card, Title, Btn } from './ui'

type FC = { id: string; deck: string; q: string; a: string; code?: string }
const CORE: [string, string][] = [
  ['What is the difference between authentication and authorization?', 'Authentication proves who you are (login). Authorization decides what you may do (permissions). A valid token that lets you read another user\'s order is an authorization bug.'],
  ['What is an N+1 query?', 'One query loads N parent rows, then one extra query per row loads a relation. Fix by loading relations together (joins / eager loading) and watch for it behind serializers.'],
  ['CSRF vs XSS?', 'CSRF tricks a logged-in browser into sending an unwanted request (defend: SameSite cookies, CSRF tokens). XSS injects script into your page (defend: output encoding, CSP, HttpOnly cookies).'],
  ['What does a 401 mean versus a 403?', '401: not authenticated (missing/invalid credentials). 403: authenticated but not allowed.'],
  ['What are the common HTTP status families?', '2xx success, 3xx redirect, 4xx client error, 5xx server error. 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 409 Conflict, 429 Too Many Requests.'],
  ['PUT vs PATCH vs POST?', 'POST creates (not idempotent). PUT replaces a resource (idempotent). PATCH partially updates.'],
  ['What is a database index and its cost?', 'A sorted structure (often a B-tree) that speeds lookups and ordering. Costs storage and slows writes.'],
  ['What does ACID stand for?', 'Atomicity, Consistency, Isolation, Durability: the guarantees of a transaction.'],
  ['What is the event loop?', 'JavaScript runs one call stack. Async callbacks queue up; microtasks (promises) run before the next macrotask (timers, I/O).'],
  ['Why is client-side validation not security?', 'The client is untrusted and can be bypassed. Always validate on the server.'],
  ['Why do small commits matter?', 'They are easy to review, revert, bisect, and explain. Mix refactors and features and review becomes impossible.'],
  ['Unit vs integration vs end-to-end test?', 'Unit: one piece in isolation. Integration: pieces together (e.g. view + DB). End-to-end: the whole system through the UI. Prefer many units, fewer E2E.'],
  ['What is the 12-factor stance on config?', 'Store config in environment variables, never in code. Keep dev and prod identical except for config.'],
  ['Why is DEBUG=True in production a catastrophe?', 'It leaks stack traces, settings and SQL to attackers.'],
  ['What is a build step and why does the front-end have one?', 'Bundling, transpiling and minifying code for browsers. Back-ends usually run source directly.'],
]

export default function Flashcards() {
  const { lang, t } = useLang()
  const [custom, setCustom] = useLocal<FC[]>('fs.fc.custom', [])
  const [box, setBox] = useLocal<Record<string, number>>('fs.fc.box', {})
  const [deck, setDeck] = useState('All')
  const [weak, setWeak] = useState(false)
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [seed, setSeed] = useState(0)
  const [nq, setNq] = useState(''); const [na, setNa] = useState('')
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const skipClick = useRef(false)

  const cards = useMemo<FC[]>(() => {
    const out: FC[] = []
    CORE.forEach(([q, a], k) => out.push({ id: `core${k}`, deck: 'Core concepts', q: t(q), a: t(a) }))
    HOPS.forEach(([n, d]) => out.push({ id: `hop${n}`, deck: 'Request path', q: `What happens at the "${n}" hop?`, a: t(d) }))
    COOKIE_STEPS.forEach(([n, d]) => out.push({ id: `ck${n}`, deck: 'Cookies', q: `Cookie lifecycle: "${n}"?`, a: d }))
    COOKIE_FLAGS.forEach(([n, d]) => out.push({ id: `cf${n}`, deck: 'Cookies', q: `What does the ${n} cookie attribute do?`, a: d }))
    DEVTOOLS.forEach(([n, d]) => out.push({ id: `dt${n}`, deck: 'DevTools', q: `What is the ${n} panel for?`, a: d }))
    SECURITY.forEach(([p, im, pit]) => out.push({ id: `sec${p}`, deck: 'Security', q: `${p}: how do you implement it and what is the pitfall?`, a: `Implementation: ${im}. Pitfall: ${pit}.` }))
    out.push({ id: 'secret', deck: 'Security', q: 'A secret was committed to main. What do you do, in order?', a: SECRET_RESPONSE.map((s, k) => `${k + 1}. ${t(s)}`).join('\n') })
    UX.forEach((u) => out.push({ id: `ux${u.t}`, deck: 'UI/UX', q: `UI/UX principle: ${u.t}?`, a: u.d }))
    TOPICS.forEach((tp) => out.push({ id: `tp${tp.id}`, deck: 'Pathway goals', q: `${t(tp.title)}: what is the goal and a kinesthetic activity?`, a: `${t(tp.goal)}\nDo: ${t(tp.K)}` }))
    ;(Object.keys(VARK) as Level[]).forEach((l) => out.push({ id: `vk${l}`, deck: 'VARK', q: `VARK ${VARK[l].name}: how to learn this way?`, a: `${VARK[l].tagline} ${VARK[l].habits.join('; ')}.` }))
    REVIEW_PROMPTS.forEach((p, k) => out.push({ id: `rv${k}`, deck: 'Review prompts', q: t(p), a: 'Answer aloud without notes, then check your notebook.' }))
    const notes = lang === 'python' ? PY_NOTES : CS_NOTES
    const dn = lang === 'python' ? 'Python syntax' : 'C# syntax'
    Object.entries(notes).forEach(([k, v]) => out.push({ id: `${lang}${k}`, deck: dn, q: `${k}: explain it and write an example from memory.`, a: v.text, code: v.code }))
    return [...out, ...custom]
  }, [lang, t, custom])

  const decks = ['All', ...Array.from(new Set(cards.map((c) => c.deck)))]
  const queue = useMemo(() => {
    const f = cards.filter((c) => (deck === 'All' || c.deck === deck) && (!weak || (box[c.id] ?? 0) <= 2))
    return f.map((c) => ({ c, r: Math.random() })).sort((a, b) => (box[a.c.id] ?? 0) - (box[b.c.id] ?? 0) || a.r - b.r).map((x) => x.c)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, deck, weak, seed])
  const cur = queue[Math.min(i, queue.length - 1)]
  const next = () => { setFlip(false); setI((x) => (x + 1 >= queue.length ? 0 : x + 1)) }
  const prev = () => { setFlip(false); setI((x) => (x <= 0 ? queue.length - 1 : x - 1)) }
  const rate = (d: number) => { if (!cur) return; setBox((b) => ({ ...b, [cur.id]: d === 0 ? 1 : Math.min(5, (b[cur.id] ?? 0) + d) })); next() }
  useEffect(() => { setI(0); setFlip(false) }, [deck, weak])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === ' ') { e.preventDefault(); setFlip((f) => !f) }
      else if (e.key === 'ArrowLeft') prev(); else if (e.key === 'ArrowRight') next(); else if (flip && e.key === '1') rate(0); else if (flip && e.key === '2') rate(1); else if (flip && e.key === '3') rate(2)
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })
  const mastered = cards.filter((c) => (box[c.id] ?? 0) >= 4).length

  return (
    <>
      <Title kicker="Flashcards" title="Recall beats rereading." sub="Cards are built from every concept on this site, plus your own. Try to answer aloud before flipping, then rate yourself: weak cards come back first." />
      <div className="mb-4 flex min-w-0 flex-wrap items-center gap-3">
        <select aria-label="Deck" value={deck} onChange={(e) => setDeck(e.target.value)} className="min-h-10 max-w-full rounded-lg border border-line bg-card px-3 text-sm">{decks.map((d) => <option key={d}>{d}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={weak} onChange={(e) => setWeak(e.target.checked)} />Weak or new only</label>
        <Btn kind="ghost" onClick={() => { setSeed((s) => s + 1); setI(0); setFlip(false) }}>Shuffle</Btn>
        <span className="text-sm text-muted sm:ml-auto">{mastered} of {cards.length} mastered</span>
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {cur ? (
            <>
              <button
                onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }}
                onTouchEnd={(event) => {
                  if (!touchStart.current) return
                  const dx = event.changedTouches[0].clientX - touchStart.current.x
                  const dy = event.changedTouches[0].clientY - touchStart.current.y
                  touchStart.current = null
                  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    skipClick.current = true
                    window.setTimeout(() => { skipClick.current = false }, 350)
                    if (dx < 0) next(); else prev()
                  }
                }}
                onClick={() => { if (skipClick.current) { skipClick.current = false; return } setFlip((value) => !value) }}
                aria-label="Flashcard. Tap to flip, swipe left for the next card or right for the previous card."
                className="block min-h-[18rem] w-full min-w-0 touch-pan-y rounded-2xl border border-line bg-card p-4 text-left transition hover:border-ink sm:min-h-72 sm:p-8">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{cur.deck} · {Math.min(i, queue.length - 1) + 1}/{queue.length} · box {box[cur.id] ?? 0}</p>
                <p className="mt-5 break-words font-serif text-xl font-semibold leading-snug sm:mt-6 sm:text-2xl">{cur.q}</p>
                {flip ? (
                  <div className="mt-5 min-w-0 border-t border-line pt-4 sm:mt-6"><p className="whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere] sm:text-lg">{cur.a}</p>
                    {cur.code && <pre className="mt-3 max-w-full overflow-x-auto rounded-lg bg-ink p-3 font-mono text-sm text-paper"><code>{cur.code}</code></pre>}</div>
                ) : <p className="mt-5 text-base text-muted sm:mt-6">Tap to reveal · swipe left or right to move</p>}
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center">
                <Btn kind="ghost" onClick={prev}>← Previous</Btn>
                {flip ? (<>
                  <Btn kind="ghost" onClick={() => rate(0)}>1 · Again</Btn><Btn kind="ghost" onClick={() => rate(1)}>2 · Good</Btn><Btn onClick={() => rate(2)}>3 · Easy</Btn>
                </>) : <Btn onClick={() => setFlip(true)}>Show answer</Btn>}
                <Btn kind="ghost" onClick={next}>Skip</Btn>
              </div>
            </>
          ) : <Card><p className="text-muted">No cards match. Turn off "Weak or new only" or pick another deck.</p></Card>}
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="font-serif text-lg font-semibold">Add your own card</h2>
            <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); if (nq.trim() && na.trim()) { setCustom((p) => [...p, { id: crypto.randomUUID(), deck: 'My cards', q: nq.trim(), a: na.trim() }]); setNq(''); setNa('') } }}>
              <input aria-label="Question" placeholder="Question or term" value={nq} onChange={(e) => setNq(e.target.value)} className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm" />
              <textarea aria-label="Answer" placeholder="Answer" rows={3} value={na} onChange={(e) => setNa(e.target.value)} className="w-full rounded-lg border border-line bg-paper p-2 text-sm" />
              <Btn type="submit">Add card</Btn>
            </form>
            {custom.length > 0 && <ul className="mt-3 space-y-1 text-sm">{custom.map((c) => <li key={c.id} className="flex justify-between gap-2"><span className="truncate">{c.q}</span><button className="text-xs text-muted underline" onClick={() => setCustom((p) => p.filter((x) => x.id !== c.id))}>remove</button></li>)}</ul>}
          </Card>
          <Card>
            <h2 className="font-serif text-lg font-semibold">Decks</h2>
            <ul className="mt-2 space-y-1 text-sm">{decks.slice(1).map((d) => { const dc = cards.filter((c) => c.deck === d); return <li key={d} className="flex justify-between"><button className="underline-offset-2 hover:underline" onClick={() => setDeck(d)}>{d}</button><span className="font-mono text-muted">{dc.filter((c) => (box[c.id] ?? 0) >= 4).length}/{dc.length}</span></li> })}</ul>
          </Card>
        </div>
      </div>
    </>
  )
}
