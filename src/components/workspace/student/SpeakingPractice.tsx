import { useEffect, useRef, useState } from 'react';
import { SPEAKING_PRACTICE_QUESTIONS } from '../../../config/speakingPractice';
import { WEEK } from '../../../config/learning';
import type { SummaryData } from './PracticeSummary';
import './WritingPractice.css';
import './SpeakingPractice.css';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

const total = SPEAKING_PRACTICE_QUESTIONS.length;
const WAVEFORM = [8, 14, 22, 14, 30, 17, 9, 22, 34, 21, 13, 25, 15, 8, 17, 28, 19, 10, 24, 14, 8, 17, 12, 7];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SpeakingPractice({ onBack, onComplete, onToast }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(total).fill(''));
  const [recorded, setRecorded] = useState<boolean[]>(() => Array(total).fill(false));
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const startedAt = useRef(Date.now());
  const playbackFallback = useRef<number | null>(null);
  const question = SPEAKING_PRACTICE_QUESTIONS[index];
  const answer = answers[index] ?? '';
  const lastQuestion = index === total - 1;

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (playbackFallback.current !== null) window.clearTimeout(playbackFallback.current);
  }, []);

  function setAnswer(value: string) {
    setAnswers((previous) => previous.map((item, answerIndex) => answerIndex === index ? value : item));
  }

  function stopQuestionPlayback() {
    if (playbackFallback.current !== null) {
      window.clearTimeout(playbackFallback.current);
      playbackFallback.current = null;
    }
    setPlaying(false);
  }

  function playQuestion() {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      onToast('이 브라우저에서는 음성 재생을 지원하지 않아요.');
      return;
    }
    window.speechSynthesis.cancel();
    stopQuestionPlayback();
    const utterance = new SpeechSynthesisUtterance(question.prompt);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.88;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = stopQuestionPlayback;
    utterance.onerror = () => {
      if (window.speechSynthesis.getVoices().length > 0) stopQuestionPlayback();
    };
    setPlaying(true);
    playbackFallback.current = window.setTimeout(stopQuestionPlayback, Math.max(2500, question.prompt.length * 100));
    window.speechSynthesis.speak(utterance);
  }

  function startRecording() {
    setSeconds(0);
    setRecording(true);
  }

  function stopRecording() {
    setRecording(false);
    if (seconds < 1) {
      onToast('조금 더 길게 녹음해 주세요.');
      return;
    }
    setAnswer(question.answer);
    setRecorded((previous) => previous.map((value, answerIndex) => answerIndex === index ? true : value));
    onToast('예시 음성 답안을 기록했어요. (데모)');
  }

  function goToQuestion(nextIndex: number) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopQuestionPlayback();
    setSeconds(0);
    setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
  }

  function continuePractice() {
    if (recording) return;
    if (!answer.trim()) {
      onToast(question.responseType === 'choice' ? '보기 중 하나를 선택해 주세요.' : question.responseType === 'recording' ? '먼저 답변을 녹음해 주세요.' : '답을 입력해 주세요.');
      return;
    }
    if (lastQuestion) setShowReview(true);
    else goToQuestion(index + 1);
  }

  function completePractice() {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    const answeredCount = answers.filter((value) => value.trim()).length;
    onComplete({
      subject: 'speaking',
      title: 'Muito bem!',
      message: '회화 5문항을 풀고 예시 답안과 해설을 확인했어요.',
      stats: [
        { label: '제출 문항', value: String(total), suffix: `/ ${total}` },
        { label: '답변 완료', value: String(answeredCount), suffix: '문항' },
        { label: '연습 시간', value: String(minutes), suffix: '분' },
      ],
      corrections: [],
      correctionsTitle: '학습 마무리',
      emptyCorrectionsMessage: '다섯 문항의 예시 답안과 해설을 확인했어요.',
    });
  }

  if (showReview) {
    return (
      <section className="writing-review conversation-review" aria-labelledby="conversation-review-title">
        <div className="writing-review__eyebrow">{WEEK.label} <i aria-hidden="true">/</i> 회화</div>
        <h1 id="conversation-review-title">정답과 예시 답안</h1>
        <p className="writing-review__intro">내 답변과 비교해 보세요.</p>
        <ol className="writing-review__list">
          {SPEAKING_PRACTICE_QUESTIONS.map((item, questionIndex) => (
            <li className="writing-review__card" key={item.id}>
              <span className="writing-review__label">
                {String(questionIndex + 1).padStart(2, '0')} <span>{item.label}</span>
              </span>
              <div className="writing-review__answer">
                <strong lang="pt">{item.answer}</strong>
                <p>{item.explanation}</p>
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
    <section className="writing-flow conversation-flow" aria-label="포르투갈어 회화 연습">
      <div className="writing-flow__top">
        <span>{WEEK.label} <i aria-hidden="true">/</i> 회화</span>
        <b aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</b>
      </div>
      <div
        className="writing-flow__progress"
        role="progressbar"
        aria-label="회화 연습 진행"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        {SPEAKING_PRACTICE_QUESTIONS.map((item, step) => (
          <span key={item.id} className={step <= index ? 'is-complete' : ''} />
        ))}
      </div>

      <header className="writing-flow__heading" key={question.id}>
        <h1>{question.label}</h1>
        <p>{question.instruction}</p>
      </header>

      {question.promptType === 'audio' ? (
        <article className="writing-flow__boo-prompt conversation-audio-prompt">
          <img src="/owls/boo-writing.png" alt="" aria-hidden="true" draggable={false} />
          <div className="conversation-audio-card">
            <span className="conversation-audio-card__label">에코의 음성 질문</span>
            <div className="conversation-audio-card__controls">
              <button type="button" onClick={playQuestion} disabled={playing} aria-label={`${question.prompt} 포르투갈어 음성 듣기`}>
                <PlayIcon /> {playing ? '재생 중' : '질문 듣기'}
              </button>
              <span>포르투갈어 음성</span>
            </div>
            <div className={`conversation-waveform${playing ? ' is-playing' : ''}`} aria-hidden="true">
              {WAVEFORM.map((height, waveIndex) => (
                <i
                  key={waveIndex}
                  className={waveIndex < 11 ? 'is-active' : 'is-idle'}
                  style={{ height: `${height}px`, animationDelay: `${(waveIndex % 7) * 0.08}s` }}
                />
              ))}
            </div>
            <span className="sr-only" lang="pt">{question.prompt}</span>
          </div>
        </article>
      ) : question.promptType === 'boo' ? (
        <article className="writing-flow__boo-prompt conversation-bubble-prompt">
          <img src="/owls/boo-writing.png" alt="" aria-hidden="true" draggable={false} />
          <div className="writing-flow__bubble">
            <span>에코</span>
            <p lang="pt">{question.prompt}</p>
          </div>
        </article>
      ) : (
        <article className="writing-flow__reading-prompt conversation-sentence-prompt">
          <span>제시 문장</span>
          <p lang="pt">{question.prompt}</p>
        </article>
      )}

      {question.responseType === 'choice' ? (
        <fieldset className="writing-flow__answer writing-flow__answer--choices">
          <legend>응답 선택</legend>
          <div className="writing-flow__choice-list">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                className={`writing-flow__choice${answer === option ? ' is-selected' : ''}`}
                aria-pressed={answer === option}
                onClick={() => setAnswer(option)}
              >
                <span className="writing-flow__radio" aria-hidden="true">{answer === option && <i />}</span>
                <span lang="pt">{option}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : question.responseType === 'recording' ? (
        <div className="writing-flow__answer conversation-recording">
          <label>내 답변 녹음</label>
          <div className="conversation-recording__controls">
            <button type="button" onClick={recording ? stopRecording : startRecording} aria-pressed={recording}>
              {recording ? <StopIcon /> : <RecordIcon />}
              {recording ? '녹음 멈추기' : recorded[index] ? '다시 녹음' : '녹음 시작'}
            </button>
            <time aria-live="polite">{formatTime(seconds)}</time>
            {recorded[index] && <span className="conversation-recording__status">녹음 완료 · 예시 답안이 기록됐어요</span>}
          </div>
          {recording && (
            <div className="conversation-recording__wave" aria-hidden="true">
              {WAVEFORM.slice(0, 18).map((height, waveIndex) => <i key={waveIndex} style={{ height: `${height}px`, animationDelay: `${waveIndex * 0.04}s` }} />)}
            </div>
          )}
          {recorded[index] && <p className="conversation-recording__transcript" lang="pt">{answer}</p>}
        </div>
      ) : (
        <div className="writing-flow__answer conversation-text-answer">
          <label htmlFor="conversation-answer">내 답변</label>
          <textarea
            id="conversation-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={question.placeholder}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            rows={4}
          />
        </div>
      )}

      <footer className="writing-flow__footer">
        {index === 0 ? (
          <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={onBack} disabled={recording}>
            <BackIcon /> 연습 선택
          </button>
        ) : (
          <button type="button" className="writing-flow__button writing-flow__button--secondary" onClick={() => goToQuestion(index - 1)} disabled={recording}>
            <BackIcon /> 이전 문항
          </button>
        )}
        <button type="button" className="writing-flow__button writing-flow__button--primary" onClick={continuePractice} disabled={recording}>
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

function PlayIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.4 8 5 3.2Z" fill="currentColor" /></svg>;
}

function RecordIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4.1" fill="currentColor" /></svg>;
}

function StopIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4.3" y="4.3" width="7.4" height="7.4" rx="1" fill="currentColor" /></svg>;
}
