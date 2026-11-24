import { useEffect, useRef, useState } from 'react';
import {
  INITIAL_MESSAGES,
  SUGGESTIONS,
  mockReply,
  type ChatMessage,
  type Correction,
} from '../../../config/demo';
import { SPEAKING_MISSION, WEEK } from '../../../config/learning';
import type { SummaryData } from './PracticeSummary';

type Props = {
  onBack: () => void;
  onComplete: (data: SummaryData) => void;
  onToast: (message: string) => void;
};

type MissionState = { order: boolean; price: boolean };

let sequence = 0;
const nextId = () => `sm${Date.now()}-${sequence++}`;

const WAVE = [10, 18, 26, 14, 30, 22, 12, 28, 18, 34, 16, 24, 12, 30, 20, 26, 14, 32, 18, 22, 10, 28, 16, 24];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function SpeakingPractice({ onBack, onComplete, onToast }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [translations, setTranslations] = useState<Set<string>>(
    () => new Set([INITIAL_MESSAGES[0].id]),
  );
  const [voiceIds, setVoiceIds] = useState<Set<string>>(() => new Set());
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mission, setMission] = useState<MissionState>({ order: false, price: false });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyTimer = useRef<number | null>(null);

  const doneCount = Number(mission.order) + Number(mission.price);
  const allDone = doneCount === SPEAKING_MISSION.goals.length;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ top: element.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [messages, typing, recording]);

  useEffect(
    () => () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  function send(text: string, viaVoice = false) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const turn = messages.filter((message) => message.role === 'user').length + 1;
    const id = nextId();
    setMessages((prev) => [...prev, { id, role: 'user', pt: trimmed }]);
    if (viaVoice) setVoiceIds((prev) => new Set(prev).add(id));
    setInput('');

    const lower = trimmed.toLowerCase();
    setMission((prev) => ({
      order: prev.order || SPEAKING_MISSION.goals[0].keywords.some((keyword) => lower.includes(keyword)),
      price: prev.price || SPEAKING_MISSION.goals[1].keywords.some((keyword) => lower.includes(keyword)),
    }));

    setTyping(true);
    replyTimer.current = window.setTimeout(() => {
      const reply = mockReply(trimmed, turn);
      setMessages((prev) => [...prev, { id: nextId(), role: 'ai', ...reply }]);
      setTyping(false);
    }, 900);
  }

  function startRecording() {
    if (typing) {
      onToast('에코가 답하는 중이에요. 잠시 후 다시 말해 주세요.');
      return;
    }
    setRecording(true);
    setSeconds(0);
  }

  function stopRecording() {
    setRecording(false);
    if (seconds < 1) {
      onToast('조금 더 길게 말해 주세요.');
      return;
    }
    const phrase = !mission.order
      ? 'Eu quero um café, por favor.'
      : !mission.price
        ? 'Quanto custa o café?'
        : 'Um pastel de nata, por favor.';
    onToast('음성을 텍스트로 변환했어요. (데모)');
    send(phrase, true);
  }

  function cancelRecording() {
    setRecording(false);
    setSeconds(0);
    onToast('녹음을 취소했어요.');
  }

  function toggleTranslation(id: string) {
    setTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function finish() {
    const userMessages = messages.filter((message) => message.role === 'user');
    if (userMessages.length === 0) {
      onToast('먼저 한 문장 이상 말해 주세요.');
      return;
    }
    const corrections = messages.flatMap((message) =>
      message.correction
        ? [
            {
              original: message.correction.original,
              corrected: message.correction.corrected,
            },
          ]
        : [],
    );
    const accuracy = Math.max(
      50,
      Math.round(100 - (corrections.length / Math.max(1, userMessages.length)) * 100),
    );
    onComplete({
      subject: 'speaking',
      title: 'Muito bem!',
      message: '카페 미션을 마쳤어요. 연습 결과를 확인해 보세요.',
      stats: [
        { label: '말한 문장', value: `${userMessages.length}`, suffix: '문장' },
          { label: '교정', value: `${corrections.length}`, suffix: '개' },
          { label: '정확도', value: `${accuracy}`, suffix: '%' },
        ],
      corrections,
    });
  }

  return (
    <div className="speaking">
      <div className="speaking__top">
        <button type="button" className="back-link" onClick={onBack}>
          <BackIcon />
          연습 홈
        </button>
        <div className="speaking__top-title">
          <span className="chip chip--mint">회화</span>
          <b>카페에서 주문하기</b>
          <span className="chip">약 10분</span>
        </div>
      </div>

      <section className={`mission-bar ${allDone ? 'is-done' : ''}`}>
        <div className="mission-bar__role">
          <p className="eyebrow">ROLE PLAY · {WEEK.label}</p>
          <b>{SPEAKING_MISSION.role}</b>
        </div>
        <div className="mission-bar__goals">
          {SPEAKING_MISSION.goals.map((goal, index) => {
            const done = index === 0 ? mission.order : mission.price;
            return (
              <span key={goal.id} className={done ? 'is-done' : ''}>
                <i aria-hidden="true">{done ? <CheckIcon /> : null}</i>
                {goal.label}
              </span>
            );
          })}
        </div>
        <div className="mission-bar__progress">
          <span>
            미션 {doneCount} / {SPEAKING_MISSION.goals.length}
          </span>
          <div>
            <i style={{ width: `${(doneCount / SPEAKING_MISSION.goals.length) * 100}%` }} />
          </div>
        </div>
        {allDone && <span className="mission-bar__badge">미션 완료</span>}
      </section>

      <div className="speaking__grid">
        <section className="sp-chat">
          <header className="sp-chat__head">
            <div className="sp-chat__who">
              <img src="/owls/football.png" alt="" draggable={false} />
              <div>
                <b>에코</b>
                <span>종업원 · AI 튜터</span>
              </div>
            </div>
            <span className="sp-chat__status">
              <i aria-hidden="true" />
              온라인
            </span>
          </header>

          <div className="sp-chat__scroll" ref={scrollRef}>
            <div className="sp-chat__date">오늘 · {WEEK.label} 연습</div>
            {messages.map((message) =>
              message.role === 'user' ? (
                <div className="sp-msg sp-msg--user" key={message.id}>
                  <div className="sp-msg__bubble">
                    <p>{message.pt}</p>
                    {voiceIds.has(message.id) && (
                      <span className="sp-msg__voice" aria-label="음성으로 입력">
                        <VoiceIcon />
                      </span>
                    )}
                  </div>
                  <span className="sp-msg__who">나</span>
                </div>
              ) : (
                <div className="sp-msg sp-msg--ai" key={message.id}>
                  <span className="sp-msg__avatar">
                    <img src="/owls/football.png" alt="" draggable={false} />
                  </span>
                  <div className="sp-msg__body">
                    <div className="sp-msg__bubble">
                      <p className="sp-msg__pt">{message.pt}</p>
                      {message.ko && (
                        <>
                          <button
                            type="button"
                            className="sp-msg__translate"
                            onClick={() => toggleTranslation(message.id)}
                          >
                            {translations.has(message.id) ? '번역 숨기기' : '번역 보기'}
                          </button>
                          {translations.has(message.id) && <p className="sp-msg__ko">{message.ko}</p>}
                        </>
                      )}
                    </div>
                    {message.correction && (
                      <CorrectionCard
                        correction={message.correction}
                        onReport={() => onToast('피드백 신고가 접수되었어요. 교수님께 전달됩니다. (데모)')}
                      />
                    )}
                    <span className="sp-msg__who">에코 · 종업원</span>
                  </div>
                </div>
              ),
            )}
            {typing && (
              <div className="sp-typing" aria-label="에코가 입력 중">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {recording ? (
            <div className="sp-recording">
              <span className="sp-recording__dot" aria-hidden="true" />
              <div className="sp-recording__wave" aria-hidden="true">
                {WAVE.map((height, index) => (
                  <i key={index} style={{ height: `${height}px`, animationDelay: `${index * 0.06}s` }} />
                ))}
              </div>
              <b>{formatTime(seconds)}</b>
              <button type="button" className="sp-recording__stop" onClick={stopRecording}>
                녹음 멈추기
              </button>
              <button type="button" className="sp-recording__cancel" onClick={cancelRecording}>
                취소
              </button>
            </div>
          ) : (
            <form
              className="sp-composer"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <div className="sp-suggestions">
                <span>이렇게 말해보세요</span>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    disabled={typing}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="sp-composer__box">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="포르투갈어로 입력하거나 말해보세요"
                  rows={2}
                  aria-label="포르투갈어 입력"
                />
                <div className="sp-composer__actions">
                  <button
                    type="button"
                    className="sp-composer__mic"
                    onClick={startRecording}
                    aria-label="음성으로 말하기"
                  >
                    <MicIcon />
                  </button>
                  <span className="sp-composer__hint">Enter 전송 · Shift+Enter 줄바꿈</span>
                  <button
                    type="submit"
                    className="sp-composer__send"
                    disabled={!input.trim() || typing}
                    aria-label="전송"
                  >
                    <ArrowIcon />
                  </button>
                </div>
              </div>
              <p className="sp-composer__note">음성은 텍스트로 바꾼 뒤 저장하지 않아요.</p>
            </form>
          )}
        </section>

        <aside className="sp-side">
          <div className="sp-side__card">
            <p className="eyebrow">이번 범위</p>
            <b>{SPEAKING_MISSION.title}</b>
            <span>{SPEAKING_MISSION.range} · {WEEK.label}</span>
          </div>

          <div className="sp-side__card">
            <p className="eyebrow">핵심 표현</p>
            <div className="sp-expressions">
              {SPEAKING_MISSION.expressions.map((expression) => (
                <button
                  key={expression}
                  type="button"
                  onClick={() => {
                    setInput(expression);
                    inputRef.current?.focus();
                  }}
                >
                  {expression}
                </button>
              ))}
            </div>
          </div>

          <div className="sp-side__card">
            <p className="eyebrow">미션 진행</p>
            <ul className="sp-missions">
              {SPEAKING_MISSION.goals.map((goal, index) => {
                const done = index === 0 ? mission.order : mission.price;
                return (
                  <li key={goal.id} className={done ? 'is-done' : ''}>
                    <span aria-hidden="true">{done ? <CheckIcon /> : null}</span>
                    {goal.label}
                  </li>
                );
              })}
            </ul>
            <div className="sp-side__bar">
              <i style={{ width: `${(doneCount / SPEAKING_MISSION.goals.length) * 100}%` }} />
            </div>
          </div>

          <button type="button" className="sp-finish" onClick={finish}>
            대화 마치고 피드백 보기
            <ArrowIcon />
          </button>
          <p className="sp-beta">음성은 텍스트로 바꾼 뒤 저장하지 않아요. (베타)</p>
        </aside>
      </div>
    </div>
  );
}

function CorrectionCard({ correction, onReport }: { correction: Correction; onReport: () => void }) {
  return (
    <div className="sp-correction">
      <div className="sp-correction__head">
        <span className="tag">{correction.tag}</span>
        <span>즉시 교정</span>
      </div>
      <p className="sp-correction__line">
        <span className="strike">{correction.original}</span>
        <ArrowIcon />
        <b>{correction.corrected}</b>
      </p>
      <p className="sp-correction__note">{correction.explanation}</p>
      <button type="button" className="text-link" onClick={onReport}>피드백이 이상해요</button>
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
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.5 3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="7.2" y="2.6" width="5.6" height="9" rx="2.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.8 9.4a5.2 5.2 0 0 0 10.4 0M10 14.6v3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 8h2l2-3 3 6 2-3h2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
