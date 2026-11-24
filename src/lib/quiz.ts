import {
  CORE_CONCEPTS, COOKIE_FLAGS, COOKIE_STEPS, DEVTOOLS, HOPS, MISTAKES, PROBLEMS, PROJECTS, ROADMAP,
  SCORE_MEANING, SECTIONS, SECURITY, SECRET_RESPONSE, TOPICS, UX, VARK,
} from './data'
import { CS_GROUPS, CS_NOTES, PY_GROUPS, PY_NOTES, type Lang } from './lang'

export type QuizChoice = { text: string; correct: boolean; explanation: string }
export type QuizQuestion = { id: string; category: string; prompt: string; choices: QuizChoice[] }

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function makeQuestion(
  id: string,
  category: string,
  prompt: string,
  correctText: string,
  correctExplanation: string,
  wrong: { text: string; explanation: string }[],
): QuizQuestion {
  const uniqueWrong = [...new Map(wrong.filter((item) => item.text !== correctText).map((item) => [item.text, item])).values()]
  const distractors = shuffled(uniqueWrong).slice(0, 3)
  if (distractors.length < 3) throw new Error(`Quiz question "${id}" needs three distinct distractors.`)
  return {
    id,
    category,
    prompt,
    choices: shuffled([
      { text: correctText, correct: true, explanation: correctExplanation },
      ...distractors.map((item) => ({ ...item, correct: false })),
    ]),
  }
}

function alternatives<T>(items: T[], correct: T, text: (item: T) => string, explanation: (item: T) => string) {
  return items.filter((item) => item !== correct).map((item) => ({ text: text(item), explanation: explanation(item) }))
}

