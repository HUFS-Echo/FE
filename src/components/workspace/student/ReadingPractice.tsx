import { useRef, useState } from 'react';
import { READING_QUESTIONS, WEEK, type ReadingQuestion } from '../../../api/adapters';
import type { SummaryData } from './PracticeSummary';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

type Submission = { value: string; correct: boolean };

const REVIEW_EXPLANATIONS = [
  'eu와 함께 쓰는 ser의 현재형은 sou예요.',
  'varanda는 여성 단수 명사예요.',
  '일시적인 상태를 나타낼 때는 estar를 써요.',
  'cozinha는 여성 명사라 sujo가 suja로 바뀌어요.',
  'escritório는 남성 단수 명사예요.',
];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('pt-PT').normalize('NFC').replace(/\s+/g, ' ').replace(/[.!?…]+$/, '');
}

function renderSolvedPrompt(question: ReadingQuestion, value: string, correctAnswer = false) {
  if (question.type === 'form') return correctAnswer ? 'eu + sou' : question.prompt;
  if (question.type === 'correct') {
    const replacement = correctAnswer ? question.answer : value || '___';
    return question.prompt.replace('[é]', `[${replacement}]`);
  }
  const replacement = correctAnswer ? question.answer : value || '___';
  return question.prompt.replace('___', replacement);
}

