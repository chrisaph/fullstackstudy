import { useEffect, useMemo } from 'react'
import { buildQuizBank, shuffleQuestions } from '../lib/quiz'
import { useLang } from '../lib/lang'
import { useLocal } from '../lib/store'
import { Card, Title } from './ui'

export default function Quiz() {
  const { lang, t } = useLang()
  const [category, setCategory] = useLocal(`fs.quiz.${lang}.category`, 'All categories')
  const [position, setPosition] = useLocal(`fs.quiz.${lang}.position`, 0)
  const [answers, setAnswers] = useLocal<Record<string, string>>(`fs.quiz.${lang}.answers`, {})
  const [orderIds, setOrderIds] = useLocal<string[]>(`fs.quiz.${lang}.order`, [])

  const bank = useMemo(() => buildQuizBank(lang, t), [lang, t])
  const categories = useMemo(() => [...new Set(bank.map((question) => question.category))], [bank])
  const filtered = useMemo(() => category === 'All categories' ? bank : bank.filter((question) => question.category === category), [bank, category])
  const queue = useMemo(() => {
    if (!orderIds.length) return filtered
    const byId = new Map(filtered.map((question) => [question.id, question]))
    const ordered = orderIds.flatMap((id) => {
      const item = byId.get(id)
      return item ? [item] : []
    })
    const used = new Set(ordered.map((question) => question.id))
    return [...ordered, ...filtered.filter((question) => !used.has(question.id))]
  }, [filtered, orderIds])
  const question = queue[position]
  const selected = question ? question.choices.findIndex((choice) => choice.text === answers[question.id]) : -1
  const selectedChoice = selected < 0 ? null : question?.choices[selected]
  const correctChoice = question?.choices.find((choice) => choice.correct)
  const answered = queue.filter((item) => answers[item.id] !== undefined).length
  const score = queue.filter((item) => item.choices.some((choice) => choice.correct && choice.text === answers[item.id])).length

  useEffect(() => {
    setPosition(0)
  }, [category, setPosition])

  function choose(index: number) {
    if (!question) return
    setAnswers((current) => ({ ...current, [question.id]: question.choices[index].text }))
  }

  function next() {
    if (selectedChoice === null) return
    setPosition((value) => Math.min(queue.length, value + 1))
  }

  function previous() {
    setPosition((value) => Math.max(0, value - 1))
  }

  function shuffle() {
    setOrderIds(shuffleQuestions(filtered).map((item) => item.id))
    setPosition(0)
  }

  function reset() {
    setAnswers({})
    setOrderIds([])
    setPosition(0)
  }

  return (
    <>
      <Title kicker="Quiz" title="Check what you can explain." sub={`Questions cover the learning path, tools, security, pathways, and ${lang === 'python' ? 'Python' : 'C#'} topics. Each question has four choices and one correct answer; explanations appear as soon as you choose.`} />

      <div className="mb-5 flex min-w-0 flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm font-medium sm:flex-none">Category
          <select aria-label="Quiz category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-base sm:mt-0 sm:ml-2 sm:w-auto sm:max-w-[min(70vw,28rem)]">
            <option>All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="min-w-0 flex-1 text-sm font-medium sm:flex-none">Go to question
          <select aria-label="Go to question number" value={question ? String(position) : ''} onChange={(event) => { if (event.target.value !== '') setPosition(Number(event.target.value)) }} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-base sm:mt-0 sm:ml-2 sm:w-auto">
            <option value="">Choose a number</option>
            {queue.map((item, index) => <option key={item.id} value={index}>Question {index + 1}</option>)}
          </select>
        </label>
        <span className="text-sm text-muted sm:ml-auto">{answered} answered · {score} correct</span>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button type="button" onClick={shuffle} className="min-h-11 flex-1 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:border-ink sm:flex-none">Shuffle questions</button>
          <button type="button" onClick={reset} className="min-h-11 flex-1 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-accent hover:border-accent sm:flex-none">Reset questions</button>
        </div>
      </div>

      {question ? (
        <Card className="min-w-0 !p-4 sm:!p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{question.category}</p>
            <p className="text-sm text-muted">Question {position + 1} of {queue.length}</p>
          </div>
          <h2 className="mt-4 break-words font-serif text-xl font-semibold leading-snug sm:text-2xl">{question.prompt}</h2>
          <p className="mt-2 text-sm text-muted">Choose one answer. You can change your answer at any time.</p>

          <div className="mt-5 grid gap-3">
            {question.choices.map((choice, index) => {
              const isSelected = selected === index
              const style = selected < 0
                ? 'border-line bg-paper hover:border-ink'
                : isSelected && choice.correct
                  ? 'border-moss bg-moss/10 text-ink'
                  : isSelected
                    ? 'border-accent bg-accent-soft text-ink'
                    : choice.correct
                      ? 'border-moss bg-moss/10 text-ink'
                      : 'border-line bg-card text-muted'
              return (
                <button key={`${question.id}-${index}`} type="button" onClick={() => choose(index)}
                  aria-pressed={isSelected} className={`min-h-12 w-full rounded-xl border px-4 py-3 text-left text-base leading-relaxed transition [overflow-wrap:anywhere] sm:text-lg ${style}`}>
                  <span className="mr-2 font-mono text-sm font-semibold text-accent">{String.fromCharCode(65 + index)}.</span>{choice.text}
                </button>
              )
            })}
          </div>

          {selectedChoice && correctChoice && (
            <div role="status" aria-live="polite" className={`mt-5 rounded-xl border p-4 text-base leading-relaxed ${selectedChoice.correct ? 'border-moss bg-moss/10' : 'border-accent bg-accent-soft'}`}>
              {selectedChoice.correct ? (
                <p><b>Correct.</b> {selectedChoice.explanation}</p>
              ) : (
                <div>
                  <p><b>Not quite.</b> {selectedChoice.explanation}</p>
                  <p className="mt-2"><b>Correct answer: {correctChoice.text}</b> — {correctChoice.explanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button type="button" disabled={position === 0} onClick={previous}
              className="min-h-11 w-full rounded-lg border border-line bg-card px-5 text-base font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              Previous question
            </button>
            <button type="button" disabled={selectedChoice === null} onClick={next}
              className="min-h-11 w-full rounded-lg bg-ink px-5 text-base font-semibold text-paper hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              {position + 1 === queue.length ? 'Finish quiz' : 'Next question'}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="text-center">
          <h2 className="font-serif text-2xl font-semibold">Round complete</h2>
          <p className="mt-2 text-base text-muted">You got {score} of {answered} correct.</p>
          <button type="button" onClick={previous} className="mt-4 min-h-11 rounded-lg bg-ink px-5 text-base font-semibold text-paper hover:bg-accent">Review last question</button>
        </Card>
      )}
    </>
  )
}
