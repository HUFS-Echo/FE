import { useMemo, useRef, useState } from 'react';
import {
  PDF_EXCERPT,
  READING_QUESTIONS,
  WEEK,
  type ReadingQuestion,
} from '../../../config/learning';
import type { SummaryData } from './PracticeSummary';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

type Status = 'idle' | 'correct' | 'wrong';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?]$/, '');
}

export function ReadingPractice({ onBack, onComplete, onToast }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [choice, setChoice] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrong, setWrong] = useState<ReadingQuestion[]>([]);
  const [flashPdf, setFlashPdf] = useState(false);
  const pdfRef = useRef<HTMLElement | null>(null);
  const flashTimer = useRef<number | null>(null);

  const current = READING_QUESTIONS[index];
  const next = READING_QUESTIONS[index + 1];
  const isLast = index === READING_QUESTIONS.length - 1;

  const highlightedLine = useMemo(() => {
    const source = current.source.toLowerCase();
    return PDF_EXCERPT.lines.find((line) => line.toLowerCase().includes(source)) ?? PDF_EXCERPT.lines[2];
  }, [current.source]);

  function resetQuestion() {
    setAnswer('');
    setChoice(null);
    setStatus('idle');
  }

  function check() {
    if (status !== 'idle') return;
    let ok = false;
    if (current.type === 'choice') {
      ok = choice === current.answer;
    } else if (current.type === 'rewrite') {
      const key = current.id === 'q3' ? 'um café' : 'uma água';
      ok = normalize(answer).includes(key);
    } else {
      ok = normalize(answer) === normalize(current.answer);
    }
    setStatus(ok ? 'correct' : 'wrong');
    if (ok) {
      setCorrectCount((count) => count + 1);
    } else {
      setWrong((items) => (items.some((item) => item.id === current.id) ? items : [...items, current]));
    }
  }

  function goNext() {
    if (status === 'idle') return;
    if (isLast) {
      const wrongCorrections = wrong.map((item) => ({
        original: item.type === 'rewrite' ? item.prompt ?? '' : `${item.before}___${item.after}`,
        corrected: item.type === 'rewrite' ? item.answer : `${item.before}${item.answer}${item.after}`,
      }));
      const total = READING_QUESTIONS.length;
      const accuracy = Math.round((correctCount / total) * 100);
      onComplete({
        subject: 'reading',
        title: 'Muito bem!',
        message: `부정관사 ${total}문제를 모두 풀었어요. 오늘의 결과를 확인해 보세요.`,
        stats: [
          { label: '정답', value: `${correctCount}`, suffix: `/ ${total}` },
          { label: '정확도', value: `${accuracy}`, suffix: '%' },
          { label: '연습 시간', value: '8', suffix: '분' },
        ],
        corrections: wrongCorrections,
      });
      return;
    }
    setIndex((value) => value + 1);
    resetQuestion();
  }

  function showPdf() {
    pdfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlashPdf(true);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashPdf(false), 1500);
  }

  return (
    <div className="reading">
      <div className="reading__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon />
          연습 홈
        </button>
        <div className="reading__top-meta">
          <span className="chip chip--blue">포르투갈어 문법 · {current.label}</span>
          <span className="chip">{WEEK.label}</span>
        </div>
      </div>

      <div className="reading__grid">
        <aside className={`pdf-card ${flashPdf ? 'is-flash' : ''}`} ref={pdfRef}>
          <header className="pdf-card__head">
            <div>
              <p className="eyebrow">TEXTBOOK · PDF</p>
              <b>포르투갈어 문법</b>
            </div>
            <span>{PDF_EXCERPT.page}쪽</span>
          </header>

          <div className="pdf-sheet">
            <div className="pdf-sheet__top">
              <span>UNIDADE 03</span>
              <span>29</span>
            </div>
            <p className="pdf-sheet__chapter">{PDF_EXCERPT.chapter}</p>
            <h3>{PDF_EXCERPT.title}</h3>
            <div className="pdf-sheet__rule" />
            {PDF_EXCERPT.lines.map((line) => (
              <p
                key={line}
                className={line === highlightedLine ? 'pdf-sheet__line is-hl' : 'pdf-sheet__line'}
              >
                {line}
              </p>
            ))}
            <p className="pdf-sheet__note">{PDF_EXCERPT.note}</p>
            <div className="pdf-sheet__foot">
              <span>Gramática aplicada</span>
              <span>29</span>
            </div>
          </div>

          <button type="button" className="pdf-card__link" onClick={showPdf}>
            교재에서 크게 보기
            <ArrowIcon />
          </button>
        </aside>

        <main className="reading__main">
          <div className="q-progress">
            <div className="q-progress__dots" aria-hidden="true">
              {READING_QUESTIONS.map((question, dotIndex) => (
                <i
                  key={question.id}
                  className={
                    dotIndex < index ? 'is-done' : dotIndex === index ? 'is-current' : ''
                  }
                />
              ))}
            </div>
            <span>
              {index + 1} / {READING_QUESTIONS.length}
            </span>
          </div>

          <article className={`question-card is-${status}`}>
            <header className="question-card__head">
              <span className="question-card__label">{current.label}</span>
              <span className="question-card__page">교재 {current.page}쪽</span>
            </header>

            <p className="question-card__instruction">{current.instruction}</p>

            {current.type === 'rewrite' ? (
              <div className="question-card__prompt">
                <span>다시 쓰기</span>
                <p>“{current.prompt}”</p>
              </div>
            ) : (
              <p className="question-card__sentence">
                {current.before}
                <span className={`blank ${status === 'correct' ? 'is-filled' : ''}`}>
                  {status === 'correct' ? current.answer : '____'}
                </span>
                {current.after}
              </p>
            )}

            {current.type === 'choice' ? (
              <>
                <div className="choice-row" role="group" aria-label="답 선택">
                  {current.options?.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={choice === option ? 'choice is-picked' : 'choice'}
                      aria-pressed={choice === option}
                      disabled={status !== 'idle'}
                      onClick={() => setChoice(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="choice-submit">
                  <button
                    type="button"
                    className="answer-row__check"
                    onClick={check}
                    disabled={status !== 'idle' || !choice}
                  >
                    채점하기
                  </button>
                </div>
              </>
            ) : (
              <div className="answer-row">
                <label htmlFor="reading-answer">
                  {current.type === 'rewrite' ? '문장을 다시 써 보세요' : '답을 입력하세요'}
                </label>
                <div className="answer-row__box">
                  <input
                    id="reading-answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        check();
                      }
                    }}
                    placeholder={current.type === 'rewrite' ? 'Eu quero ...' : 'um / uma'}
                    disabled={status !== 'idle'}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="answer-row__check"
                    onClick={check}
                    disabled={status !== 'idle' || !answer.trim()}
                  >
                    채점하기
                  </button>
                </div>
                <p className="answer-row__hint">{current.hint}</p>
              </div>
            )}

            {status !== 'idle' && (
              <div className={`feedback feedback--${status}`} role="status">
                <div className="feedback__icon" aria-hidden="true">
                  {status === 'correct' ? <CheckIcon /> : <CloseIcon />}
                </div>
                <div>
                  <b>{status === 'correct' ? 'Muito bem!' : '아쉬워요!'}</b>
                  <p>
                    정답은 <strong>{current.answer}</strong>예요. {current.explanation}
                  </p>
                  {status === 'wrong' && (
                    <button type="button" className="feedback__source" onClick={showPdf}>
                      교재 {current.page}쪽에서 다시 보기
                      <ArrowIcon />
                    </button>
                  )}
                </div>
              </div>
            )}

            <footer className={`question-card__foot ${status === 'idle' ? 'is-idle' : ''}`}>
              {status !== 'idle' && (
                <button type="button" className="text-link" onClick={() => onToast('피드백 신고가 접수되었어요. 교수님께 전달됩니다. (데모)')}>
                  피드백이 이상해요
                </button>
              )}
              <div className="question-card__actions">
                <button type="button" className="btn-ghost" onClick={resetQuestion} disabled={status === 'idle'}>
                  다시 풀기
                </button>
                <button type="button" className="btn-solid" onClick={goNext} disabled={status === 'idle'}>
                  {isLast ? '결과 보기' : '다음 문제'}
                  <ArrowIcon />
                </button>
              </div>
            </footer>
          </article>

          <section className="next-preview">
            <div className="next-preview__label">
              <span className="eyebrow">A SEGUIR</span>
              {next ? (
                <span className="chip">{next.label}</span>
              ) : (
                <span className="chip chip--mint">세트 완료</span>
              )}
            </div>
            {next ? (
              <>
                <p className="next-preview__sentence">
                  {next.type === 'rewrite'
                    ? `“${next.prompt}”`
                    : `${next.before}____${next.after}`}
                </p>
                <p className="next-preview__note">다음 문제는 {next.label} 유형이에요.</p>
              </>
            ) : (
              <p className="next-preview__note">마지막 문제예요. 결과를 확인해 보세요.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13 8H4M7.5 4.5 4 8l3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10.5 4 4L16 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
