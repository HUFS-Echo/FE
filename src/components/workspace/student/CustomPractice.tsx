import { useMemo, useState } from 'react';
import { CORRECTION_HISTORY, getSubject, type HistoryItem } from '../../../config/learning';

type Props = {
  onBack: () => void;
  onHome: () => void;
};

type ReviewQuestion = Pick<
  HistoryItem,
  'id' | 'original' | 'corrected' | 'tag' | 'explanation' | 'repeat' | 'subject'
>;

function buildQuestions(): ReviewQuestion[] {
  const prioritized = [...CORRECTION_HISTORY].sort((a, b) => b.repeat - a.repeat);
  const unique = new Map<string, ReviewQuestion>();

  for (const item of prioritized) {
    const key = `${item.original}→${item.corrected}`;
    if (!unique.has(key)) unique.set(key, item);
  }

  return [...unique.values()].slice(0, 5);
}

function normalizeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('pt')
    .replace(/\s+/g, ' ')
    .replace(/[.!?,;:]+$/, '');
}

export function CustomPractice({ onBack, onHome }: Props) {
  const questions = useMemo(buildQuestions, []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isChecked = current ? Object.prototype.hasOwnProperty.call(checked, current.id) : false;
  const isCorrect = current ? checked[current.id] : false;
  const correctCount = Object.values(checked).filter(Boolean).length;
  const progress = questions.length ? (finished ? 100 : ((index + (isChecked ? 1 : 0)) / questions.length) * 100) : 0;

  function checkAnswer() {
    if (!current || !answer.trim() || isChecked) return;
    setChecked((previous) => ({
      ...previous,
      [current.id]: normalizeAnswer(answer) === normalizeAnswer(current.corrected),
    }));
  }

  function moveForward() {
    if (!current || !isChecked) return;
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setAnswer('');
  }

  return (
    <div className="custom-practice">
      <div className="custom-practice__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon /> 교정 기록으로
        </button>
        <span className="chip chip--blue">AI 맞춤 연습</span>
      </div>

      {!questions.length ? (
        <section className="custom-practice__empty">
          <span className="eyebrow">PERSONAL REVIEW</span>
          <h1>아직 맞춤 문제가 없어요</h1>
          <p>교정 기록이 쌓이면 틀렸던 문장을 바탕으로 연습 문제를 만들 수 있어요.</p>
          <button type="button" className="btn-solid" onClick={onBack}>교정 기록으로 돌아가기</button>
        </section>
      ) : finished ? (
        <>
          <header className="custom-practice__hero custom-practice__hero--complete">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · COMPLETE</span>
              <h1>맞춤 연습을 마쳤어요</h1>
              <p>교정 기록에서 자주 틀렸던 표현을 다시 확인했어요.</p>
            </div>
            <div className="custom-practice__score" aria-label={`정답 ${correctCount}개, 전체 ${questions.length}문제`}>
              <b>{correctCount}<small> / {questions.length}</small></b>
              <span>정답</span>
            </div>
          </header>

          <section className="custom-practice__results" aria-label="맞춤 연습 결과">
            {questions.map((question) => (
              <article className="custom-practice__result-row" key={question.id}>
                <span className={checked[question.id] ? 'custom-practice__result-mark is-correct' : 'custom-practice__result-mark is-wrong'} aria-hidden="true">
                  {checked[question.id] ? '✓' : '↻'}
                </span>
                <div>
                  <b>{question.tag} · {getSubject(question.subject).name}</b>
                  <p><span>{question.original}</span><i aria-hidden="true">→</i><strong>{question.corrected}</strong></p>
                </div>
              </article>
            ))}
          </section>

          <div className="custom-practice__actions">
            <button type="button" className="btn-ghost" onClick={onBack}>교정 기록으로</button>
            <button type="button" className="btn-solid" onClick={onHome}>홈으로 이동</button>
          </div>
        </>
      ) : current ? (
        <>
          <header className="custom-practice__hero">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · AI PRACTICE</span>
              <h1>틀렸던 표현을 다시 풀어봐요</h1>
              <p>교정 기록의 반복 오류를 우선으로 {questions.length}개 문제를 구성했어요.</p>
            </div>
            <div className="custom-practice__progress-copy">
              <b>{index + 1}<small> / {questions.length}</small></b>
              <span>문제</span>
            </div>
          </header>

          <div className="custom-practice__progress-track" role="progressbar" aria-label="맞춤 연습 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <i style={{ width: `${progress}%` }} />
          </div>

          <section className="custom-practice__question">
            <div className="custom-practice__question-meta">
              <span className="tag">{current.tag}</span>
              <span>{getSubject(current.subject).name}</span>
              {current.repeat > 1 && <b>반복 오류 {current.repeat}회</b>}
            </div>
            <p className="custom-practice__instruction">이전에 틀렸던 문장이에요. 올바르게 고쳐 써 보세요.</p>
            <blockquote>{current.original}</blockquote>
            <label className="custom-practice__answer">
              <span>올바른 문장</span>
              <textarea
                rows={3}
                value={answer}
                disabled={isChecked}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="포르투갈어 문장을 입력하세요"
                aria-label="교정한 포르투갈어 문장"
              />
            </label>

            {isChecked && (
              <div className={`custom-practice__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
                <b>{isCorrect ? '맞았어요!' : '다시 확인해 볼까요?'}</b>
                {!isCorrect && <p className="custom-practice__correct-answer">정답 · {current.corrected}</p>}
                <p>{current.explanation}</p>
              </div>
            )}

            <div className="custom-practice__question-actions">
              {!isChecked ? (
                <button type="button" className="btn-solid" onClick={checkAnswer} disabled={!answer.trim()}>
                  정답 확인
                </button>
              ) : (
                <button type="button" className="btn-solid" onClick={moveForward}>
                  {index === questions.length - 1 ? '결과 보기' : '다음 문제'}
                  <ArrowIcon />
                </button>
              )}
            </div>
          </section>
          <p className="custom-practice__note">데모 맞춤 연습 · 저장된 교정 기록을 바탕으로 문제를 구성합니다.</p>
        </>
      ) : null}
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10.5 3 5.5 8l5 5M6 8h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