export function ReadingPractice({ onBack, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [showReview, setShowReview] = useState(false);
  const startedAt = useRef(Date.now());
  const current = READING_QUESTIONS[index];
  const currentSubmission = submissions[current.id];
  const isLast = index === READING_QUESTIONS.length - 1;

  function submitAnswer() {
    if (currentSubmission) return;
    const correct = normalize(answer) === normalize(current.answer);
    setSubmissions((previous) => ({ ...previous, [current.id]: { value: answer.trim(), correct } }));
    if (isLast) setShowReview(true);
  }

  function goToQuestion(nextIndex: number) {
    setIndex(nextIndex);
    setAnswer(submissions[READING_QUESTIONS[nextIndex].id]?.value ?? '');
  }

  function resetCurrent() {
    setSubmissions(({ [current.id]: _removed, ...remaining }) => remaining);
    setAnswer('');
  }

  function completePractice() {
    if (!currentSubmission || !isLast) return;
    const total = READING_QUESTIONS.length;
    const correctCount = Object.values(submissions).filter((submission) => submission.correct).length;
    const corrections = READING_QUESTIONS.flatMap((question) => {
      const submission = submissions[question.id];
      if (!submission || submission.correct) return [];
      return [{
        original: renderSolvedPrompt(question, submission.value),
        corrected: renderSolvedPrompt(question, submission.value, true),
      }];
    });
    const accuracy = Math.round((correctCount / total) * 100);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    onComplete({
      subject: 'reading',
      title: 'Muito bem!',
      message: `문법 ${total}문제를 모두 풀었어요. 오늘의 결과를 확인해 보세요.`,
      stats: [
        { label: '정답', value: String(correctCount), suffix: `/ ${total}` },
        { label: '정확도', value: String(accuracy), suffix: '%' },
        { label: '연습 시간', value: String(minutes), suffix: '분' },
      ],
      corrections,
    });
  }

  const answerFieldLabel = current.type === 'rewrite' ? '문장을 다시 써 보세요' : '답을 입력하세요';
  const inputPlaceholder = current.type === 'form' ? 'ser의 현재형을 입력하세요' : current.type === 'correct' ? '고친 동사를 입력하세요' : current.type === 'rewrite' ? 'A cozinha está ...' : '부정관사를 입력하세요';

  if (showReview) {
    return (
      <section className="grammar-review" aria-labelledby="grammar-review-title">
        <div className="grammar-review__eyebrow">{WEEK.label} <i aria-hidden="true">/</i> 문법</div>
        <h1 id="grammar-review-title">정답과 예시 답안</h1>
        <p className="grammar-review__intro">내 답변과 비교해 보세요.</p>
        <ol className="grammar-review__list">
          {READING_QUESTIONS.map((question, questionIndex) => (
            <li className="grammar-review__card" key={question.id}>
              <span className="grammar-review__label">{String(questionIndex + 1).padStart(2, '0')} {question.label}</span>
              <div className="grammar-review__answer">
                <strong>{question.answer}</strong>
                <p>{REVIEW_EXPLANATIONS[questionIndex] ?? question.explanation}</p>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="grammar-review__exit" onClick={completePractice}>종료하기 <ArrowIcon /></button>
      </section>
    );
  }

  return (
    <section className="grammar-practice" aria-label="포르투갈어 문법 연습">
      <div className="grammar-practice__top">
        <span>{WEEK.label} <i aria-hidden="true">/</i> 문법</span>
        <b aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(READING_QUESTIONS.length).padStart(2, '0')}</b>
      </div>

      <div className="grammar-progress" role="progressbar" aria-label="문법 연습 진행" aria-valuemin={0} aria-valuemax={READING_QUESTIONS.length} aria-valuenow={index + (currentSubmission ? 1 : 0)}>
        {READING_QUESTIONS.map((question, step) => (
          <span key={question.id} className={step < index || (step === index && currentSubmission) ? 'is-complete' : step === index ? 'is-current' : ''} />
        ))}
      </div>

      <header className="grammar-practice__heading" key={current.id}>
        <span className="grammar-practice__step">{String(index + 1).padStart(2, '0')} <i>/</i> 05</span>
        <h1>{current.label}</h1>
        <p>{current.instruction}</p>
      </header>

      {index < 3 ? (
        <article className="grammar-prompt grammar-prompt--boo">
          <div className="grammar-prompt__owl" aria-hidden="true"><img src="/owls/boo-writing.png" alt="" draggable={false} /></div>
          <img className="grammar-prompt__bubble" src="/grammar-assets/green-speech-bubble.svg" alt="" aria-hidden="true" />
          <div className="grammar-prompt__copy">
            <span>Boo <i aria-hidden="true">·</i> 제시문</span>
            <p>{current.prompt}</p>
          </div>
        </article>
      ) : (
        <article className="grammar-prompt grammar-prompt--plain">
          <span>제시 문장</span>
          <p>{current.prompt}</p>
        </article>
      )}

      {current.type === 'choice' ? (
        <fieldset className="grammar-answer grammar-answer--choices" disabled={Boolean(currentSubmission)}>
          <legend>응답 선택</legend>
          <div className="grammar-choice-list">
            {current.options?.map((option, optionIndex) => {
              const selected = answer === option;
              return (
                <button key={option} type="button" className={`grammar-choice${selected ? ' is-selected' : ''}${currentSubmission && option === current.answer ? ' is-answer' : ''}`} aria-pressed={selected} onClick={() => setAnswer(option)}>
                  <span className="grammar-choice__radio" aria-hidden="true">{selected ? '✓' : String.fromCharCode(65 + optionIndex)}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div className="grammar-answer">
          <label htmlFor="grammar-answer-input">{current.type === 'form' || current.type === 'correct' ? '내 답변' : answerFieldLabel}</label>
          <div className={`grammar-answer__field${currentSubmission ? currentSubmission.correct ? ' is-correct' : ' is-wrong' : ''}`}>
            <input
              id="grammar-answer-input"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim() && !currentSubmission) submitAnswer(); }}
              placeholder={inputPlaceholder}
              disabled={Boolean(currentSubmission)}
              autoComplete="off"
              autoCapitalize={current.type === 'rewrite' ? 'sentences' : 'none'}
              spellCheck={false}
            />
            {current.type === 'form' && <span className="grammar-answer__suffix">eu +</span>}
          </div>
        </div>
      )}

      {currentSubmission && (
        <div className={`grammar-feedback ${currentSubmission.correct ? 'is-correct' : 'is-wrong'}`} role="status">
          <span className="grammar-feedback__mark" aria-hidden="true">{currentSubmission.correct ? '✓' : '!'}</span>
          <div>
            <b>{currentSubmission.correct ? 'Muito bem!' : '다시 확인해 보세요'}</b>
            <p>정답은 <strong>{current.answer}</strong>예요. {current.explanation}</p>
          </div>
          <button type="button" onClick={resetCurrent}>다시 풀기</button>
        </div>
      )}

      <footer className="grammar-practice__footer">
        {index > 0 ? (
          <button type="button" className="grammar-button grammar-button--secondary" onClick={() => goToQuestion(index - 1)}>
            <BackIcon /> 이전 문항
          </button>
        ) : (
          <button type="button" className="grammar-button grammar-button--secondary" onClick={onBack}>
            <BackIcon /> 연습 선택
          </button>
        )}
        {currentSubmission ? (
          <button type="button" className="grammar-button grammar-button--primary" onClick={isLast ? completePractice : () => goToQuestion(index + 1)}>
            {isLast ? '학습 완료하고 결과 보기' : '다음 문항'} <ArrowIcon />
          </button>
        ) : (
          <button type="button" className="grammar-button grammar-button--primary" onClick={submitAnswer} disabled={!answer.trim()}>
            제출하고 해설 보기 <ArrowIcon />
          </button>
        )}
      </footer>
    </section>
  );
}

function BackIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4m3.5-3.5L4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
