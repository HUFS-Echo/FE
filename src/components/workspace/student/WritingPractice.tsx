import { useRef, useState } from 'react';
import { completePracticeSet, getPracticeSet, submitPracticeSet } from '../../../api/practiceSets';
import type { PracticeSummary as ApiPracticeSummary, Question, SubmitResponse } from '../../../api/types';
import { ApiEmptyState, ApiErrorState, ApiLoadingState, useApi } from '../../../api/useApi';
import type { SummaryData } from './PracticeSummary';
import './WritingPractice.css';

type Props = { onBack: () => void; onComplete: (data: SummaryData) => void; onToast: (message: string) => void; setId?: number };
type WritingQuestion = Question & { label: string; instruction: string; prompt: string; promptType: 'boo' | 'reading'; promptLabel: string; responseType: 'text' | 'choice'; placeholder: string };
const DEFAULT_SET_ID = 2;
function mapQuestion(question: Question, index: number): WritingQuestion {
  const promptType = question.prompt === 'boo' ? 'boo' : 'reading';
  return { ...question, label: question.typeLabel ?? `문항 ${index + 1}`, instruction: question.instruction ?? '글을 읽고 답을 작성하세요.', prompt: question.sentence, promptType, promptLabel: promptType === 'boo' ? 'Boo' : '읽을 글', responseType: question.answerType === 'CHOICE' || Boolean(question.choices?.length) ? 'choice' : 'text', placeholder: question.answerType === 'CHOICE' || question.choices?.length ? '' : '여기에 답을 적어 보세요' };
}
function toSummary(weekLabel: string, b6: SubmitResponse, b7: ApiPracticeSummary): SummaryData {
  return { subject: 'writing', weekLabel, title: b7.title || 'Muito bem!', message: b7.message || '작문·독해 연습을 마쳤어요.', stats: b7.stats.map((stat) => ({ label: stat.label, value: String(stat.value), suffix: stat.suffix })), corrections: b6.results.filter((result) => !result.correct).map((result) => ({ original: result.myAnswer || result.answer, corrected: result.answer })), correctionsTitle: '학습 마무리', emptyCorrectionsMessage: '다섯 문항의 예시 답안과 해설을 확인했어요.', responseData: { results: b6.results, completion: b7 } };
}

