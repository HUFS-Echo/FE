import { useRef, useState } from 'react';
import { answerPracticeQuestion, completePracticeSet, getPracticeSet, submitPracticeSet } from '../../../api/practiceSets';
import type { PracticeSummary as ApiPracticeSummary, Question, SubmitResponse } from '../../../api/types';
import { ApiEmptyState, ApiErrorState, ApiLoadingState, useApi } from '../../../api/useApi';
import type { SubjectId, SummaryData } from './PracticeSummary';

type Props = { onBack: () => void; onComplete: (data: SummaryData) => void; onToast: (message: string) => void; setId?: number };
type GrammarQuestion = Question & { label: string; instruction: string; prompt: string; type: 'form' | 'fill' | 'correct' | 'choice' | 'rewrite' };
type Submission = { value: string; correct: boolean; correctAnswer: string; explanation: string };
const DEFAULT_SET_ID = 1;
const GRAMMAR_TYPES: GrammarQuestion['type'][] = ['form', 'fill', 'correct', 'rewrite', 'choice'];
const REVIEW_EXPLANATIONS = ['eu와 함께 쓰는 ser의 현재형은 sou예요.', 'varanda는 여성 단수 명사예요.', '일시적인 상태를 나타낼 때는 estar를 써요.', 'cozinha는 여성 명사라 sujo가 suja로 바뀌어요.', 'escritório는 남성 단수 명사예요.'];
function questionType(question: Question, index: number): GrammarQuestion['type'] {
  if (question.choices?.length) return 'choice';
  const byFormat: Partial<Record<Question['format'], GrammarQuestion['type']>> = { FORM_WRITE: 'form', FILL_BLANK: 'fill', FIX_PART: 'correct', REWRITE: 'rewrite' };
  return byFormat[question.format] ?? GRAMMAR_TYPES[index] ?? 'fill';
}
function mapQuestion(question: Question, index: number): GrammarQuestion { return { ...question, label: question.typeLabel ?? `문항 ${index + 1}`, instruction: question.instruction ?? '알맞은 답을 입력하세요.', prompt: question.prompt ?? question.sentence, type: questionType(question, index) }; }
function toSummary(subject: SubjectId, title: string, message: string, weekLabel: string, b6: SubmitResponse, b7: ApiPracticeSummary): SummaryData {
  const corrections = b6.results.filter((result) => !result.correct).map((result) => ({ original: result.myAnswer || result.answer, corrected: result.answer }));
  return { subject, title: b7.title || title, message: b7.message || message, weekLabel, stats: b7.stats.map((stat) => ({ label: stat.label, value: String(stat.value), suffix: stat.suffix })), corrections, responseData: { results: b6.results, completion: b7 } };
}

