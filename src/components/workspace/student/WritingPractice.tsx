import { useRef, useState } from 'react';
import { WEEK } from '../../../api/adapters';
import { WRITING_READING_QUESTIONS } from '../../../api/adapters';
import type { SummaryData } from './PracticeSummary';
import './WritingPractice.css';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

const total = WRITING_READING_QUESTIONS.length;

export function WritingPractice({ onBack, onComplete, onToast }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(total).fill(''));
  const [showReview, setShowReview] = useState(false);
  const startedAt = useRef(Date.now());
  const current = WRITING_READING_QUESTIONS[index];
  const answer = answers[index] ?? '';
  const lastQuestion = index === total - 1;

  function setAnswer(value: string) {
    setAnswers((previous) => previous.map((item, answerIndex) => answerIndex === index ? value : item));
  }

  function goToQuestion(nextIndex: number) {
    setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
  }

  function continuePractice() {
    if (!answer.trim()) {
      onToast(current.responseType === 'choice' ? '보기 중 하나를 선택해 주세요.' : '답을 입력해 주세요.');
      return;
    }
    if (lastQuestion) setShowReview(true);
    else goToQuestion(index + 1);
  }

  function completePractice() {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    onComplete({
      subject: 'writing',
      title: 'Muito bem!',
      message: '작문·독해 5문항을 풀고 예시 답안과 해설을 확인했어요.',
      stats: [
        { label: '제출 문항', value: String(total), suffix: `/ ${total}` },
        { label: '작성 답변', value: '4', suffix: '문항' },
        { label: '연습 시간', value: String(minutes), suffix: '분' },
      ],
      corrections: [],
      correctionsTitle: '학습 마무리',
      emptyCorrectionsMessage: '다섯 문항의 예시 답안과 해설을 확인했어요.',
    });
  }

  if (showReview) {
    return (
      <section className="writing-review" aria-labelledby="writing-review-title">
        <div className="writing-review__eyebrow">{WEEK.label} <i aria-hidden="true">/</i> 작문·독해</div>
        <h1 id="writing-review-title">정답과 예시 답안</h1>
        <p className="writing-review__intro">내 답변과 비교해 보세요.</p>
        <ol className="writing-review__list">
          {WRITING_READING_QUESTIONS.map((question, questionIndex) => (
            <li className="writing-review__card" key={question.id}>
              <span className="writing-review__label">
                {String(questionIndex + 1).padStart(2, '0')} <span>{question.label}</span>
              </span>
              <div className="writing-review__answer">
                <strong>{question.answer}</strong>
                <p>{question.explanation}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="writing-review__actions">
          <button type="button" className="writing-flow__button writing-flow__button--primary" onClick={completePractice}>
            종료하기 <ArrowIcon />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="writing-flow" aria-label="포르투갈어 작문·독해 연습">
      <div className="writing-flow__top">
        <span>{WEEK.label} <i aria-hidden="true">/</i> 작문·독해</span>
        <b aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</b>
      </div>
      <div
        className="writing-flow__progress"
        role="progressbar"
        aria-label="작문·독해 연습 진행"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        {WRITING_READING_QUESTIONS.map((question, step) => (
          <span key={question.id} className={step <= index ? 'is-complete' : ''} />
        ))}
      </div>

      <header className="writing-flow__heading" key={current.id}>
        <h1>{current.label}</h1>
        <p>{current.instruction}</p>
      </header>

      {current.promptType === 'boo' ? (
        <article className="writing-flow__boo-prompt">
          <img src="/owls/boo-writing.png" alt="" aria-hidden="true" draggable={false} />
          <div className="writing-flow__bubble">
            <span>{current.promptLabel}</span>
            <p lang="pt">{current.prompt}</p>
          </div>
        </article>
      ) : (
        <article className="writing-flow__reading-prompt">
          <span>{current.promptLabel}</span>
          <p lang="pt">{current.prompt}</p>
        </article>
      )}

      {current.responseType === 'choice' ? (
        <fieldset className="writing-flow__answer writing-flow__answer--choices">
          <legend>응답 선택</legend>
          <div className="writing-flow__choice-list">
            {current.options?.map((option) => (
              <button
                key={option}
                type="button"
                className={`writing-flow__choice${answer === option ? ' is-selected' : ''}`}
                aria-pressed={answer === option}
                onClick={() => setAnswer(option)}
              >
                <span className="writing-flow__radio" aria-hidden="true">{answer === option && <i />}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="writing-flow__answer">
          <label htmlFor="writing-flow-answer">내 답변</label>
          <textarea
            id="writing-flow-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={current.placeholder}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            rows={4}
          />
        </div>
      )}

      <footer className="writing-flow__footer">
        {index === 0 ? (
          <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={onBack}>
            <BackIcon /> 연습 선택
          </button>
        ) : (
          <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={() => goToQuestion(index - 1)}>
            <BackIcon /> 이전 문항
          </button>
        )}
        <button type="button" className="writing-flow__button writing-flow__button--primary" onClick={continuePractice}>
          {lastQuestion ? '제출하고 해설 보기' : '다음 문항'} <ArrowIcon />
        </button>
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
