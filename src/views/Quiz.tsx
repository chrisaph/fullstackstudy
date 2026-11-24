import { useEffect, useMemo, useState } from 'react'
import { buildQuizBank, shuffleQuestions } from '../lib/quiz'
import { useLang } from '../lib/lang'
import { Card, Title } from './ui'

export default function Quiz() {
  const { lang, t } = useLang()
  const [category, setCategory] = useState('All categories')
  const [position, setPosition] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [seed, setSeed] = useState(0)

  const bank = useMemo(() => buildQuizBank(lang, t), [lang, t])
  const categories = useMemo(() => [...new Set(bank.map((question) => question.category))], [bank])
  const filtered = useMemo(() => category === 'All categories' ? bank : bank.filter((question) => question.category === category), [bank, category])
  const queue = useMemo(() => shuffleQuestions(filtered), [filtered, seed])
  const question = queue[position]
  const selected = question ? answers[question.id] ?? null : null
  const selectedChoice = selected === null ? null : question?.choices[selected]
  const correctChoice = question?.choices.find((choice) => choice.correct)
  const answered = Object.keys(answers).length
  const score = Object.entries(answers).reduce((total, [questionId, choiceIndex]) => {
    const item = queue.find((entry) => entry.id === questionId)
    return total + (item?.choices[choiceIndex]?.correct ? 1 : 0)
  }, 0)

  useEffect(() => {
    setPosition(0)
    setAnswers({})
    setSeed((value) => value + 1)
  }, [lang, category])

  function choose(index: number) {
    if (selected !== null || !question) return
    setAnswers((current) => ({ ...current, [question.id]: index }))
  }

  function next() {
    if (selected === null) return
    setPosition((value) => value + 1)
  }

  function previous() {
    setPosition((value) => Math.max(0, value - 1))
  }

  function restart() {
    setPosition(0)
    setAnswers({})
    setSeed((value) => value + 1)
  }

  return (
    <>
      <Title kicker="Quiz" title="Check what you can explain." sub={`Questions cover the learning path, tools, security, pathways, and ${lang === 'python' ? 'Python' : 'C#'} topics. Each question has four choices and one correct answer; explanations appear as soon as you choose.`} />

      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 text-sm font-medium sm:flex-none">Category
          <select aria-label="Quiz category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-base sm:mt-0 sm:ml-2 sm:w-auto sm:max-w-[min(70vw,28rem)]">
            <option>All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <span className="text-sm text-muted sm:ml-auto">{answered} answered · {score} correct</span>
      </div>

      {question ? (
        <Card className="min-w-0 !p-4 sm:!p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{question.category}</p>
            <p className="text-sm text-muted">Question {position + 1} of {queue.length}</p>
          </div>
          <h2 className="mt-4 break-words font-serif text-xl font-semibold leading-snug sm:text-2xl">{question.prompt}</h2>
          <p className="mt-2 text-sm text-muted">Choose one answer. There are four options.</p>

          <div className="mt-5 grid gap-3">
            {question.choices.map((choice, index) => {
              const isSelected = selected === index
              const isCorrect = choice.correct
              const style = selected === null
                ? 'border-line bg-paper hover:border-ink'
                : isSelected && isCorrect
                  ? 'border-moss bg-moss/10 text-ink'
                  : isSelected
                    ? 'border-accent bg-accent-soft text-ink'
                    : isCorrect
                      ? 'border-moss bg-moss/10 text-ink'
                      : 'border-line bg-card text-muted'
              return (
                <button key={`${question.id}-${index}`} type="button" disabled={selected !== null} onClick={() => choose(index)}
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
            <button type="button" disabled={selected === null} onClick={next}
              className="min-h-11 w-full rounded-lg bg-ink px-5 text-base font-semibold text-paper hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              {position + 1 === queue.length ? 'Finish quiz' : 'Next question'}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="text-center">
          <h2 className="font-serif text-2xl font-semibold">Round complete</h2>
          <p className="mt-2 text-base text-muted">You got {score} of {answered} correct.</p>
          <button type="button" onClick={restart} className="mt-4 min-h-11 rounded-lg bg-ink px-5 text-base font-semibold text-paper hover:bg-accent">Start another round</button>
        </Card>
      )}
    </>
  )
}