export function ReadingPractice({ onBack, onComplete, setId = DEFAULT_SET_ID }: Props) {
  const { data: set, loading, error, retry } = useApi(() => getPracticeSet(setId), [setId]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [showReview, setShowReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const startedAt = useRef(Date.now());
  const questions = (set?.questions ?? []).map(mapQuestion);
  if (loading) return <ApiLoadingState label="문법 연습을 불러오는 중…" />;
  if (error) return <ApiErrorState error={error} onRetry={retry} />;
  if (!questions.length) return <ApiEmptyState message="아직 연습 문항이 없어요." />;
  const weekLabel = `${set?.week ?? 3}주차`;
  const current = questions[Math.min(index, questions.length - 1)];
  const currentSubmission = submissions[current.questionId];
  const isLast = index === questions.length - 1;

  async function submitAnswer() {
    if (currentSubmission || !answer.trim() || busy) return;
    setBusy(true); setActionError(null);
    try {
      const result = await answerPracticeQuestion(setId, current.questionId, answer.trim());
      setSubmissions((previous) => ({ ...previous, [current.questionId]: { value: answer.trim(), correct: result.correct, correctAnswer: result.correctAnswer, explanation: result.explanation ?? current.explanation ?? '' } }));
      if (isLast) setShowReview(true);
    } catch (reason) { setActionError(reason instanceof Error ? reason : new Error('답변을 제출하지 못했어요.')); }
    finally { setBusy(false); }
  }
  function goToQuestion(nextIndex: number) { const next = questions[nextIndex]; setIndex(nextIndex); setAnswer(submissions[next.questionId]?.value ?? ''); setActionError(null); }
  function resetCurrent() { setSubmissions(({ [current.questionId]: _removed, ...remaining }) => remaining); setAnswer(''); }
  async function completePractice() {
    if (!currentSubmission || !isLast || busy) return;
    setBusy(true); setActionError(null);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    try {
      const b6 = await submitPracticeSet(setId, questions.map((question) => ({ questionId: question.questionId, text: submissions[question.questionId]?.value ?? '' })), elapsedSeconds);
      const correctCount = b6.summary.correctCount;
      const { summary: b7 } = await completePracticeSet(setId, elapsedSeconds, correctCount, b6.summary.total);
      onComplete(toSummary('grammar', 'Muito bem!', `문법 ${questions.length}문제를 모두 풀었어요. 오늘의 결과를 확인해 보세요.`, weekLabel, b6, b7));
    } catch (reason) { setActionError(reason instanceof Error ? reason : new Error('연습 결과를 저장하지 못했어요.')); }
    finally { setBusy(false); }
  }
  const answerFieldLabel = current.type === 'rewrite' ? '문장을 다시 써 보세요' : '답을 입력하세요';
  const inputPlaceholder = current.type === 'form' ? 'ser의 현재형을 입력하세요' : current.type === 'correct' ? '고친 동사를 입력하세요' : current.type === 'rewrite' ? 'A cozinha está ...' : '부정관사를 입력하세요';
  if (showReview) return (
    <section className="grammar-review" aria-labelledby="grammar-review-title">
      <div className="grammar-review__eyebrow">{weekLabel} <i aria-hidden="true">/</i> 문법</div><h1 id="grammar-review-title">정답과 예시 답안</h1><p className="grammar-review__intro">내 답변과 비교해 보세요.</p>
      <ol className="grammar-review__list">{questions.map((question, questionIndex) => <li className="grammar-review__card" key={question.questionId}><span className="grammar-review__label">{String(questionIndex + 1).padStart(2, '0')} {question.label}</span><div className="grammar-review__answer"><strong>{submissions[question.questionId]?.correctAnswer ?? question.answer}</strong><p>{REVIEW_EXPLANATIONS[questionIndex] ?? question.explanation ?? submissions[question.questionId]?.explanation}</p></div></li>)}</ol>
      {actionError && <ApiErrorState error={actionError} onRetry={() => void completePractice()} />}
      <button type="button" className="grammar-review__exit" onClick={() => void completePractice()} disabled={busy}>종료하기 <ArrowIcon /></button>{busy && <ApiLoadingState label="결과를 저장하는 중…" />}
    </section>
  );
  return (
    <section className="grammar-practice" aria-label="포르투갈어 문법 연습">
      <div className="grammar-practice__top"><span>{weekLabel} <i aria-hidden="true">/</i> 문법</span><b aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</b></div>
      <div className="grammar-progress" role="progressbar" aria-label="문법 연습 진행" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + (currentSubmission ? 1 : 0)}>{questions.map((question, step) => <span key={question.questionId} className={step < index || (step === index && currentSubmission) ? 'is-complete' : step === index ? 'is-current' : ''} />)}</div>
      <header className="grammar-practice__heading" key={current.questionId}><span className="grammar-practice__step">{String(index + 1).padStart(2, '0')} <i>/</i> {String(questions.length).padStart(2, '0')}</span><h1>{current.label}</h1><p>{current.instruction}</p></header>
      {index < 3 ? <article className="grammar-prompt grammar-prompt--boo"><div className="grammar-prompt__owl" aria-hidden="true"><img src="/owls/boo-writing.png" alt="" draggable={false} /></div><img className="grammar-prompt__bubble" src="/grammar-assets/green-speech-bubble.svg" alt="" aria-hidden="true" /><div className="grammar-prompt__copy"><span>Boo <i aria-hidden="true">·</i> 제시문</span><p>{current.prompt}</p></div></article> : <article className="grammar-prompt grammar-prompt--plain"><span>제시 문장</span><p>{current.prompt}</p></article>}
      {current.type === 'choice' ? <fieldset className="grammar-answer grammar-answer--choices" disabled={Boolean(currentSubmission) || busy}><legend>응답 선택</legend><div className="grammar-choice-list">{current.choices?.map((option, optionIndex) => { const selected = answer === option; return <button key={option} type="button" className={`grammar-choice${selected ? ' is-selected' : ''}${currentSubmission && option === currentSubmission.correctAnswer ? ' is-answer' : ''}`} aria-pressed={selected} onClick={() => setAnswer(option)}><span className="grammar-choice__radio" aria-hidden="true">{selected ? '✓' : String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></button>; })}</div></fieldset> : <div className="grammar-answer"><label htmlFor="grammar-answer-input">{current.type === 'form' || current.type === 'correct' ? '내 답변' : answerFieldLabel}</label><div className={`grammar-answer__field${currentSubmission ? currentSubmission.correct ? ' is-correct' : ' is-wrong' : ''}`}><input id="grammar-answer-input" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim() && !currentSubmission) void submitAnswer(); }} placeholder={inputPlaceholder} disabled={Boolean(currentSubmission) || busy} autoComplete="off" autoCapitalize={current.type === 'rewrite' ? 'sentences' : 'none'} spellCheck={false} />{current.type === 'form' && <span className="grammar-answer__suffix">eu +</span>}</div></div>}
      {currentSubmission && <div className={`grammar-feedback ${currentSubmission.correct ? 'is-correct' : 'is-wrong'}`} role="status"><span className="grammar-feedback__mark" aria-hidden="true">{currentSubmission.correct ? '✓' : '!'}</span><div><b>{currentSubmission.correct ? 'Muito bem!' : '다시 확인해 보세요'}</b><p>정답은 <strong>{currentSubmission.correctAnswer}</strong>예요. {currentSubmission.explanation}</p></div><button type="button" onClick={resetCurrent}>다시 풀기</button></div>}
      {actionError && <ApiErrorState error={actionError} onRetry={() => void submitAnswer()} />}{busy && <ApiLoadingState label="답변을 제출하는 중…" />}
      <footer className="grammar-practice__footer">{index > 0 ? <button type="button" className="grammar-button grammar-button--secondary" onClick={() => goToQuestion(index - 1)}><BackIcon /> 이전 문항</button> : <button type="button" className="grammar-button grammar-button--secondary" onClick={onBack}><BackIcon /> 연습 선택</button>}{currentSubmission ? <button type="button" className="grammar-button grammar-button--primary" onClick={isLast ? () => setShowReview(true) : () => goToQuestion(index + 1)}>{isLast ? '학습 완료하고 결과 보기' : '다음 문항'} <ArrowIcon /></button> : <button type="button" className="grammar-button grammar-button--primary" onClick={() => void submitAnswer()} disabled={!answer.trim() || busy}>제출하고 해설 보기 <ArrowIcon /></button>}</footer>
    </section>
  );
}
function BackIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4m3.5-3.5L4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
