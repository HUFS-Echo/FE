import { useEffect, useMemo, useState } from 'react';
import { answerCustomPractice, getCustomPractice, getCustomPracticeProgress, saveCustomPracticeProgress } from '../../../api/customPractice';
import type { CustomPracticeQuestion } from '../../../api/types';
import { ApiEmptyState, ApiErrorState, ApiLoadingState, useApi } from '../../../api/useApi';

type Props = { practiceId: number; onBack: () => void };
type PracticeQuestion = { id: string; prompt: string; choices: string[]; answer: string; explanation: string; tag: string; courseTitle: string; repeat: number };
function mapQuestions(source: CustomPracticeQuestion[]): PracticeQuestion[] {
  return source.map((item) => ({ id: String(item.questionId), prompt: item.sentence, choices: item.choices, answer: item.choices[0] ?? '', explanation: item.explanation, tag: item.tag, courseTitle: item.courseTitle, repeat: item.repeatCount }));
}
export function CustomPractice({ practiceId, onBack }: Props) {
  const customApi = useApi(() => getCustomPractice(practiceId), [practiceId]);
  const restoredProgress = getCustomPracticeProgress(practiceId);
  const questions = useMemo(() => customApi.data?.questions ? mapQuestions(customApi.data.questions) : [], [customApi.data]);
  const [index, setIndex] = useState(() => restoredProgress?.index ?? 0);
  const [selected, setSelected] = useState<string | null>(() => restoredProgress?.selected ?? null);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, string>>(() => restoredProgress?.checkedAnswers ?? {});
  const [finished, setFinished] = useState(() => restoredProgress?.finished ?? false);
  const [actionError, setActionError] = useState<Error | null>(null);
  useEffect(() => { saveCustomPracticeProgress(practiceId, { index, selected, checkedAnswers, finished }); }, [practiceId, index, selected, checkedAnswers, finished]);
  useEffect(() => { const refresh = () => customApi.retry(); window.addEventListener('hufs-demo-change', refresh); return () => window.removeEventListener('hufs-demo-change', refresh); }, [customApi.retry]);

  const current = questions[index];
  const isChecked = current ? Object.prototype.hasOwnProperty.call(checkedAnswers, current.id) : false;
  const isCorrect = current ? checkedAnswers[current.id] === current.answer : false;
  const correctCount = questions.filter((question) => checkedAnswers[question.id] === question.answer).length;
  const progress = questions.length
    ? (finished ? 100 : ((index + (isChecked ? 1 : 0)) / questions.length) * 100)
    : 0;

  async function checkAnswer() {
    if (!current || selected === null || isChecked) return;
    setActionError(null);
    try { await answerCustomPractice(practiceId, Number(current.id), selected); setCheckedAnswers((previous) => ({ ...previous, [current.id]: selected })); }
    catch (reason) { setActionError(reason instanceof Error ? reason : new Error('답안을 확인하지 못했어요.')); }
  }

  function moveForward() {
    if (!current || !isChecked) return;
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  if (customApi.loading) return <ApiLoadingState label="맞춤 연습 문제를 불러오는 중…" />;
  if (customApi.error) return <ApiErrorState error={customApi.error} onRetry={() => window.dispatchEvent(new Event('hufs-demo-change'))} />;
  if (!customApi.data) return <ApiEmptyState message="맞춤 연습 세트를 찾을 수 없어요." />;
  return (
    <div className="custom-practice">
      <div className="custom-practice__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon /> 교정 기록으로
        </button>
        <span className="chip chip--blue">오답 유형 맞춤 연습</span>
      </div>

      {!questions.length ? (
        <section className="custom-practice__empty">
          <span className="eyebrow">PERSONAL REVIEW</span>
          <h1>아직 맞춤 문제를 만들 수 없어요</h1>
          <p>교정 기록에 문제가 쌓이면 오류 유형에 맞춘 새 문제를 풀 수 있어요.</p>
          <button type="button" className="btn-solid" onClick={onBack}>교정 기록으로 돌아가기</button>
        </section>
      ) : finished ? (
        <>
          <header className="custom-practice__hero custom-practice__hero--complete">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · COMPLETE</span>
              <h1>맞춤 연습을 마쳤어요</h1>
              <p>문항별 정답과 해설을 확인해 보세요. 이번 결과는 저장되지 않습니다.</p>
            </div>
            <div className="custom-practice__score" aria-label={`정답 ${correctCount}개, 전체 ${questions.length}문제`}>
              <b>{correctCount}<small> / {questions.length}</small></b>
              <span>정답</span>
            </div>
          </header>

          <section className="custom-practice__results" aria-label="맞춤 연습 결과와 해설">
            {questions.map((question, questionIndex) => {
              const answer = checkedAnswers[question.id];
              const answerIsCorrect = answer === question.answer;
              return (
                <article className="custom-practice__result-row" key={question.id}>
                  <span
                    className={`custom-practice__result-mark ${answerIsCorrect ? 'is-correct' : 'is-wrong'}`}
                    aria-label={answerIsCorrect ? '정답' : '오답'}
                  >
                    {answerIsCorrect ? '✓' : '×'}
                  </span>
                  <div className="custom-practice__result-content">
                    <b>{questionIndex + 1}번 · {question.tag} · {question.courseTitle}</b>
                    <p className="custom-practice__result-prompt">{question.prompt}</p>
                    <p className="custom-practice__result-answer">
                      <span>내 답</span>
                      <strong className={answerIsCorrect ? 'is-correct' : 'is-wrong'}>{answer}</strong>
                      {!answerIsCorrect && <><span>정답</span><strong className="is-correct">{question.answer}</strong></>}
                    </p>
                    <p className="custom-practice__result-explanation">{question.explanation}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="custom-practice__actions">
            <button type="button" className="btn-solid" onClick={onBack}>맞춤 연습 마치기</button>
          </div>
        </>
      ) : current ? (
        <>
          <header className="custom-practice__hero">
            <div>
              <span className="eyebrow">PERSONAL REVIEW · PRACTICE</span>
              <h1>오답 유형으로 새 문제를 풀어봐요</h1>
              <p>교정 기록에서 확인한 오류 유형과 반복 횟수를 바탕으로 새로운 문제 {questions.length}개를 구성했어요.</p>
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
              <span>{current.courseTitle}</span>
              {current.repeat > 0 && <b>반복 오류 {current.repeat}회</b>}
            </div>
            <p className="custom-practice__instruction">빈칸에 들어갈 알맞은 표현을 골라주세요.</p>
            <blockquote>{current.prompt}</blockquote>
            <div className="custom-practice__choices" role="group" aria-label="정답 선택지">
              {current.choices.map((choice, choiceIndex) => {
                const isSelected = selected === choice;
                const isRightChoice = isChecked && choice === current.answer;
                const isWrongChoice = isChecked && isSelected && !isCorrect;
                const className = [
                  'custom-practice__choice',
                  isSelected && 'is-selected',
                  isRightChoice && 'is-correct',
                  isWrongChoice && 'is-wrong',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    type="button"
                    className={className}
                    key={choice}
                    onClick={() => setSelected(choice)}
                    disabled={isChecked}
                    aria-pressed={isSelected}
                  >
                    <span className="custom-practice__choice-letter">{String.fromCharCode(65 + choiceIndex)}</span>
                    <span>{choice}</span>
                    {isRightChoice && <b className="custom-practice__choice-label">정답</b>}
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <div className={`custom-practice__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
                <b>{isCorrect ? '정답이에요!' : '아쉬워요. 정답을 확인해 보세요.'}</b>
                {!isCorrect && <p className="custom-practice__correct-answer">정답 · {current.answer}</p>}
                <p>{current.explanation}</p>
              </div>
            )}

            {actionError && <ApiErrorState error={actionError} onRetry={() => void checkAnswer()} />}
            <div className="custom-practice__question-actions">
              {!isChecked ? (
                <button type="button" className="btn-solid" onClick={() => void checkAnswer()} disabled={selected === null}>
                  정답 확인
                </button>
              ) : (
                <button type="button" className="btn-solid" onClick={moveForward}>
                  {index === questions.length - 1 ? '결과와 해설 보기' : '다음 문제'}
                  <ArrowIcon />
                </button>
              )}
            </div>
          </section>
          <p className="custom-practice__note">화면 데모 · 맞춤 연습의 답안과 결과는 저장되지 않습니다.</p>
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