export function WritingPractice({ onBack, onComplete, onToast, setId = DEFAULT_SET_ID }: Props) {
  const { data: set, loading, error, retry } = useApi(() => getPracticeSet(setId), [setId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const startedAt = useRef(Date.now());
  const questions = (set?.questions ?? []).map(mapQuestion);
  if (loading) return <ApiLoadingState label="작문·독해 연습을 불러오는 중…" />;
  if (error) return <ApiErrorState error={error} onRetry={retry} />;
  if (!questions.length) return <ApiEmptyState message="아직 연습 문항이 없어요." />;
  const weekLabel = `${set?.week ?? 3}주차`;
  const total = questions.length;
  const current = questions[Math.min(index, total - 1)];
  const answer = answers[index] ?? '';
  const lastQuestion = index === total - 1;
  function setAnswer(value: string) { setAnswers((previous) => questions.map((_, answerIndex) => answerIndex === index ? value : previous[answerIndex] ?? '')); }
  function goToQuestion(nextIndex: number) { setIndex(Math.max(0, Math.min(total - 1, nextIndex))); }
  function continuePractice() {
    if (!answer.trim()) { onToast(current.responseType === 'choice' ? '보기 중 하나를 선택해 주세요.' : '답을 입력해 주세요.'); return; }
    if (lastQuestion) setShowReview(true); else goToQuestion(index + 1);
  }
  async function completePractice() {
    if (busy) return;
    setBusy(true); setActionError(null);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    try {
      const b6 = await submitPracticeSet(setId, questions.map((question, questionIndex) => ({ questionId: question.questionId, ...(question.choices?.length ? { choice: answers[questionIndex] ?? '' } : { text: answers[questionIndex] ?? '' }) })), elapsedSeconds);
      const { summary: b7 } = await completePracticeSet(setId, elapsedSeconds, b6.summary.correctCount, b6.summary.total);
      onComplete(toSummary(weekLabel, b6, b7));
    } catch (reason) { setActionError(reason instanceof Error ? reason : new Error('연습 결과를 저장하지 못했어요.')); }
    finally { setBusy(false); }
  }
  if (showReview) return (
    <section className="writing-review" aria-labelledby="writing-review-title">
      <div className="writing-review__eyebrow">{weekLabel} <i aria-hidden="true">/</i> 작문·독해</div><h1 id="writing-review-title">정답과 예시 답안</h1><p className="writing-review__intro">내 답변과 비교해 보세요.</p>
      <ol className="writing-review__list">{questions.map((question, questionIndex) => <li className="writing-review__card" key={question.questionId}><span className="writing-review__label">{String(questionIndex + 1).padStart(2, '0')} <span>{question.label}</span></span><div className="writing-review__answer"><strong>{question.answer}</strong><p>{question.explanation}</p></div></li>)}</ol>
      {actionError && <ApiErrorState error={actionError} onRetry={() => void completePractice()} />}
      <div className="writing-review__actions"><button type="button" className="writing-flow__button writing-flow__button--primary" onClick={() => void completePractice()} disabled={busy}>종료하기 <ArrowIcon /></button></div>{busy && <ApiLoadingState label="결과를 저장하는 중…" />}
    </section>
  );
  return (
    <section className="writing-flow" aria-label="포르투갈어 작문·독해 연습">
      <div className="writing-flow__top"><span>{weekLabel} <i aria-hidden="true">/</i> 작문·독해</span><b aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</b></div>
      <div className="writing-flow__progress" role="progressbar" aria-label="작문·독해 연습 진행" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1}>{questions.map((question, step) => <span key={question.questionId} className={step <= index ? 'is-complete' : ''} />)}</div>
      <header className="writing-flow__heading" key={current.questionId}><h1>{current.label}</h1><p>{current.instruction}</p></header>
      {current.promptType === 'boo' ? <article className="writing-flow__boo-prompt"><img src="/owls/boo-writing.png" alt="" aria-hidden="true" draggable={false} /><div className="writing-flow__bubble"><span>{current.promptLabel}</span><p lang="pt">{current.prompt}</p></div></article> : <article className="writing-flow__reading-prompt"><span>{current.promptLabel}</span><p lang="pt">{current.prompt}</p></article>}
      {current.responseType === 'choice' ? <fieldset className="writing-flow__answer writing-flow__answer--choices" disabled={busy}><legend>응답 선택</legend><div className="writing-flow__choice-list">{current.choices?.map((option) => <button key={option} type="button" className={`writing-flow__choice${answer === option ? ' is-selected' : ''}`} aria-pressed={answer === option} onClick={() => setAnswer(option)}><span className="writing-flow__radio" aria-hidden="true">{answer === option && <i />}</span><span>{option}</span></button>)}</div></fieldset> : <div className="writing-flow__answer"><label htmlFor="writing-flow-answer">내 답변</label><textarea id="writing-flow-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={current.placeholder} autoComplete="off" autoCapitalize="sentences" spellCheck={false} rows={4} /></div>}
      <footer className="writing-flow__footer">{index === 0 ? <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={onBack}><BackIcon /> 연습 선택</button> : <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={() => goToQuestion(index - 1)}><BackIcon /> 이전 문항</button>}<button type="button" className="writing-flow__button writing-flow__button--primary" onClick={continuePractice}>{lastQuestion ? '제출하고 해설 보기' : '다음 문항'} <ArrowIcon /></button></footer>
    </section>
  );
}
function BackIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4m3.5-3.5L4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