export function buildQuizBank(lang: Lang, translate: (text: string) => string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const sectionTitles = SECTIONS.map((section) => translate(section.title))

  CORE_CONCEPTS.forEach(([prompt, answer], index) => questions.push(makeQuestion(
    `core-concept-${index}`, 'Core concepts', `Which statement best answers “${translate(prompt)}”?`, translate(answer),
    translate(answer),
    CORE_CONCEPTS.filter((_, otherIndex) => otherIndex !== index).map(([otherPrompt, otherAnswer]) => ({
      text: translate(otherAnswer), explanation: `That describes “${translate(otherPrompt)},” not “${translate(prompt)}.”`,
    })),
  )))

  // Every scorecard objective is represented, and every answer points back to its section.
  SECTIONS.forEach((section) => section.items.forEach((item, index) => {
    const answer = translate(section.title)
    const blurb = translate(section.blurb)
    questions.push(makeQuestion(
      `score-${section.id}-${index}`, answer,
      `Which learning category includes this goal: “${translate(item)}”?`,
      answer,
      `This goal belongs to ${answer}. ${blurb}`,
      sectionTitles.filter((title) => title !== answer).map((title) => ({
        text: title,
        explanation: `This goal is listed under ${answer}, whose focus is ${blurb}`,
      })),
    ))
  }))

  // The pathway objectives and each of their VARK activities are drawn from TOPICS.
  const topicGoals = TOPICS.map((topic) => translate(topic.goal))
  TOPICS.forEach((topic) => {
    const title = translate(topic.title)
    const goal = translate(topic.goal)
    questions.push(makeQuestion(
      `pathway-goal-${topic.id}`, 'Study pathways',
      `What is the main goal of the “${title}” pathway?`, goal,
      `That is the goal listed for ${title}.`,
      topicGoals.filter((item) => item !== goal).map((item) => ({ text: item, explanation: `That goal belongs to another pathway; ${title} focuses on ${goal}` })),
    ))
    ;(['V', 'A', 'R', 'K'] as const).forEach((style) => {
      const activity = translate(topic[style])
      const styleName = VARK[style].name
      const otherActivities = (['V', 'A', 'R', 'K'] as const)
        .filter((other) => other !== style)
        .map((other) => ({
          text: translate(topic[other]),
          explanation: `That activity is the ${VARK[other].name} approach. The ${styleName} activity is ${activity}`,
        }))
      questions.push(makeQuestion(
        `pathway-${topic.id}-${style}`, 'Study pathways',
        `For “${title},” which activity uses the ${styleName} learning style?`, activity,
        `This activity is listed under the ${styleName} approach for ${title}.`, otherActivities,
      ))
    })
  })

  // Every request hop, cookie concept, browser tool, UX principle, and security row is covered.
  const hopRows = HOPS.map(([name, description]) => ({ name: translate(name), description: translate(description) }))
  hopRows.forEach((target) => questions.push(makeQuestion(
    `hop-${target.name}`, 'Request path', `What happens at the “${target.name}” hop?`, target.description,
    `${target.name}: ${target.description}`,
    alternatives(hopRows, target, (item) => item.description, (item) => `That describes the ${item.name} hop, not ${target.name}.`),
  )))

  const cookieRows = COOKIE_STEPS.map(([name, description]) => ({ name, description }))
  cookieRows.forEach((target) => questions.push(makeQuestion(
    `cookie-step-${target.name}`, 'Cookies', `What happens during “${target.name}” in a cookie’s lifecycle?`, target.description,
    `${target.name}: ${target.description}`,
    alternatives(cookieRows, target, (item) => item.description, (item) => `That describes “${item.name}.” This question asks about “${target.name}.”`),
  )))
  COOKIE_FLAGS.forEach(([flag, description]) => questions.push(makeQuestion(
    `cookie-flag-${flag}`, 'Cookies', `What does the ${flag} cookie attribute do?`, description,
    `${flag}: ${description}`,
    COOKIE_FLAGS.filter(([name]) => name !== flag).map(([name, text]) => ({ text, explanation: `That describes ${name}, not ${flag}.` })),
  )))

  DEVTOOLS.forEach(([panel, description]) => questions.push(makeQuestion(
    `devtools-${panel}`, 'Browser DevTools', `What is the ${panel} panel used for?`, description,
    `${panel} is used for this purpose: ${description}`,
    DEVTOOLS.filter(([name]) => name !== panel).map(([name, text]) => ({ text, explanation: `That is the ${name} panel’s job, not the ${panel} panel’s.` })),
  )))
  UX.forEach((principle) => questions.push(makeQuestion(
    `ux-${principle.t}`, 'UI/UX', `Which statement explains the “${principle.t}” principle?`, principle.d,
    `${principle.t}: ${principle.d}`,
    UX.filter((item) => item.t !== principle.t).map((item) => ({ text: item.d, explanation: `That explanation describes ${item.t}, not ${principle.t}.` })),
  )))

  SECURITY.forEach(([risk, defense, pitfall]) => questions.push(makeQuestion(
    `security-${risk}`, 'Security', `For “${risk},” which approach matches the learning guide?`, defense,
    `${defense} addresses ${risk}. The pitfall to avoid is ${pitfall}.`,
    SECURITY.filter(([name]) => name !== risk).map(([name, otherDefense]) => ({ text: otherDefense, explanation: `That is the listed defense for ${name}, not ${risk}.` })),
  )))
  SECRET_RESPONSE.forEach((step, index) => {
    questions.push(makeQuestion(
      `secret-response-${index}`, 'Security', `Which action is step ${index + 1} in the committed-secret response sequence?`, step,
      `The response order is: ${SECRET_RESPONSE.join(' → ')}.`,
      SECRET_RESPONSE.filter((item) => item !== step).map((item) => ({ text: item, explanation: `That is step ${SECRET_RESPONSE.indexOf(item) + 1}, not step ${index + 1}.` })),
    ))
  })

  const problemHints = PROBLEMS.map((problem) => ({ title: problem.title, pattern: problem.pattern, hint: translate(problem.hint) }))
  problemHints.forEach((target) => questions.push(makeQuestion(
    `problem-${target.title}`, 'Problem solving', `Which hint best matches “${target.title}” (${target.pattern})?`, target.hint,
    `${target.title} uses the ${target.pattern} pattern: ${target.hint}`,
    alternatives(problemHints, target, (item) => item.hint, (item) => `That hint belongs to ${item.title} (${item.pattern}), not ${target.title}.`),
  )))

  const varkHabits = (Object.entries(VARK) as [keyof typeof VARK, typeof VARK[keyof typeof VARK]][])
    .flatMap(([key, value]) => value.habits.map((habit) => ({ style: value.name, key, habit: translate(habit) })))
  varkHabits.forEach((target) => questions.push(makeQuestion(
    `vark-${target.key}-${target.habit}`, 'Learning styles', `Which habit best matches the ${target.style} learning style?`, target.habit,
    `This habit is listed for the ${target.style} style.`,
    alternatives(varkHabits.filter((item) => item.style !== target.style), target, (item) => item.habit, (item) => `That is a ${item.style} habit, not a ${target.style} habit.`),
  )))

  ROADMAP.forEach(([month, plan]) => questions.push(makeQuestion(
    `roadmap-${month}`, 'Roadmap', `What does the roadmap focus on in ${month}?`, translate(plan),
    `${month} focuses on ${translate(plan)}.`,
      [
        ...ROADMAP.filter(([otherMonth]) => otherMonth !== month).map(([, otherPlan]) => ({ text: translate(otherPlan), explanation: `That plan belongs to a different month; ${month} focuses on ${translate(plan)}.` })),
        { text: 'Spend the month only changing editor themes and fonts.', explanation: 'That is not one of the roadmap plans. The roadmap lists a focused development milestone for each month.' },
      ],
  )))
  PROJECTS.forEach(([project, focus]) => questions.push(makeQuestion(
    `project-${project}`, 'Projects', `Which practice areas are included in “${project}”?`, translate(focus),
    `${project} is designed to practise ${translate(focus)}.`,
    PROJECTS.filter(([name]) => name !== project).map(([name, otherFocus]) => ({ text: translate(otherFocus), explanation: `That focus belongs to “${name},” not “${project}.”` })),
  )))

  SCORE_MEANING.forEach((meaning, index) => questions.push(makeQuestion(
    `score-meaning-${index}`, 'Scorecard', `What does a score of ${index} mean on the self-audit?`, translate(meaning),
    `A score of ${index} means: ${translate(meaning)}`,
    SCORE_MEANING.filter((_, otherIndex) => otherIndex !== index).map((text, otherIndex) => {
      const actualIndex = SCORE_MEANING.indexOf(text)
      return { text: translate(text), explanation: `That is the description for score ${actualIndex}, not score ${index}.` }
    }),
  )))

  const mistakePrompts = [
    'Which performance issue can appear when a serializer triggers one extra query for every returned row?',
    'Which production configuration group includes debug mode, loose host checks, and allowing every origin?',
    'What can happen when a secret is committed before the ignore file is configured?',
    'Which test suite problem can make results depend on what ran earlier?',
    'Which commit practice makes changes hard to review and revert?',
    'What is wrong with treating browser-side checks as a security boundary?',
    'Which coverage goal can distract from testing risky code paths?',
    'What is the risk of copying generated code without being able to explain it?',
  ]
  MISTAKES.forEach((mistake, index) => questions.push(makeQuestion(
    `mistake-${index}`, 'Production & process', mistakePrompts[index], translate(mistake),
    `The learning guide lists “${translate(mistake)}” as a common mistake.`,
    MISTAKES.filter((_, itemIndex) => itemIndex !== index).map((item) => ({ text: translate(item), explanation: `That is another listed pitfall, but it does not match the specific issue in this question.` })),
  )))

  const groups = lang === 'python' ? PY_GROUPS : CS_GROUPS
  const lessons = lang === 'python' ? PY_NOTES : CS_NOTES
  const languageName = lang === 'python' ? 'Python' : 'C#'
  groups.forEach((group) => group.topics.forEach((topic, index) => {
    questions.push(makeQuestion(
      `language-map-${lang}-${group.title}-${index}`, `${languageName} · ${group.title}`,
      `In the ${languageName} learning map, which category includes “${topic}”?`, group.title,
      `“${topic}” is included in the ${group.title} category in the ${languageName} learning map.`,
      groups.filter((item) => item.title !== group.title).map((item) => ({ text: item.title, explanation: `The learning map places “${topic}” under ${group.title}, not ${item.title}.` })),
    ))
  }))

  const lessonRows = Object.entries(lessons)
  lessonRows.forEach(([title, lesson]) => {
    const group = groups.find((item) => item.topics.includes(title))?.title ?? `${languageName} Tutorial`
    questions.push(makeQuestion(
      `lesson-${lang}-${title}`, `${languageName} · ${group}`,
      `Which statement correctly describes “${title}”?`, lesson.text,
      `${title}: ${lesson.text}`,
      lessonRows.filter(([otherTitle]) => otherTitle !== title).map(([otherTitle, otherLesson]) => ({
        text: otherLesson.text,
        explanation: `That describes “${otherTitle},” not “${title}.” ${title} is described as: ${lesson.text}`,
      })),
    ))
  })

  return questions
}

export function shuffleQuestions(questions: QuizQuestion[]) {
  return shuffled(questions)
}
